import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Send } from 'lucide-react';
import { fetchOpenFdaDrugInteractionText, fetchRxNormSuggestions, type RxNormConcept } from '../../services/integrations';
import type { Prescription } from '../../types/backend';

export interface PrescriptionFormValues {
  patientId: string;
  medicationName: string;
  medicationNormalized: string;
  rxcui: string;
  rxnormVerified: boolean;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: 'Active' | 'Completed' | 'Refill Needed' | 'Cancelled';
  refillsRemaining: number;
}

const DEFAULT_VALUES: PrescriptionFormValues = {
  patientId: '',
  medicationName: '',
  medicationNormalized: '',
  rxcui: '',
  rxnormVerified: false,
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
  status: 'Active',
  refillsRemaining: 2,
};

interface PrescriptionFormProps {
  patientOptions: { value: string; label: string }[];
  existingPrescriptions?: Prescription[];
  onSubmitPrescription: (values: PrescriptionFormValues) => Promise<void>;
  initialValues?: Partial<PrescriptionFormValues>;
  submitLabel?: string;
}

type ConflictSeverity = 'high' | 'moderate';

type MedicationConflict = {
  severity: ConflictSeverity;
  withMedication: string;
  reason: string;
};

type InteractionRule = {
  severity: ConflictSeverity;
  a: string[];
  b: string[];
  reason: string;
};

const INTERACTION_RULES: InteractionRule[] = [
  {
    severity: 'high',
    a: ['warfarin'],
    b: ['ibuprofen', 'naproxen', 'aspirin', 'diclofenac'],
    reason: 'Increased bleeding risk when anticoagulants are combined with NSAIDs.',
  },
  {
    severity: 'high',
    a: ['sildenafil', 'tadalafil', 'vardenafil'],
    b: ['nitroglycerin', 'isosorbide'],
    reason: 'Can cause severe hypotension with nitrate therapy.',
  },
  {
    severity: 'high',
    a: ['clarithromycin', 'erythromycin'],
    b: ['simvastatin', 'atorvastatin'],
    reason: 'Risk of statin toxicity and myopathy with strong CYP inhibition.',
  },
  {
    severity: 'moderate',
    a: ['tramadol'],
    b: ['sertraline', 'fluoxetine', 'escitalopram', 'venlafaxine'],
    reason: 'Possible serotonin syndrome risk; monitor closely.',
  },
  {
    severity: 'moderate',
    a: ['metformin'],
    b: ['glimepiride', 'gliclazide', 'insulin'],
    reason: 'Additive glucose-lowering effect; monitor for hypoglycemia.',
  },
];

function parseMedicationFromRxNormLabel(label: string) {
  const dosageMatch = label.match(/\b(\d+(?:\.\d+)?)\s*(MG|MCG|G|ML|IU|UNITS|MEQ|MMOL)(?:\s*\/\s*(ML|L|HR|ACTUAT))?\b/i);

  if (!dosageMatch) {
    return {
      medicationName: label.trim(),
      dosage: '',
    };
  }

  const value = dosageMatch[1];
  const unit = dosageMatch[2].toUpperCase();
  const per = dosageMatch[3]?.toUpperCase();
  const dosage = per ? `${value} ${unit}/${per}` : `${value} ${unit}`;

  const cleanedName = label
    .replace(dosageMatch[0], '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    medicationName: cleanedName || label.trim(),
    dosage,
  };
}

function normalizeMedicationName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function medicationMatches(name: string, terms: string[]) {
  const normalized = normalizeMedicationName(name);
  return terms.some((term) => normalized.includes(term));
}

function summarizeInteractionText(value: string) {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (compact.length <= 220) return compact;
  return `${compact.slice(0, 220)}...`;
}

function severityFromText(value: string): ConflictSeverity {
  const text = value.toLowerCase();
  if (text.includes('contraindicat') || text.includes('major') || text.includes('severe') || text.includes('fatal')) {
    return 'high';
  }
  return 'moderate';
}

function primaryMedicationKeyword(value: string) {
  return normalizeMedicationName(value).split(' ').find((term) => term.length >= 3) ?? '';
}

function detectMedicationConflicts(currentMedication: string, activePrescriptions: Prescription[]): MedicationConflict[] {
  if (!currentMedication.trim()) return [];

  const conflicts: MedicationConflict[] = [];
  const uniqueKey = new Set<string>();

  activePrescriptions.forEach((item) => {
    const existing = item.medication_normalized ?? item.medication_name;

    INTERACTION_RULES.forEach((rule) => {
      const forward = medicationMatches(currentMedication, rule.a) && medicationMatches(existing, rule.b);
      const backward = medicationMatches(currentMedication, rule.b) && medicationMatches(existing, rule.a);
      if (!forward && !backward) return;

      const dedupe = `${rule.reason}-${existing}`;
      if (uniqueKey.has(dedupe)) return;

      uniqueKey.add(dedupe);
      conflicts.push({
        severity: rule.severity,
        withMedication: item.medication_name,
        reason: rule.reason,
      });
    });
  });

  return conflicts;
}

export function PrescriptionForm({ patientOptions, existingPrescriptions = [], onSubmitPrescription, initialValues, submitLabel = 'Issue Prescription' }: PrescriptionFormProps) {
  const [values, setValues] = useState<PrescriptionFormValues>({ ...DEFAULT_VALUES, ...initialValues });
  const [submitting, setSubmitting] = useState(false);
  const [rxNormSuggestions, setRxNormSuggestions] = useState<RxNormConcept[]>([]);
  const [apiConflicts, setApiConflicts] = useState<MedicationConflict[]>([]);
  const openFdaCacheRef = useRef<Map<string, string | null>>(new Map());

  useEffect(() => {
    setValues({ ...DEFAULT_VALUES, ...initialValues });
  }, [initialValues]);

  useEffect(() => {
    const term = values.medicationName.trim();
    if (term.length < 2) {
      setRxNormSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const suggestions = await fetchRxNormSuggestions(term);
        setRxNormSuggestions(suggestions);
      } catch {
        setRxNormSuggestions([]);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [values.medicationName]);

  useEffect(() => {
    const normalizedInput = normalizeMedicationName(values.medicationName);
    const match = rxNormSuggestions.find((item) => {
      const normalizedName = normalizeMedicationName(item.name);
      const normalizedSynonym = normalizeMedicationName(item.synonym ?? '');
      return (
        normalizedName === normalizedInput ||
        normalizedSynonym === normalizedInput ||
        normalizedName.startsWith(`${normalizedInput} `) ||
        normalizedSynonym.startsWith(`${normalizedInput} `)
      );
    });

    if (!match) {
      setValues((current) => ({
        ...current,
        medicationNormalized: current.medicationName,
        rxcui: '',
        rxnormVerified: false,
      }));
      return;
    }

    const parsed = parseMedicationFromRxNormLabel(match.name);

    setValues((current) => ({
      ...current,
      medicationName: parsed.medicationName,
      medicationNormalized: match.synonym ?? match.name,
      rxcui: match.rxcui,
      rxnormVerified: true,
      dosage: parsed.dosage || current.dosage,
    }));
  }, [rxNormSuggestions, values.medicationName]);

  const duplicateTherapy = existingPrescriptions.find((item) => {
    if (item.patient_id !== values.patientId) return false;
    if (item.status === 'Cancelled' || item.status === 'Completed') return false;

    if (values.rxcui && item.rxcui) {
      return values.rxcui === item.rxcui;
    }

    const normalizedCurrent = values.medicationNormalized.trim().toLowerCase();
    const normalizedExisting = (item.medication_normalized ?? item.medication_name).trim().toLowerCase();
    return Boolean(normalizedCurrent && normalizedCurrent === normalizedExisting);
  });

  const patientMedicationHistory = useMemo(
    () =>
      existingPrescriptions
        .filter((item) => item.patient_id === values.patientId)
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()),
    [existingPrescriptions, values.patientId],
  );

  const activePatientMeds = useMemo(
    () => patientMedicationHistory.filter((item) => item.status === 'Active' || item.status === 'Refill Needed'),
    [patientMedicationHistory],
  );
  const ruleConflicts = useMemo(
    () => detectMedicationConflicts(values.medicationNormalized || values.medicationName, activePatientMeds),
    [values.medicationNormalized, values.medicationName, activePatientMeds],
  );

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      void loadApiConflicts();
    }, 350);

    async function loadApiConflicts() {
      if (!values.patientId || !values.medicationName.trim()) {
        setApiConflicts([]);
        return;
      }

      const candidates = activePatientMeds
        .filter((item) => item.status !== 'Cancelled' && item.status !== 'Completed')
        .slice(0, 10);

      if (!candidates.length) {
        setApiConflicts([]);
        return;
      }

      const sourceMedication = values.medicationName.trim() || values.medicationNormalized.trim();
      const sourceKeyword = primaryMedicationKeyword(sourceMedication);
      let interactionText = '';

      const sourceCacheKey = normalizeMedicationName(sourceMedication);
      if (openFdaCacheRef.current.has(sourceCacheKey)) {
        interactionText = (openFdaCacheRef.current.get(sourceCacheKey) ?? '').toLowerCase();
      } else {
        try {
          const fromOpenFda = await fetchOpenFdaDrugInteractionText(sourceMedication);
          openFdaCacheRef.current.set(sourceCacheKey, fromOpenFda ?? null);
          interactionText = (fromOpenFda ?? '').toLowerCase();
        } catch {
          openFdaCacheRef.current.set(sourceCacheKey, null);
          interactionText = '';
        }
      }

      if (!interactionText) {
        setApiConflicts([]);
        return;
      }

      const checks = await Promise.all(
        candidates.map(async (item) => {
          const normalizedExisting = normalizeMedicationName(item.medication_normalized ?? item.medication_name);
          const terms = normalizedExisting.split(' ').filter((term) => term.length >= 4);
          const existingKeyword = primaryMedicationKeyword(item.medication_normalized ?? item.medication_name);
          if (!terms.length && !existingKeyword) return null;

          const matched = terms.some((term) => interactionText.includes(term));
          if (matched) {
            const snippet = summarizeInteractionText(interactionText);
            return {
              severity: severityFromText(interactionText),
              withMedication: item.medication_name,
              reason: `openFDA label notes potential interaction: ${snippet}`,
            } as MedicationConflict;
          }

          if (!existingKeyword || !sourceKeyword) return null;

          let reverseText = '';
          const existingMedication = item.medication_normalized ?? item.medication_name;
          const existingCacheKey = normalizeMedicationName(existingMedication);
          if (openFdaCacheRef.current.has(existingCacheKey)) {
            reverseText = (openFdaCacheRef.current.get(existingCacheKey) ?? '').toLowerCase();
          } else {
            try {
              const reverse = await fetchOpenFdaDrugInteractionText(existingMedication);
              openFdaCacheRef.current.set(existingCacheKey, reverse ?? null);
              reverseText = (reverse ?? '').toLowerCase();
            } catch {
              openFdaCacheRef.current.set(existingCacheKey, null);
              reverseText = '';
            }
          }

          if (!reverseText || !reverseText.includes(sourceKeyword)) {
            return null;
          }

          const snippet = summarizeInteractionText(reverseText);
          return {
            severity: severityFromText(reverseText),
            withMedication: item.medication_name,
            reason: `openFDA label notes potential interaction: ${snippet}`,
          } as MedicationConflict;
        }),
      );

      if (cancelled) return;

      const dedupe = new Set<string>();
      const conflicts = checks.filter((item): item is MedicationConflict => Boolean(item)).filter((item) => {
        const key = `${item.withMedication}-${item.reason}`;
        if (dedupe.has(key)) return false;
        dedupe.add(key);
        return true;
      });

      setApiConflicts(conflicts);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [values.patientId, values.medicationName, values.medicationNormalized, activePatientMeds]);

  const medicationConflicts = [...ruleConflicts, ...apiConflicts].filter((item, index, array) => {
    const key = `${item.withMedication}-${item.reason}-${item.severity}`;
    return array.findIndex((entry) => `${entry.withMedication}-${entry.reason}-${entry.severity}` === key) === index;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      await onSubmitPrescription(values);
      setValues(DEFAULT_VALUES);
    } finally {
      setSubmitting(false);
    }
  };

  return <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Issue New Prescription
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Select label="Select Patient" options={patientOptions} value={values.patientId} onChange={(event) => setValues((current) => ({ ...current, patientId: event.target.value }))} required />
          {values.patientId && (
            <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
              <p className="font-semibold">Patient medication snapshot</p>
              {activePatientMeds.length > 0 ? (
                <>
                  <p className="mt-1 text-sky-800">Active medications:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activePatientMeds.slice(0, 6).map((item) => (
                      <span key={item.id} className="rounded-full border border-sky-200 bg-white px-2 py-1 text-xs font-medium">
                        {item.medication_name}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-1 text-sky-800">No active medications found for this patient.</p>
              )}

              {patientMedicationHistory.length > 0 && (
                <>
                  <p className="mt-3 text-sky-800">Quick pick from recent prescriptions:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {patientMedicationHistory.slice(0, 5).map((item) => (
                      <button
                        key={`quick-${item.id}`}
                        type="button"
                        className="rounded-full border border-sky-300 bg-white px-3 py-1 text-xs font-semibold text-sky-800 hover:bg-sky-100"
                        onClick={() =>
                          setValues((current) => ({
                            ...current,
                            medicationName: item.medication_name,
                            medicationNormalized: item.medication_normalized ?? item.medication_name,
                            rxcui: item.rxcui ?? '',
                            rxnormVerified: Boolean(item.rxnorm_verified),
                            dosage: item.dosage,
                            frequency: item.frequency,
                            duration: item.duration,
                          }))
                        }
                      >
                        {item.medication_name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div>
          <Input label="Medication Name" placeholder="e.g. Amoxicillin" value={values.medicationName} onChange={(event) => setValues((current) => ({ ...current, medicationName: event.target.value }))} required />
          <div className="-mt-4 mb-3 flex flex-wrap gap-2">
            {rxNormSuggestions.slice(0, 5).map((item) => <button key={item.rxcui} type="button" className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-100" onClick={() => {
              const parsed = parseMedicationFromRxNormLabel(item.name);
              setValues((current) => ({
                ...current,
                medicationName: parsed.medicationName,
                medicationNormalized: item.synonym ?? item.name,
                rxcui: item.rxcui,
                rxnormVerified: true,
                dosage: parsed.dosage || current.dosage,
              }));
            }}>
                {item.name}
              </button>)}
          </div>
          <p className="-mt-1 mb-4 text-xs text-gray-500">
            {values.rxnormVerified && values.rxcui ? `RxNorm verified • RxCUI ${values.rxcui}` : 'Select a suggestion to attach RxNorm verification.'}
          </p>
          {duplicateTherapy && <div className="mb-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Similar active therapy exists: {duplicateTherapy.medication_name} ({duplicateTherapy.dosage}). Review before issuing.
            </div>}
          {medicationConflicts.length > 0 && (
            <div className="space-y-2">
              {medicationConflicts.map((conflict, index) => (
                <div
                  key={`${conflict.withMedication}-${index}`}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    conflict.severity === 'high'
                      ? 'border-red-300 bg-red-50 text-red-800'
                      : 'border-amber-300 bg-amber-50 text-amber-800'
                  }`}
                >
                  <p className="font-semibold uppercase text-xs tracking-wide mb-1">
                    {conflict.severity === 'high' ? 'High-risk interaction' : 'Moderate interaction'}
                  </p>
                  <p>
                    Possible conflict with <span className="font-semibold">{conflict.withMedication}</span>. {conflict.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <Input label="Dosage" placeholder="e.g. 500mg" value={values.dosage} onChange={(event) => setValues((current) => ({ ...current, dosage: event.target.value }))} required />

        <Select label="Frequency" options={[{
        value: 'daily',
        label: 'Once Daily'
      }, {
        value: 'bid',
        label: 'Twice Daily (BID)'
      }, {
        value: 'tid',
        label: 'Three Times Daily (TID)'
      }, {
        value: 'qid',
        label: 'Four Times Daily (QID)'
      }, {
        value: 'prn',
        label: 'As Needed (PRN)'
      }]} value={values.frequency} onChange={(event) => setValues((current) => ({ ...current, frequency: event.target.value }))} required />

        <Input label="Duration" placeholder="e.g. 7 days" value={values.duration} onChange={(event) => setValues((current) => ({ ...current, duration: event.target.value }))} required />

        <Input label="Refills Remaining" type="number" min={0} value={values.refillsRemaining} onChange={(event) => setValues((current) => ({ ...current, refillsRemaining: Number(event.target.value) }))} required />

        <Select label="Status" options={[{
        value: 'Active',
        label: 'Active'
      }, {
        value: 'Completed',
        label: 'Completed'
      }, {
        value: 'Refill Needed',
        label: 'Refill Needed'
      }, {
        value: 'Cancelled',
        label: 'Cancelled'
      }]} value={values.status} onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as PrescriptionFormValues['status'] }))} required />

        <div className="md:col-span-2">
          <label className="block text-lg font-bold text-gray-900 mb-2">
            Instructions
          </label>
          <textarea className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-teal-800 focus:ring-4 focus:ring-yellow-400 min-h-[100px]" placeholder="Special instructions for the patient..." value={values.instructions} onChange={(event) => setValues((current) => ({ ...current, instructions: event.target.value }))}></textarea>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 cursor-pointer">
            <input type="checkbox" className="w-6 h-6 text-teal-600 rounded focus:ring-teal-500" required />
            <span className="text-gray-900 font-medium">
              I certify that I am authorized to issue this prescription
              digitally.
            </span>
          </label>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" isLoading={submitting} className="bg-teal-700 hover:bg-teal-800 border-teal-700" leftIcon={<Send className="h-5 w-5" />}>
          {submitLabel}
        </Button>
      </div>
    </form>;
}