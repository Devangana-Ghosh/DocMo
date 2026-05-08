import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

type AssistantRole = 'patient' | 'doctor' | 'lab' | 'guest';

type RequestBody = {
  role?: AssistantRole;
  message?: string;
  conversation?: Array<{ role: 'user' | 'assistant'; content: string }>;
  locale?: string;
  appContext?: string;
};

type DrugContext = {
  medication?: string;
  rxNorm?: { name: string; rxcui: string } | null;
  recalls: string[];
  adverseSignals: string[];
  labelWarnings: string[];
};

const MEDICATION_ALIASES: Record<string, string> = {
  zantacdo: 'zantac',
  zantacdoes: 'zantac',
  zantacs: 'zantac',
  ranitidinedo: 'ranitidine',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: CORS_HEADERS,
  });
}

function getMedicationCandidates(message: string) {
  const normalized = message
    .toLowerCase()
    .replace(/([a-z])(do|does|did|is|are|can|should)$/i, '$1')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const stopwords = new Set([
    'doctor', 'lab', 'patient', 'prescription', 'app', 'help', 'risk', 'risks', 'side', 'effects',
    'medicine', 'medicines', 'drug', 'drugs', 'appointment', 'appointments', 'for', 'about', 'with',
    'and', 'the', 'what', 'how', 'can', 'should', 'show', 'tell', 'me', 'my', 'our', 'please',
    'does', 'do', 'did', 'have', 'has', 'it', 'this', 'that', 'from', 'into', 'on', 'in', 'to',
  ]);

  const tokens = normalized
    .split(' ')
    .filter((word) => word.length >= 3 && !stopwords.has(word));

  const unique = Array.from(new Set(tokens));
  return unique;
}

function normalizeMedicationCandidate(candidate: string) {
  const lowered = candidate.toLowerCase();
  if (MEDICATION_ALIASES[lowered]) {
    return MEDICATION_ALIASES[lowered];
  }

  const suffixTrimmed = lowered.replace(/(does|do|did|have|has|is|are)$/i, '');
  if (suffixTrimmed.length >= 3) {
    return MEDICATION_ALIASES[suffixTrimmed] ?? suffixTrimmed;
  }

  return lowered;
}

async function resolveMedicationFromMessage(message: string) {
  const candidates = getMedicationCandidates(message);
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeMedicationCandidate(candidate);
    const rxNorm = await fetchRxNorm(normalizedCandidate).catch(() => null);
    if (rxNorm) {
      return {
        medication: normalizedCandidate,
        rxNorm,
      };
    }
  }

  return {
    medication: undefined,
    rxNorm: null,
  };
}

async function fetchRxNorm(term: string) {
  const url = new URL('https://rxnav.nlm.nih.gov/REST/drugs.json');
  url.searchParams.set('name', term);

  const response = await fetch(url.toString());
  if (!response.ok) return null;

  const payload = (await response.json()) as {
    drugGroup?: {
      conceptGroup?: Array<{
        conceptProperties?: Array<{ name?: string; rxcui?: string }>;
      }>;
    };
  };

  for (const group of payload.drugGroup?.conceptGroup ?? []) {
    for (const concept of group.conceptProperties ?? []) {
      if (concept.name && concept.rxcui) {
        return { name: concept.name, rxcui: concept.rxcui };
      }
    }
  }

  return null;
}

async function fetchOpenFdaLabel(term: string) {
  const url = new URL('https://api.fda.gov/drug/label.json');
  url.searchParams.set('search', `openfda.generic_name:"${term}"`);
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString());
  if (!response.ok) return [] as string[];

  const payload = (await response.json()) as {
    results?: Array<{
      warnings?: string[];
      boxed_warning?: string[];
    }>;
  };

  const first = payload.results?.[0];
  const warnings = [...(first?.boxed_warning ?? []), ...(first?.warnings ?? [])]
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 2);

  return warnings;
}

async function fetchOpenFdaRecalls(term: string) {
  const url = new URL('https://api.fda.gov/drug/enforcement.json');
  url.searchParams.set('search', `product_description:"${term}"`);
  url.searchParams.set('limit', '3');

  const response = await fetch(url.toString());
  if (!response.ok) return [] as string[];

  const payload = (await response.json()) as {
    results?: Array<{ reason_for_recall?: string; classification?: string; recalling_firm?: string }>;
  };

  return (payload.results ?? [])
    .map((item) => {
      const reason = item.reason_for_recall?.replace(/\s+/g, ' ').trim();
      if (!reason) return null;
      return `${item.classification ?? 'Recall'}: ${reason}${item.recalling_firm ? ` (${item.recalling_firm})` : ''}`;
    })
    .filter((value): value is string => Boolean(value))
    .slice(0, 3);
}

async function fetchOpenFdaEvents(term: string) {
  const url = new URL('https://api.fda.gov/drug/event.json');
  url.searchParams.set('search', `patient.drug.medicinalproduct:"${term}"`);
  url.searchParams.set('limit', '3');

  const response = await fetch(url.toString());
  if (!response.ok) return [] as string[];

  const payload = (await response.json()) as {
    results?: Array<{
      patient?: {
        reaction?: Array<{ reactionmeddrapt?: string }>;
      };
    }>;
  };

  const reactions = new Set<string>();
  for (const event of payload.results ?? []) {
    for (const reaction of event.patient?.reaction ?? []) {
      if (reaction.reactionmeddrapt) {
        reactions.add(reaction.reactionmeddrapt);
      }
    }
  }

  return Array.from(reactions).slice(0, 5);
}

async function getDrugContext(message: string): Promise<DrugContext> {
  const resolved = await resolveMedicationFromMessage(message);
  if (!resolved.medication || !resolved.rxNorm) {
    return {
      recalls: [],
      adverseSignals: [],
      labelWarnings: [],
    };
  }

  const [labelWarnings, recalls, adverseSignals] = await Promise.all([
    fetchOpenFdaLabel(resolved.medication).catch(() => []),
    fetchOpenFdaRecalls(resolved.medication).catch(() => []),
    fetchOpenFdaEvents(resolved.medication).catch(() => []),
  ]);

  return {
    medication: resolved.medication,
    rxNorm: resolved.rxNorm,
    recalls,
    adverseSignals,
    labelWarnings,
  };
}

function roleInstructions(role: AssistantRole) {
  if (role === 'doctor') {
    return 'You are a doctor copilot. Be concise, clinically practical, and safety-first. Do not provide definitive diagnosis. Highlight openFDA recall or warning signals and suggest verification steps.';
  }

  if (role === 'lab') {
    return 'You are a lab assistant copilot. Focus on test workflow, interpretation caution, specimen/process guidance, and medication safety context. Keep advice operational and avoid diagnosis.';
  }

  if (role === 'patient' || role === 'guest') {
    return 'You are a patient-facing assistant. Explain prescriptions and app features in simple language, mention safety warnings gently, and recommend contacting a doctor for medical decisions.';
  }

  return 'You are a healthcare app assistant.';
}

function localeInstructions(locale?: string) {
  if (!locale) return 'Respond in clear English.';
  if (locale.startsWith('hi')) return 'Respond in Hindi unless user writes in another language.';
  if (locale.startsWith('ta')) return 'Respond in Tamil unless user writes in another language.';
  return 'Respond in clear English.';
}

function buildContextBlock(context: DrugContext) {
  const lines: string[] = [];

  if (context.medication) {
    lines.push(`Medication term detected: ${context.medication}`);
  }
  if (context.rxNorm) {
    lines.push(`RxNorm match: ${context.rxNorm.name} (RxCUI ${context.rxNorm.rxcui})`);
  }
  if (context.labelWarnings.length) {
    lines.push(`openFDA label warnings: ${context.labelWarnings.join(' | ')}`);
  }
  if (context.recalls.length) {
    lines.push(`openFDA recalls: ${context.recalls.join(' | ')}`);
  }
  if (context.adverseSignals.length) {
    lines.push(`openFDA adverse signals: ${context.adverseSignals.join(', ')}`);
  }

  return lines.join('\n');
}

function isDirectNavigationIntent(message: string) {
  const text = message.toLowerCase();
  return text.includes('open ') || text.includes('go to ') || text.includes('navigate ') || text.includes('take me to ');
}

function navigationReply(role: AssistantRole, userMessage: string) {
  if (role === 'doctor') {
    return `I can help with doctor workflows. I redirected you when possible and you can also ask:\n- Open doctor appointments\n- Open patient list\n- Open doctor prescriptions\n- Open availability\n\nRequest: "${userMessage}"`;
  }

  if (role === 'lab') {
    return `I can help with lab workflows. I redirected you when possible and you can also ask:\n- Open lab dashboard\n- Open lab reports\n- Open upload page\n\nRequest: "${userMessage}"`;
  }

  return `I can help with patient features. I redirected you when possible and you can also ask:\n- Show my prescriptions\n- Open my appointments\n- Find doctor for cardiology\n- Open my documents\n\nRequest: "${userMessage}"`;
}

function fallbackReply(role: AssistantRole, context: DrugContext, userMessage: string) {
  const intro = role === 'doctor'
    ? 'Doctor Copilot summary:'
    : role === 'lab'
      ? 'Lab Copilot summary:'
      : 'Patient Assistant summary:';

  const bullets: string[] = [];

  if (context.rxNorm) {
    bullets.push(`RxNorm identified ${context.rxNorm.name} (RxCUI ${context.rxNorm.rxcui}).`);
  } else {
    bullets.push('No confident RxNorm medication match was found from your message. Include exact drug name for better checks.');
  }

  if (context.labelWarnings.length) {
    bullets.push(`Label warning snapshot: ${context.labelWarnings[0]}`);
  }

  if (context.recalls.length) {
    bullets.push(`Recall signal: ${context.recalls[0]}`);
  } else {
    bullets.push('No immediate recall result found in this quick check.');
  }

  if (context.adverseSignals.length) {
    bullets.push(`Common reported adverse terms: ${context.adverseSignals.slice(0, 3).join(', ')}.`);
  }

  if (role === 'patient' || role === 'guest') {
    bullets.push('For personal treatment decisions, confirm with your doctor before changing medication.');
  } else {
    bullets.push('Use this as decision support; verify with patient history, interactions, and local protocols.');
  }

  return `${intro}\n- ${bullets.join('\n- ')}\n\nQuestion received: "${userMessage}"`;
}

async function tryOpenAiResponse(params: {
  role: AssistantRole;
  userMessage: string;
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>;
  context: DrugContext;
  locale?: string;
  appContext?: string;
}) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return null;

  const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o';
  const contextBlock = buildContextBlock(params.context);

  const messages = [
    {
      role: 'system',
      content: `${roleInstructions(params.role)}\n${localeInstructions(params.locale)}\nRespond in concise bullet points when possible. Include a short disclaimer for medical uncertainty.`,
    },
    {
      role: 'system',
      content: contextBlock || 'No external medication context could be extracted.',
    },
    {
      role: 'system',
      content: `Application context: ${params.appContext || 'No app context provided.'}`,
    },
    ...params.conversation.map((item) => ({ role: item.role, content: item.content })),
    { role: 'user', content: params.userMessage },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      max_tokens: 450,
    }),
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return payload.choices?.[0]?.message?.content?.trim() || null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = (await req.json()) as RequestBody;
    const role: AssistantRole = body.role ?? 'guest';
    const userMessage = body.message?.trim();
    const locale = body.locale;
    const appContext = body.appContext;

    if (!userMessage) {
      return json({ error: 'message is required' }, 400);
    }

    if (isDirectNavigationIntent(userMessage)) {
      return json({
        reply: navigationReply(role, userMessage),
        sources: ['App'],
        usedLlm: false,
      });
    }

    const conversation = (body.conversation ?? []).slice(-8);
    const context = await getDrugContext(userMessage);

    const llmReply = await tryOpenAiResponse({
      role,
      userMessage,
      conversation,
      context,
      locale,
      appContext,
    }).catch(() => null);

    const reply = llmReply ?? fallbackReply(role, context, userMessage);

    const sources = [
      ...(context.rxNorm ? ['RxNorm'] : []),
      ...((context.labelWarnings.length || context.recalls.length || context.adverseSignals.length) ? ['openFDA'] : []),
      ...(llmReply ? ['LLM'] : []),
    ];

    return json({
      reply,
      sources,
      usedLlm: Boolean(llmReply),
    });
  } catch (error) {
    return json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 400);
  }
});
