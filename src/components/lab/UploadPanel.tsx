import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import i18n from '../../i18n';
interface UploadPanelProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
}
export function UploadPanel({
  onFileSelect,
  selectedFile,
  onClearFile
}: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };
  return <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Upload Lab Report
      </h3>

      {!selectedFile ? <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-colors
            ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50/50'}
          `}>
          <div className="flex flex-col items-center">
            <div className="bg-purple-100 p-6 rounded-full mb-6">
              <Upload className="h-12 w-12 text-purple-700" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Drop your file here
            </h4>
            <p className="text-gray-600 mb-6 text-lg">
              or click to browse from your computer
            </p>
            <input type="file" id="file-upload" className="sr-only" onChange={handleFileInput} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
            <label htmlFor="file-upload">
              <span className="inline-flex items-center justify-center px-6 py-3 text-lg font-bold rounded-lg text-white bg-purple-700 hover:bg-purple-800 shadow-lg border-2 border-transparent cursor-pointer transition-transform active:scale-95 focus-within:ring-4 focus-within:ring-yellow-400" role="button" tabIndex={0} onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              document.getElementById('file-upload')?.click();
            }
          }}>
                {i18n.t('labUpload.browseFiles', { defaultValue: 'Browse Files' })}
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-4">
              {i18n.t('labUpload.supportedFormats', { defaultValue: 'Supported formats: PDF, JPG, PNG, DOC (Max 10MB)' })}
            </p>
          </div>
        </div> : <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-purple-700" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-gray-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button onClick={onClearFile} className="text-red-700 hover:bg-red-50 p-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400" aria-label={i18n.t('labUpload.removeFile', { defaultValue: 'Remove file' })}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{i18n.t('labUpload.fileReady', { defaultValue: 'File ready for upload' })}</span>
          </div>
        </div>}
    </div>;
}