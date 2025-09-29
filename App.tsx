import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ReportDisplay from './components/ReportDisplay';
import Loader from './components/Loader';
import { analyzeTestimonial } from './services/geminiService';
import type { ReportData } from './types';
import { ExclamationTriangleIcon, SoundWaveIcon } from './components/Icons';

const fileToGenerativePart = (file: File): Promise<{ mimeType: string, data: string }> => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          const result = reader.result as string;
          const data = result.split(',')[1];
          resolve({
            mimeType: file.type,
            data
          });
      };
      reader.onerror = (err) => {
          reject(err);
      };
  });
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setReportData(null);
    setError(null);
  };

  const handleAnalyzeClick = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setReportData(null);

    try {
      const audioPart = await fileToGenerativePart(selectedFile);
      const data = await analyzeTestimonial(audioPart);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setReportData(null);
    setError(null);
    setIsProcessing(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 py-10 px-4">
      <div className="container mx-auto">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-4">
            <SoundWaveIcon className="w-12 h-12 text-brand-orange" />
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-brand-orange to-brand-redorange bg-clip-text text-transparent">
              Audio Testimonial Analyzer
            </h1>
          </div>
          <p className="mt-3 text-lg text-gray-600 max-w-3xl mx-auto">
            Upload an audio file to automatically transcribe, translate, and generate a detailed sentiment report.
          </p>
        </header>
        
        <main>
          {!reportData && (
             <div className="max-w-2xl mx-auto bg-white border border-gray-200/80 p-8 rounded-xl shadow-lg shadow-gray-200/70">
                {isProcessing ? (
                  <Loader/>
                ) : (
                  <>
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      selectedFile={selectedFile}
                      isProcessing={isProcessing}
                    />
                    {error && (
                      <div className="mt-6 flex items-center justify-center bg-red-100 text-red-700 p-3 rounded-lg border border-red-200">
                         <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                         <p className="text-sm font-medium">{error}</p>
                      </div>
                    )}
                     <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleAnalyzeClick}
                            disabled={!selectedFile || isProcessing}
                            className="px-8 py-3 bg-gradient-to-r from-brand-orange to-brand-redorange text-white font-bold text-lg rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        >
                            Analyze Testimonial
                        </button>
                     </div>
                  </>
                )}
             </div>
          )}

          {reportData && (
             <div>
                <ReportDisplay data={reportData} />
                <div className="mt-8 text-center">
                    <button 
                        onClick={handleReset}
                        className="px-6 py-2 bg-white text-brand-orange font-semibold rounded-lg border border-brand-orange hover:bg-brand-orange hover:text-white transition-colors"
                    >
                        Analyze Another File
                    </button>
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;