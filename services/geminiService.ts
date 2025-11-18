
import { GoogleGenAI, Type } from '@google/genai';
import type { EvaluationResult, EvaluationAlgorithm } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Stripping the data URL prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const getAlgorithmFocus = (algorithm: EvaluationAlgorithm): string => {
  switch (algorithm) {
    case 'BERT':
      return "Focus on contextual understanding and content accuracy. Be strict with relevance to the provided rubric.";
    case 'RoBERTa':
      return "Focus on nuanced language, grammatical structure, and the quality of writing. Be more critical of sentence construction.";
    case 'DistilBERT':
      return "Provide a balanced and efficient overview. Focus on key points and clarity, giving a faster, more general assessment.";
    default:
      return "Provide a standard, balanced evaluation.";
  }
}

export const evaluateAnswerSheet = async (
  file: File,
  rubric: string,
  algorithm: EvaluationAlgorithm
): Promise<EvaluationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';

  const base64Image = await fileToBase64(file);

  const prompt = `
    You are an expert teacher's assistant AI. Your task is to evaluate a student's answer sheet based on a provided rubric. 
    Analyze the attached image of the answer sheet and the rubric below.

    **Rubric / Correct Answer:**
    ---
    ${rubric}
    ---

    **Evaluation Instructions:**
    1.  **Read the Answer:** Carefully analyze the student's handwritten answer in the image.
    2.  **Compare with Rubric:** Evaluate the student's answer against the provided rubric for accuracy and completeness.
    3.  **Score Multiple Criteria:** Provide a score from 1 (poor) to 10 (excellent) for each of the following criteria, along with a brief justification for each score:
        *   **Creativity:** How original or insightful is the answer?
        *   **Handwriting:** Provide a detailed analysis. This must include separate scores (1-10) and justifications for **Legibility** (how easy it is to read individual characters) and **Neatness** (how organized and tidy the writing appears). Then, provide an overall handwriting score (1-10) and a summary justification based on legibility and neatness.
        *   **Relevance:** How well does the answer address the question and stick to the rubric?
        *   **Presentation:** How well is the answer structured and organized? (e.g., use of paragraphs, headings).
    4.  **Identify Mistakes:** List the key mistakes, inaccuracies, or gaps in the student's answer in a clear, bulleted list.
    5.  **Provide Recommendations:** Offer personalized, constructive recommendations for improvement. These should be actionable suggestions for the student.
    6.  **Overall Score & Feedback:** Provide an overall score out of 100 and a summary paragraph of feedback.
    7.  **Algorithm Focus:** ${getAlgorithmFocus(algorithm)}
    8.  **Output Format:** Respond ONLY with a valid JSON object that adheres to the provided schema. Do not include any text before or after the JSON object.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      overallScore: { type: Type.NUMBER, description: "Overall score from 0 to 100." },
      overallFeedback: { type: Type.STRING, description: "A summary paragraph of the student's performance." },
      scores: {
        type: Type.OBJECT,
        properties: {
          creativity: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "Score from 1 to 10." },
              justification: { type: Type.STRING }
            },
            required: ["score", "justification"]
          },
          handwriting: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.NUMBER, description: "Overall handwriting score from 1 to 10." },
              legibility: {
                  type: Type.OBJECT,
                  properties: {
                      score: { type: Type.NUMBER, description: "Legibility score from 1 to 10." },
                      justification: { type: Type.STRING }
                  },
                  required: ["score", "justification"]
              },
              neatness: {
                  type: Type.OBJECT,
                  properties: {
                      score: { type: Type.NUMBER, description: "Neatness score from 1 to 10." },
                      justification: { type: Type.STRING }
                  },
                  required: ["score", "justification"]
              },
              justification: { type: Type.STRING, description: "Overall justification for the handwriting score." }
            },
            required: ["overallScore", "legibility", "neatness", "justification"]
          },
          relevance: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "Score from 1 to 10." },
              justification: { type: Type.STRING }
            },
            required: ["score", "justification"]
          },
          presentation: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "Score from 1 to 10." },
              justification: { type: Type.STRING }
            },
            required: ["score", "justification"]
          }
        },
        required: ["creativity", "handwriting", "relevance", "presentation"]
      },
      mistakes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of identified mistakes or weak areas."
      },
      recommendations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of actionable improvement recommendations."
      }
    },
    required: ["overallScore", "overallFeedback", "scores", "mistakes", "recommendations"]
  };

  const filePart = {
    inlineData: {
      data: base64Image,
      mimeType: file.type,
    },
  };

  const textPart = {
    text: prompt,
  };

  const result = await ai.models.generateContent({
    model: model,
    contents: { parts: [textPart, filePart] },
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.3,
    }
  });

  const jsonString = result.text.trim();
  try {
    return JSON.parse(jsonString) as EvaluationResult;
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", jsonString);
    throw new Error("The AI returned an invalid response format.");
  }
};
