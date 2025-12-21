import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Send } from 'lucide-react';
export function PrescriptionForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Prescription issued successfully!');
  };
  return <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Issue New Prescription
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Select label="Select Patient" options={[{
          value: '1',
          label: 'John Doe (ID: P-1024)'
        }, {
          value: '2',
          label: 'Jane Smith (ID: P-1025)'
        }, {
          value: '3',
          label: 'Robert Johnson (ID: P-1026)'
        }]} required />
        </div>

        <Input label="Medication Name" placeholder="e.g. Amoxicillin" required />
        <Input label="Dosage" placeholder="e.g. 500mg" required />

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
      }]} required />

        <Input label="Duration" placeholder="e.g. 7 days" required />

        <div className="md:col-span-2">
          <label className="block text-lg font-bold text-gray-900 mb-2">
            Instructions
          </label>
          <textarea className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-teal-800 focus:ring-4 focus:ring-yellow-400 min-h-[100px]" placeholder="Special instructions for the patient..."></textarea>
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
        <Button type="submit" className="bg-teal-700 hover:bg-teal-800 border-teal-700" leftIcon={<Send className="h-5 w-5" />}>
          Issue Prescription
        </Button>
      </div>
    </form>;
}