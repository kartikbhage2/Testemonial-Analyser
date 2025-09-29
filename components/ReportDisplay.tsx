import React, { ReactNode, useState } from 'react';
import { ReportData, ReportSection, Sentiment } from '../types';
import { 
    QuoteIcon, 
    ChevronDownIcon, 
    ClipboardCopyIcon,
    CheckIcon,
    LanguageIcon,
    TranslateIcon,
    DocumentTextIcon
} from './Icons';

const highlightText = (text: string, highlights: string[]): ReactNode[] => {
    if (!highlights || highlights.length === 0) {
        return [text];
    }
    
    const regex = new RegExp(`(${highlights.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
        highlights.some(h => h.toLowerCase() === part.toLowerCase()) ? (
            <strong key={index} className="bg-orange-200/70 font-semibold text-gray-900 px-1 rounded">
                {part}
            </strong>
        ) : (
            part
        )
    );
};

const formatReportForWord = (data: ReportData): string => {
    let content = `Dealer Testimonial — Transcript + Translation + Sentiment Report\n`;
    content += `==================================================================\n\n`;

    content += `EXECUTIVE SUMMARY\n------------------\n`;
    content += `${data.overallSummary}\n\n`;

    content += `OVERALL ANALYSIS\n----------------\n`;
    content += `  - Sentiment: ${data.overallSentiment.sentiment} (${(data.overallSentiment.confidence * 100).toFixed(0)}% confidence)\n`;
    content += `  - Emotional Markers: ${data.emotionalMarkers.join(', ')}\n`;
    if (data.keyPositivePhrases.length > 0) {
        content += `  - Key Positive Phrases:\n${data.keyPositivePhrases.map(p => `    - ${p}`).join('\n')}\n`;
    }
    if (data.frictionalPoints.length > 0) {
        content += `  - Frictional Points:\n${data.frictionalPoints.map(p => `    - ${p}`).join('\n')}\n`;
    }
    content += `\n`;
    
    if (data.marketableQuotes.length > 0) {
        content += `MARKETABLE QUOTES\n------------------\n`;
        content += `${data.marketableQuotes.map(q => `  • "${q}"`).join('\n')}\n\n`;
    }

    content += `DETAILED BREAKDOWN\n==================\n\n`;
    data.sections.forEach(section => {
        content += `SECTION: ${section.timestamp}\n`;
        content += `------------------\n`;
        content += `  - Sentiment: ${section.sentiment.sentiment} (${(section.sentiment.confidence * 100).toFixed(0)}% confidence)\n`;
        content += `  - Analyst Notes: ${section.notes}\n\n`;
        content += `  Original (Verbatim):\n  "${section.original}"\n\n`;
        content += `  English (Translation):\n  "${section.translation}"\n\n`;
        content += `------------------------------------------------------------------\n\n`;
    });

    return content;
};


const SentimentBadge: React.FC<{ sentiment: Sentiment }> = ({ sentiment }) => {
    const sentimentColor =
        sentiment.sentiment === 'Positive' ? 'text-green-800 bg-green-100 border-green-200' :
        sentiment.sentiment === 'Negative' ? 'text-red-800 bg-red-100 border-red-200' :
        'text-gray-800 bg-gray-100 border-gray-200';

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${sentimentColor}`}>
            {sentiment.sentiment} ({(sentiment.confidence * 100).toFixed(0)}%)
        </span>
    );
};

const AccordionSection: React.FC<{ section: ReportSection, marketableQuotes: string[] }> = ({ section, marketableQuotes }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 bg-white rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
            >
                <header className="flex items-center space-x-4">
                    <h3 className="text-lg font-bold text-gray-800">{section.timestamp}</h3>
                    <SentimentBadge sentiment={section.sentiment} />
                </header>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                 <div className="px-4 pb-4 pt-2">
                    <div className="grid grid-cols-1 gap-4 mt-2">
                        <div className="bg-gray-50/70 p-4 rounded-md flex items-start space-x-3">
                            <LanguageIcon className="w-6 h-6 text-gray-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-600 mb-1">Original (Verbatim)</h4>
                                <p className="text-gray-700 italic leading-relaxed">{section.original}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-md flex items-start space-x-3">
                            <TranslateIcon className="w-6 h-6 text-brand-orange mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-600 mb-1">English (Translation)</h4>
                                <p className="text-gray-800 leading-relaxed">{highlightText(section.translation, marketableQuotes)}</p>
                            </div>
                        </div>
                    </div>
                    {section.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex items-start space-x-3">
                            <DocumentTextIcon className="w-6 h-6 text-gray-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-600 mb-1">Analyst Notes</h4>
                                <p className="text-sm text-gray-600">{section.notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


const ReportDisplay: React.FC<{ data: ReportData }> = ({ data }) => {
    const [isCopied, setIsCopied] = useState(false);
    
    const handleCopyClick = () => {
        const reportText = formatReportForWord(data);
        navigator.clipboard.writeText(reportText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        });
    };

    return (
        <div className="w-full max-w-5xl mx-auto bg-white border border-gray-200 shadow-xl shadow-gray-200/50 rounded-lg text-gray-800">
            <header className="relative p-8 border-b border-transparent bg-gradient-to-r from-brand-orange to-brand-redorange rounded-t-lg">
                <h1 className="text-4xl font-bold text-white">Dealer Testimonial Analysis</h1>
                <p className="text-xl text-orange-100 mt-1">Transcript, Translation & Sentiment Report</p>
                 <button
                    onClick={handleCopyClick}
                    className={`absolute top-6 right-6 flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200
                        ${isCopied 
                            ? 'bg-green-500 text-white'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`
                    }
                >
                    {isCopied ? (
                        <>
                            <CheckIcon className="w-5 h-5" />
                            <span>Copied!</span>
                        </>
                    ) : (
                         <>
                            <ClipboardCopyIcon className="w-5 h-5" />
                            <span>Copy to Word</span>
                        </>
                    )}
                </button>
            </header>

            <main className="p-8 space-y-12">
                <section id="summary">
                    <h2 className="text-2xl font-bold border-b border-gray-200 pb-2 mb-4 text-brand-redorange">Overall Analysis</h2>
                    
                    <div className="mb-8">
                        <h3 className="font-semibold text-lg mb-2 text-gray-700">Executive Summary</h3>
                        <div className="text-gray-700 leading-relaxed bg-orange-50 p-4 rounded-md border border-orange-200">
                            {data.overallSummary}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-lg mb-2">Overall Sentiment</h3>
                            <SentimentBadge sentiment={data.overallSentiment} />
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                             <h3 className="font-semibold text-lg mb-2">Emotional Markers</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.emotionalMarkers.map((marker, i) => (
                                    <span key={i} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">{marker}</span>
                                ))}
                            </div>
                        </div>
                         <div className="bg-white p-4 rounded-lg border border-gray-200 md:col-span-2 lg:col-span-1">
                            <h3 className="font-semibold text-lg mb-2">Key Points</h3>
                            {data.keyPositivePhrases.length > 0 && (
                                <div className="mb-2">
                                    <ul className="flex flex-wrap gap-2">
                                        {data.keyPositivePhrases.map((phrase, i) => <li className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-md" key={i}>+ {phrase}</li>)}
                                    </ul>
                                </div>
                            )}
                             {data.frictionalPoints.length > 0 && (
                                <div>
                                    <ul className="flex flex-wrap gap-2">
                                        {data.frictionalPoints.map((point, i) => <li className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-md" key={i}>- {point}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                
                {data.marketableQuotes.length > 0 && (
                     <section id="quotes">
                        <h2 className="text-2xl font-bold border-b border-gray-200 pb-2 mb-4 text-brand-redorange">Marketable Quotes</h2>
                        <div className="space-y-4">
                            {data.marketableQuotes.map((quote, i) => (
                                <blockquote key={i} className="relative border-l-4 border-brand-orange bg-gray-50 p-4 pl-12 text-lg italic text-gray-800 rounded-r-lg">
                                    <QuoteIcon className="absolute top-4 left-4 w-6 h-6 text-brand-orange/50" />
                                    {quote}
                                </blockquote>
                            ))}
                        </div>
                    </section>
                )}

                <section id="transcript">
                    <h2 className="text-2xl font-bold border-b border-gray-200 pb-2 mb-4 text-brand-redorange">Detailed Breakdown</h2>
                    <div className="space-y-4">
                        {data.sections.map((section: ReportSection, index: number) => (
                           <AccordionSection key={index} section={section} marketableQuotes={data.marketableQuotes} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ReportDisplay;