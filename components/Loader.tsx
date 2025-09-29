import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Warming up the AI engine...",
    "Transcribing audio verbatim...",
    "Translating to English...",
    "Analyzing sentiment and tone...",
    "Extracting key phrases...",
    "Identifying marketable quotes...",
    "Compiling your report...",
];

const Loader: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
        }, 2000); 

        return () => clearInterval(interval);
    }, []);


  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-brand-redorange/20 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-brand-orange rounded-full animate-spin"></div>
      </div>
      <p className="text-lg font-semibold text-gray-900">Analyzing Testimonial...</p>
      <p className="text-md text-gray-600 h-6">{loadingMessages[messageIndex]}</p>
    </div>
  );
};

export default Loader;