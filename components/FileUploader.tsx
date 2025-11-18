
import React, { useState, useCallback, useRef } from 'react';

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files like PDF, we don't generate a preview
        setPreview(null);
      }
      setFileName(file.name);
      onFileChange(file);
    } else {
      setPreview(null);
      setFileName(null);
      onFileChange(null);
    }
  }, [onFileChange]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] ?? null;
     if (file) {
      if (fileInputRef.current) {
        // This is a way to set the file on the input element from a drop event
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        
        // Manually trigger the change event
        const changeEvent = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(changeEvent);
      }
    }
  };


  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">1. Upload Answer Sheet</label>
      <label 
        htmlFor="file-upload" 
        className="mt-1 flex justify-center w-full min-h-48 px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center flex flex-col items-center justify-center">
          {preview ? (
            <img src={preview} alt="Answer sheet preview" className="max-h-36 object-contain rounded-md" />
          ) : fileName ? (
             <div className="flex flex-col items-center justify-center text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-4V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <p className="mt-2 text-sm font-medium">{fileName}</p>
                <p className="text-xs text-indigo-600 font-semibold mt-2">Click or drag another file to replace</p>
            </div>
          ) : (
             <>
                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8l-6-6H12a4 4 0 00-4 4v20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 28l-4-4-6 6h20l-6-6-4 4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm text-slate-600">
                    <span className="font-semibold text-indigo-600">Upload a file</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">PNG, JPG, PDF up to 10MB</p>
             </>
          )}
        </div>
        <input id="file-upload" name="file-upload" type="file" ref={fileInputRef} className="sr-only" onChange={handleFileChange} accept="image/*,application/pdf" />
      </label>
    </div>
  );
};
