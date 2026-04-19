import { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Send } from 'lucide-react';
import { fetchRxNormSuggestions, type RxNormConcept } from '../../services/integrations';
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

export function PrescriptionForm({ patientOptions, existingPrescriptions = [], onSubmitPrescription, initialValues, submitLabel = 'Issue Prescription' }: PrescriptionFormProps) {
  const [values, setValues] = useState<PrescriptionFormValues>({ ...DEFAULT_VALUES, ...initialValues });
  const [submitting, setSubmitting] = useState(false);
  const [rxNormSuggestions, setRxNormSuggestions] = useState<RxNormConcept[]>([]);

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
    const match = rxNormSuggestions.find((item) => item.name.toLowerCase() === values.medicationName.trim().toLowerCase());
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