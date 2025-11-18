
export interface ScoreMetric {
  score: number;
  justification: string;
}

export interface HandwritingAnalysis {
  overallScore: number;
  legibility: ScoreMetric;
  neatness: ScoreMetric;
  justification: string;
}

export interface EvaluationResult {
  overallScore: number;
  overallFeedback: string;
  scores: {
    creativity: ScoreMetric;
    handwriting: HandwritingAnalysis;
    relevance: ScoreMetric;
    presentation: ScoreMetric;
  };
  mistakes: string[];
  recommendations: string[];
}

export type EvaluationAlgorithm = 'BERT' | 'RoBERTa' | 'DistilBERT';

export interface HistoryEntry {
  id: number;
  date: string;
  fileName: string;
  rubric: string;
  overallScore: number;
  result: EvaluationResult;
}
