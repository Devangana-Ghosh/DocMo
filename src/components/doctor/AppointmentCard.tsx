import React from 'react';
import { Calendar, Clock, FileText, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';
export interface AppointmentRequest {
  id: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  type: 'New Patient' | 'Follow-up' | 'Urgent';
}
interface AppointmentCardProps {
  appointment: AppointmentRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}
export function AppointmentCard({
  appointment,
  onAccept,
  onReject
}: AppointmentCardProps) {
  const typeColors = {
    'New Patient': 'bg-blue-100 text-blue-800',
    'Follow-up': 'bg-purple-100 text-purple-800',
    Urgent: 'bg-red-100 text-red-800'
  };
  return <article className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          {appointment.patientName}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${typeColors[appointment.type]}`}>
          {appointment.type}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-5 w-5 text-teal-600" />
          <span className="font-medium">{appointment.date}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="h-5 w-5 text-teal-600" />
          <span className="font-medium">{appointment.time}</span>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-start gap-2">
          <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
          <p className="text-gray-700">{appointment.reason}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => onAccept(appointment.id)} className="flex-1 bg-teal-700 hover:bg-teal-800 border-teal-700" leftIcon={<Check className="h-5 w-5" />}>
          Accept
        </Button>
        <Button onClick={() => onReject(appointment.id)} variant="outline" className="flex-1 text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300" leftIcon={<X className="h-5 w-5" />}>
          Reject
        </Button>
      </div>
    </article>;
}