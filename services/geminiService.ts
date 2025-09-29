import { GoogleGenAI, Type } from "@google/genai";
import { ReportData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        overallSummary: {
            type: Type.STRING,
            description: "A concise summary of the entire testimonial in a few sentences, capturing the main points and overall tone."
        },
        overallSentiment: {
            type: Type.OBJECT,
            properties: {
                sentiment: { type: Type.STRING, description: "Can be 'Positive', 'Negative', or 'Neutral'" },
                confidence: { type: Type.NUMBER, description: "A value between 0 and 1" }
            },
            required: ['sentiment', 'confidence']
        },
        emotionalMarkers: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of identified emotional tones like 'Trust', 'Satisfaction'."
        },
        keyPositivePhrases: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Exact key phrases that are positive."
        },
        frictionalPoints: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Any points of friction or negativity mentioned."
        },
        marketableQuotes: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Short, impactful quotes from the translation suitable for marketing."
        },
        sections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    timestamp: { type: Type.STRING, description: "e.g., '[00:00 - 00:28]'" },
                    original: { type: Type.STRING, description: "The verbatim transcript in the original language." },
                    translation: { type: Type.STRING, description: "The English translation." },
                    sentiment: {
                        type: Type.OBJECT,
                        properties: {
                            sentiment: { type: Type.STRING },
                            confidence: { type: Type.NUMBER }
                        },
                        required: ['sentiment', 'confidence']
                    },
                    notes: { type: Type.STRING, description: "Brief analysis of this section." }
                },
                required: ['timestamp', 'original', 'translation', 'sentiment', 'notes']
            }
        }
    },
     required: ['overallSummary', 'overallSentiment', 'emotionalMarkers', 'keyPositivePhrases', 'frictionalPoints', 'marketableQuotes', 'sections']
};

export const analyzeTestimonial = async (audioFile: { mimeType: string, data: string }): Promise<ReportData> => {
    const prompt = `
        You are an expert audio analyst. I have provided an audio file of a dealer testimonial. 
        Your task is to transcribe it verbatim, translate it to English, and perform a detailed sentiment analysis.

        Instructions:
        1.  **Transcribe:** Listen to the audio and transcribe the speech verbatim in its original language. Break the transcript into sections of 20-30 seconds, including timestamps (e.g., [00:00 - 00:25]).
        2.  **Translate:** Provide a faithful, conversational English translation for each transcribed section.
        3.  **Analyze:**
            -   **Write a concise overall summary** of the testimonial in 2-3 sentences.
            -   Determine the overall sentiment (Positive, Neutral, Negative) with a confidence score.
            -   Identify key emotional markers (e.g., Trust, Satisfaction, Excitement).
            -   Extract key positive phrases and any negative/frictional points mentioned.
            -   Identify and extract the most impactful, marketable quotes from the English translation.
        4.  **Format:** Structure your entire output according to the provided JSON schema. Ensure the 'marketableQuotes' array is populated with the best quotes for marketing use.
    `;

    try {
        const audioPart = {
            inlineData: {
              mimeType: audioFile.mimeType,
              data: audioFile.data,
            },
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [audioPart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        // Basic validation
        if (!parsedData.overallSummary || !parsedData.overallSentiment || !parsedData.sections) {
            throw new Error("Invalid data structure received from API.");
        }

        return parsedData as ReportData;

    } catch (error) {
        console.error("Error analyzing testimonial:", error);
        throw new Error("Failed to analyze the testimonial. The audio might be unsupported or the API call failed.");
    }
};