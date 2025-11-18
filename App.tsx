
import React, { useState, useCallback, useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { RubricEditor } from './components/RubricEditor';
import { EvaluationReport } from './components/EvaluationReport';
import { EvaluationHistory } from './components/EvaluationHistory';
import { evaluateAnswerSheet } from './services/geminiService';
import type { EvaluationResult, EvaluationAlgorithm, HistoryEntry } from './types';
import { BrandIcon, SparklesIcon } from './components/Icons';

const App: React.FC = () => {
  const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
  const [rubric, setRubric] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState<EvaluationAlgorithm>('BERT');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('evaluationHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
      localStorage.removeItem('evaluationHistory');
    }
  }, []);

  const handleEvaluation = useCallback(async () => {
    if (!answerSheetFile || !rubric) {
      setError('Please upload an answer sheet and provide a rubric.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setEvaluationResult(null);
    setSelectedHistoryId(null);

    try {
      const result = await evaluateAnswerSheet(answerSheetFile, rubric, algorithm);
      setEvaluationResult(result);
      
      const newEntry: HistoryEntry = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        fileName: answerSheetFile.name,
        rubric: rubric,
        overallScore: result.overallScore,
        result: result,
      };

      setHistory(prevHistory => {
        const newHistory = [newEntry, ...prevHistory];
        try {
          localStorage.setItem('evaluationHistory', JSON.stringify(newHistory));
        } catch (e) {
          console.error("Failed to save history to localStorage", e);
        }
        return newHistory;
      });

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`An error occurred during evaluation: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [answerSheetFile, rubric, algorithm]);
  
  const handleSelectHistoryItem = (item: HistoryEntry) => {
    setEvaluationResult(item.result);
    setSelectedHistoryId(item.id);
    setIsLoading(false);
    setError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setSelectedHistoryId(null);
    if (selectedHistoryId !== null) {
      setEvaluationResult(null);
    }
    try {
      localStorage.removeItem('evaluationHistory');
    } catch (e) {
      console.error("Failed to clear history from localStorage", e);
    }
  };

  const algorithms: EvaluationAlgorithm[] = ['BERT', 'RoBERTa', 'DistilBERT'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrandIcon />
            <h1 className="text-xl font-bold text-slate-900">AI Answer Sheet Grader</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 border-b pb-3">Evaluation Setup</h2>
            
            <div className="space-y-6">
              <FileUploader onFileChange={setAnswerSheetFile} />
              <RubricEditor value={rubric} onChange={setRubric} />
              <div>
                <label htmlFor="algorithm" className="block text-sm font-medium text-slate-700 mb-2">Evaluation Algorithm</label>
                <select
                  id="algorithm"
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value as EvaluationAlgorithm)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  {algorithms.map(alg => <option key={alg} value={alg}>{alg}</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">Select the NLP model for analysis. This adjusts the evaluation focus.</p>
              </div>
            </div>
            
            <button
              onClick={handleEvaluation}
              disabled={isLoading || !answerSheetFile || !rubric}
              className="w-full flex items-center justify-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Evaluating...
                </>
              ) : (
                <>
                  <SparklesIcon />
                  Evaluate Answer
                </>
              )}
            </button>
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
          </div>

          {/* Output Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h2 className="text-2xl font-semibold text-slate-900 border-b pb-3 mb-6">Evaluation Report</h2>
             {isLoading && (
                 <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                    <SparklesIcon className="w-12 h-12 text-indigo-400 animate-pulse" />
                    <p className="mt-4 text-lg font-medium">Analyzing the answer sheet...</p>
                    <p className="text-sm">The AI is reading the handwriting, comparing with the rubric, and preparing feedback.</p>
                 </div>
             )}
             {evaluationResult ? (
                <EvaluationReport result={evaluationResult} />
             ) : !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="mt-4 font-medium">The report will appear here once the evaluation is complete.</p>
                    <p className="text-sm">Please provide an answer sheet and a rubric to begin.</p>
                </div>
             )}
          </div>
        </div>

        <EvaluationHistory 
            history={history}
            onSelectItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
            selectedId={selectedHistoryId}
        />
      </main>
    </div>
  );
};

export default App;
