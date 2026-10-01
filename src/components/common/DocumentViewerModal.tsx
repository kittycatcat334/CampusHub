import React, { useState, useEffect } from 'react';
import { DocumentItem } from '../../types';
import {
  generateAcademicDocumentContent,
  downloadDocumentFile,
  detectFileType,
  SpreadsheetSheet
} from '../../utils/documentViewerHelper';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileText,
  Table,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  BookOpen,
  Calendar,
  Sparkles,
  Layers
} from 'lucide-react';

interface DocumentViewerModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document: docItem,
  onClose
}) => {
  if (!docItem) return null;

  const fileType = docItem.fileType || detectFileType(docItem.fileName);
  const model = generateAcademicDocumentContent(docItem);

  const [activeSheetIdx, setActiveSheetIdx] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
    value: string | number;
    formula?: string;
  } | null>(null);

  // Keyboard navigation & ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && fileType === 'pdf' && currentPage < (model.pageCount || 3)) {
        setCurrentPage(p => p + 1);
      }
      if (e.key === 'ArrowLeft' && fileType === 'pdf' && currentPage > 1) {
        setCurrentPage(p => p - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fileType, currentPage, model.pageCount, onClose]);

  const handleCopyContent = () => {
    let textToCopy = `${model.title}\n${model.author} • ${model.course}\n\n`;
    if (fileType === 'excel') {
      const sheet = model.sheets?.[activeSheetIdx];
      if (sheet) {
        textToCopy += sheet.columns.join('\t') + '\n';
        sheet.rows.forEach(r => {
          textToCopy += r.map(c => typeof c === 'object' && c !== null ? (c as any).value : c).join('\t') + '\n';
        });
      }
    } else {
      model.sections.forEach(s => {
        textToCopy += `${s.heading}\n${s.paragraphs.join('\n')}\n\n`;
      });
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeSheet: SpreadsheetSheet | undefined = model.sheets?.[activeSheetIdx];

  // Theme color accents
  const isExcel = fileType === 'excel';
  const isWord = fileType === 'word';
  const isPdf = fileType === 'pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full fixed inset-0 rounded-none'
            : 'w-full max-w-5xl h-[92vh] max-h-[900px]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* TOP TOOLBAR & HEADER */}
        {/* ========================================================================= */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* File Title & Meta */}
          <div className="flex items-center gap-3 min-w-0">
            {/* File Icon Badge */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                isExcel
                  ? 'bg-emerald-600 text-white'
                  : isWord
                  ? 'bg-blue-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {isExcel ? <Table className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {docItem.title || docItem.fileName}
                </h3>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isExcel
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : isWord
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                  }`}
                >
                  {isExcel ? 'Excel Spreadsheet' : isWord ? 'Word Document' : 'PDF Document'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{model.author}</span>
                <span>&bull;</span>
                <span>{model.course}</span>
                {docItem.fileSize && (
                  <>
                    <span>&bull;</span>
                    <span>{docItem.fileSize}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Controls: Zoom, Pages, Sheets, Download, Print, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Page Navigation for PDF */}
            {isPdf && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-slate-300/60 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 text-[11px]">
                  Page {currentPage} of {model.pageCount || 3}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= (model.pageCount || 3)}
                  onClick={() => setCurrentPage(p => Math.min(model.pageCount || 3, p + 1))}
                  className="p-1 rounded hover:bg-slate-300/60 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <button
                type="button"
                onClick={() => setZoomLevel(z => Math.max(70, z - 15))}
                className="p-1 rounded hover:bg-slate-300/60 dark:hover:bg-slate-700 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] w-9 text-center font-mono">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(z => Math.min(150, z + 15))}
                className="p-1 rounded hover:bg-slate-300/60 dark:hover:bg-slate-700 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyContent}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy Document Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={() => downloadDocumentFile(docItem)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              title="Download File to Computer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DOCUMENT VIEWPORT */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto bg-slate-200/60 dark:bg-slate-950 p-4 sm:p-8 flex justify-center">
          {/* 1. EXCEL SPREADSHEET VIEWER */}
          {isExcel && (
            <div
              className="w-full max-w-5xl bg-white dark:bg-slate-850 rounded-xl shadow-lg border border-slate-300 dark:border-slate-700 flex flex-col overflow-hidden self-start"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {/* Excel Ribbon Bar */}
              <div className="px-4 py-2 bg-emerald-700 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <Table className="w-4 h-4 text-emerald-200" />
                  <span>Microsoft Excel / CampusHub Sheets</span>
                  <span className="text-[10px] font-normal text-emerald-200">
                    &bull; {docItem.fileName}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-100 flex items-center gap-3">
                  <span>{activeSheet?.columns.length || 0} Columns</span>
                  <span>{activeSheet?.rows.length || 0} Rows</span>
                </div>
              </div>

              {/* Excel Formula Bar */}
              <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 flex items-center gap-2 text-xs font-mono">
                <span className="font-bold text-slate-500 italic px-1">fx</span>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
                <span className="text-slate-700 dark:text-slate-200 flex-1 truncate">
                  {selectedCell
                    ? selectedCell.formula || String(selectedCell.value)
                    : activeSheet?.rows[0]?.[1]
                    ? String(typeof activeSheet.rows[0][1] === 'object' && activeSheet.rows[0][1] !== null ? (activeSheet.rows[0][1] as any).value : activeSheet.rows[0][1])
                    : 'Select a cell to view value or formula'}
                </span>
              </div>

              {/* Grid Table */}
              <div className="overflow-x-auto max-h-[58vh]">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold sticky top-0 z-10 border-b border-slate-300 dark:border-slate-700">
                      <th className="w-10 px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 text-center font-mono text-[10px] text-slate-400">
                        #
                      </th>
                      {activeSheet?.columns.map((col, idx) => (
                        <th
                          key={idx}
                          className="px-3 py-2 border-r border-slate-300 dark:border-slate-700 text-left whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-mono text-[11px]">
                    {activeSheet?.rows.map((row, rIdx) => {
                      const isTotalRow = rIdx === activeSheet.rows.length - 1;
                      return (
                        <tr
                          key={rIdx}
                          className={`${
                            isTotalRow
                              ? 'bg-slate-100/90 dark:bg-slate-800 font-bold border-t-2 border-slate-400 dark:border-slate-600'
                              : rIdx % 2 === 0
                              ? 'bg-white dark:bg-slate-850'
                              : 'bg-slate-50/60 dark:bg-slate-800/30'
                          } hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors`}
                        >
                          <td className="w-10 px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 text-center text-[10px] text-slate-400 bg-slate-100/50 dark:bg-slate-800 select-none">
                            {rIdx + 1}
                          </td>
                          {row.map((cell, cIdx) => {
                            const cellValue = typeof cell === 'object' && cell !== null ? (cell as any).value : cell;
                            const cellFormula = typeof cell === 'object' && cell !== null ? (cell as any).formula : undefined;
                            const isSelected = selectedCell?.row === rIdx && selectedCell?.col === cIdx;

                            return (
                              <td
                                key={cIdx}
                                onClick={() => setSelectedCell({ row: rIdx, col: cIdx, value: cellValue, formula: cellFormula })}
                                className={`px-3 py-1.5 border-r border-slate-200 dark:border-slate-700 cursor-cell whitespace-nowrap ${
                                  isSelected
                                    ? 'outline-2 outline-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60'
                                    : ''
                                } ${
                                  typeof cellValue === 'number'
                                    ? 'text-right'
                                    : cellValue === 'Passed' || cellValue === '100% Validated'
                                    ? 'text-emerald-600 font-bold'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {typeof cellValue === 'number' ? cellValue.toLocaleString() : String(cellValue)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sheet Tabs Footer */}
              {model.sheets && model.sheets.length > 1 && (
                <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-700 flex items-center gap-2 overflow-x-auto">
                  <div className="flex items-center gap-1.5">
                    {model.sheets.map((sheet, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveSheetIdx(idx);
                          setSelectedCell(null);
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          activeSheetIdx === idx
                            ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-slate-300 dark:border-slate-600 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Layers className="w-3 h-3 text-emerald-600" />
                        <span>{sheet.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. WORD DOCUMENT VIEWER */}
          {isWord && (
            <div
              className="w-full max-w-3xl bg-white text-slate-800 rounded-sm shadow-2xl p-8 sm:p-14 border border-slate-300 space-y-6 self-start font-serif"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {/* Word Header with University Banner */}
              <div className="border-b-2 border-blue-900 pb-4 font-sans">
                <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-widest font-bold">
                  <span>CampusHub Academic Division</span>
                  <span>Document Manuscript</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 mt-2 font-serif">
                  {model.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2 font-sans">
                  <span><strong>Author:</strong> {model.author}</span>
                  <span>&bull;</span>
                  <span><strong>Course:</strong> {model.course}</span>
                  <span>&bull;</span>
                  <span><strong>Date:</strong> {model.date}</span>
                </div>
              </div>

              {/* Word Document Sections */}
              <div className="space-y-6 text-sm leading-relaxed text-slate-800">
                {model.sections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-3">
                    <h2 className="text-base sm:text-lg font-bold text-blue-900 font-sans tracking-tight border-b border-slate-200 pb-1">
                      {section.heading}
                    </h2>

                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-justify font-serif text-slate-800">
                        {p}
                      </p>
                    ))}

                    {/* Callout Quote */}
                    {section.callout && (
                      <div className="p-4 bg-blue-50/80 border-l-4 border-blue-600 text-blue-950 text-xs italic font-sans rounded-r-lg my-3">
                        <p>{section.callout}</p>
                      </div>
                    )}

                    {/* Formatted Data Table */}
                    {section.table && (
                      <div className="my-4 overflow-x-auto font-sans">
                        <table className="w-full text-xs border border-slate-300 rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-blue-900 text-white">
                              {section.table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="p-2.5 text-left font-bold border border-blue-800">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {section.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 border border-slate-200 text-slate-700">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Word Document Footer */}
              <div className="pt-6 border-t border-slate-200 text-xs text-slate-400 flex items-center justify-between font-sans">
                <span>Total Words: {model.wordCount || 1650} &bull; Standard Academic Layout</span>
                <span>Page 1 of {model.pageCount || 3}</span>
              </div>
            </div>
          )}

          {/* 3. PDF DOCUMENT VIEWER */}
          {isPdf && (
            <div
              className="w-full max-w-3xl bg-white text-slate-900 rounded-sm shadow-2xl p-8 sm:p-14 border border-slate-300 space-y-6 self-start font-sans"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {/* PDF Document Header */}
              <div className="text-center pb-6 border-b border-slate-200 space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  Official Academic Submission
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-['Space_Grotesk']">
                  {model.title}
                </h1>
                <div className="text-xs text-slate-500 flex items-center justify-center gap-3">
                  <span><strong>Submitted by:</strong> {model.author}</span>
                  <span>&bull;</span>
                  <span>{model.course}</span>
                  <span>&bull;</span>
                  <span>{model.date}</span>
                </div>
              </div>

              {/* PDF Page Content */}
              <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {model.sections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-2.5">
                    <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      <span>{section.heading}</span>
                    </h2>

                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="leading-relaxed">
                        {p}
                      </p>
                    ))}

                    {section.callout && (
                      <div className="p-3.5 bg-rose-50 border-l-4 border-rose-600 text-rose-950 font-mono text-xs rounded-r-lg">
                        {section.callout}
                      </div>
                    )}

                    {section.table && (
                      <div className="my-3 overflow-x-auto">
                        <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700">
                              {section.table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="p-2 text-left font-bold border border-slate-200">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 border border-slate-200 text-slate-600 font-mono text-[11px]">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* PDF Footer with Page Stamp */}
              <div className="pt-6 border-t border-slate-200 text-xs text-slate-400 flex items-center justify-between">
                <span>CampusHub Academic Portal &bull; Verified Digital Document</span>
                <span>Page {currentPage} of {model.pageCount || 3}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
