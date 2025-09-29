import React, { useRef } from 'react';
import { UploadIcon, FileIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
        onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
        {selectedFile ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center space-x-4">
                <FileIcon className="w-12 h-12 text-brand-orange flex-shrink-0" />
                <div className="overflow-hidden">
                    <p className="text-lg font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            </div>
        ) : (
            <div
                className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 group
                ${isProcessing 
                    ? 'bg-gray-100 border-gray-300' 
                    : 'bg-gray-50 border-gray-300 hover:border-brand-orange hover:bg-orange-50'
                }`}
                onClick={isProcessing ? undefined : openFileDialog}
                onDrop={isProcessing ? undefined : handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                 <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="audio/*"
                    disabled={isProcessing}
                />
                <div className="text-center relative z-10">
                    <UploadIcon className="w-16 h-16 mx-auto text-gray-400 group-hover:text-brand-orange transition-colors duration-300" />
                    <p className="mt-4 text-lg text-gray-600">
                        <span className="font-semibold text-brand-orange">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">Audio files (MP3, WAV, M4A, etc.)</p>
                </div>
            </div>
        )}
    </div>
  );
};

export default FileUpload;