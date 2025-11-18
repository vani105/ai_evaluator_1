
import React from 'react';

interface RubricEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const RubricEditor: React.FC<RubricEditorProps> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="rubric" className="block text-sm font-medium text-slate-700">2. Provide Rubric / Correct Answer</label>
      <div className="mt-2">
        <textarea
          id="rubric"
          name="rubric"
          rows={8}
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition bg-slate-50"
          placeholder="Enter the correct answer, marking criteria, or key points the student should have included..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};
