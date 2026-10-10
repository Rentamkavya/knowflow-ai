import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { uploadDocument } from '../services/api';

export default function FileUpload({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('HR');
  const [uploading, setUploading] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (selected) => {
    setError(null);
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF documents (.pdf) are currently supported.');
      return;
    }

    if (selected.size > 25 * 1024 * 1024) {
      setError('File size exceeds maximum limit of 25MB.');
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;

    setUploading(true);
    setError(null);
    setProgressStage('Extracting PDF text pages...');

    try {
      setTimeout(() => setProgressStage('Chunking document & generating vector embeddings...'), 1100);

      const data = await uploadDocument(file, category);

      if (data.error) {
        throw new Error(data.error);
      }

      setProgressStage('Document successfully indexed in Knowledge Base!');
      setTimeout(() => {
        setUploading(false);
        setFile(null);
        if (onUploadSuccess) onUploadSuccess(data.document);
        onClose();
      }, 700);

    } catch (err) {
      console.error('[FileUpload Error]:', err);
      setError(err.message || 'Failed to upload document.');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-indigo-500/30 max-w-lg w-full space-y-5 bg-[#0D152A]/95 shadow-2xl animate-scaleIn">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-cyan-400 border border-indigo-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Upload Internal Document</h3>
              <p className="text-xs text-slate-400">PDF manuals, handbooks, runbooks & policies</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Target Department Domain:
          </label>
          <div className="grid grid-cols-5 gap-2">
            {['HR', 'Finance', 'IT', 'Engineering', 'Product'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  category === cat
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 border-white/[0.06] hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* File Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              validateAndSetFile(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
              : file
              ? 'border-indigo-500/60 bg-indigo-950/20'
              : 'border-white/[0.12] hover:border-cyan-400/60 bg-slate-950/40'
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-file-input-component"
          />
          <label htmlFor="pdf-file-input-component" className="cursor-pointer space-y-3 block">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-950/70 border border-indigo-700/50 flex items-center justify-center text-cyan-400 shadow-md">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {file ? file.name : 'Click to browse or drop PDF here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Maximum file size: 25MB • Formats: .PDF'}
              </p>
            </div>
          </label>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/70 text-xs text-rose-200 flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Progress Status */}
        {uploading && (
          <div className="p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-700/50 text-xs text-cyan-200 flex items-center space-x-2.5 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
            <span className="font-semibold">{progressStage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
          >
            Cancel
          </button>
          
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition transform hover:-translate-y-0.5"
          >
            {uploading ? 'Processing PDF...' : 'Index in Knowledge Base'}
          </button>
        </div>

      </div>
    </div>
  );
}
