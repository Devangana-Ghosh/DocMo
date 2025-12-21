import React from 'react';
import { User, Calendar, Activity } from 'lucide-react';
import { Button } from '../ui/Button';
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  conditions: string[];
  status: 'Active' | 'Inactive';
}
interface PatientCardProps {
  patient: Patient;
  onViewRecords: (id: string) => void;
}
export function PatientCard({
  patient,
  onViewRecords
}: PatientCardProps) {
  return <article className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:border-teal-500 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center border-2 border-teal-200 text-teal-800 font-bold text-xl">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
            <p className="text-gray-600">
              {patient.age} yrs • {patient.gender}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${patient.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {patient.status}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-5 w-5 text-teal-600" />
          <span className="font-medium">Last Visit: {patient.lastVisit}</span>
        </div>
        <div className="flex items-start gap-2 text-gray-700">
          <Activity className="h-5 w-5 text-teal-600 mt-1" />
          <div className="flex flex-wrap gap-2">
            {patient.conditions.map(condition => <span key={condition} className="bg-gray-100 px-2 py-0.5 rounded text-sm border border-gray-200">
                {condition}
              </span>)}
          </div>
        </div>
      </div>

      <Button onClick={() => onViewRecords(patient.id)} className="w-full bg-teal-700 hover:bg-teal-800 border-teal-700 text-white">
        View Medical Records
      </Button>
    </article>;
}