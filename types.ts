
export interface Sentiment {
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  confidence: number;
}

export interface ReportSection {
  timestamp: string;
  original: string;
  translation: string;
  sentiment: Sentiment;
  notes: string;
}

export interface ReportData {
  overallSummary: string;
  overallSentiment: Sentiment;
  emotionalMarkers: string[];
  keyPositivePhrases: string[];
  frictionalPoints: string[];
  marketableQuotes: string[];
  sections: ReportSection[];
}