
import React from 'react';
import type { EvaluationResult, ScoreMetric, HandwritingAnalysis } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircleIcon, LightBulbIcon, XCircleIcon } from './Icons';

interface EvaluationReportProps {
  result: EvaluationResult;
}

const ScoreCard: React.FC<{ title: string; metric: ScoreMetric }> = ({ title, metric }) => {
    const color = metric.score >= 8 ? 'text-green-600' : metric.score >= 5 ? 'text-yellow-600' : 'text-red-600';
    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-slate-800">{title}</h4>
            <p className={`text-2xl font-bold ${color}`}>{metric.score}/10</p>
            <p className="text-sm text-slate-600 mt-1">{metric.justification}</p>
        </div>
    );
};

const HandwritingScoreCard: React.FC<{ title: string; analysis: HandwritingAnalysis }> = ({ title, analysis }) => {
    const color = analysis.overallScore >= 8 ? 'text-green-600' : analysis.overallScore >= 5 ? 'text-yellow-600' : 'text-red-600';
    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <div className="flex justify-between items-start">
                <h4 className="font-semibold text-slate-800">{title}</h4>
                <p className={`text-2xl font-bold ${color}`}>{analysis.overallScore}/10</p>
            </div>
            <p className="text-sm text-slate-600 pb-2">{analysis.justification}</p>

            <div className="pt-2 border-t border-slate-200 space-y-2">
                 <div>
                    <p className="text-sm font-medium text-slate-700">Legibility: <span className="font-bold">{analysis.legibility.score}/10</span></p>
                    <p className="text-xs text-slate-500 italic">"{analysis.legibility.justification}"</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-700">Neatness: <span className="font-bold">{analysis.neatness.score}/10</span></p>
                    <p className="text-xs text-slate-500 italic">"{analysis.neatness.justification}"</p>
                </div>
            </div>
        </div>
    );
};


export const EvaluationReport: React.FC<EvaluationReportProps> = ({ result }) => {
  const chartData = [
    { name: 'Creativity', score: result.scores.creativity.score },
    { name: 'Handwriting', score: result.scores.handwriting.overallScore },
    { name: 'Relevance', score: result.scores.relevance.score },
    { name: 'Presentation', score: result.scores.presentation.score },
  ];
  
  const overallScoreColor = result.overallScore >= 80 ? 'bg-green-100 text-green-800' : result.overallScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];


  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Overall Score</h3>
        <div className={`mt-2 p-4 rounded-lg flex items-center justify-between ${overallScoreColor}`}>
          <span className="text-4xl font-bold">{result.overallScore}</span>
          <span className="text-lg font-medium">/ 100</span>
        </div>
        <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-200">{result.overallFeedback}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Detailed Breakdown</h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#475569' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}/>
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                       {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                       ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <ScoreCard title="Creativity" metric={result.scores.creativity} />
            <HandwritingScoreCard title="Handwriting" analysis={result.scores.handwriting} />
            <ScoreCard title="Relevance" metric={result.scores.relevance} />
            <ScoreCard title="Presentation" metric={result.scores.presentation} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center"><XCircleIcon/>Mistakes & Weak Areas</h3>
          <ul className="mt-2 list-disc list-inside space-y-2 text-slate-700 bg-red-50/50 p-4 rounded-lg border border-red-200">
            {result.mistakes.map((mistake, index) => (
              <li key={index}>{mistake}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center"><LightBulbIcon/>Improvement Recommendations</h3>
          <ul className="mt-2 list-disc list-inside space-y-2 text-slate-700 bg-green-50/50 p-4 rounded-lg border border-green-200">
            {result.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};