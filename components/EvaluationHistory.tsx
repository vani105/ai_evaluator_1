
import React from 'react';
import type { HistoryEntry } from '../types';

interface EvaluationHistoryProps {
  history: HistoryEntry[];
  onSelectItem: (item: HistoryEntry) => void;
  onClearHistory: () => void;
  selectedId: number | null;
}

export const EvaluationHistory: React.FC<EvaluationHistoryProps> = ({ history, onSelectItem, onClearHistory, selectedId }) => {

  const sortedHistory = [...history].sort((a, b) => b.id - a.id);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8">
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <h2 className="text-2xl font-semibold text-slate-900">Evaluation History</h2>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>
      
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 font-medium">No past evaluations found.</p>
            <p className="text-sm">Completed evaluations will be stored here for future reference.</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {sortedHistory.map((item) => {
            const isSelected = item.id === selectedId;
            const scoreColor = item.overallScore >= 80 ? 'bg-green-100 text-green-800' : item.overallScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
            return (
                <button
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    isSelected ? 'bg-indigo-100 ring-2 ring-indigo-300' : 'hover:bg-slate-50'
                }`}
                >
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.fileName}</p>
                    <p className="text-xs text-slate-500">{item.date}</p>
                </div>
                <div className={`ml-4 px-3 py-1 text-sm font-bold rounded-full ${scoreColor}`}>
                    {item.overallScore}
                </div>
                </button>
            );
            })}
        </div>
      )}
    </div>
  );
};
