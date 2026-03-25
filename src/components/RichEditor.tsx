"use client";

import { useRef, useCallback, useEffect } from "react";
import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["b", "i", "u", "strong", "em", "a", "p", "br", "h1", "h2", "h3", "ul", "ol", "li", "span", "div"];

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichEditor({ value, onChange, placeholder, className }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync value prop to editor only when it changes externally
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      const sanitized = DOMPurify.sanitize(value, { ALLOWED_TAGS });
      if (editorRef.current.innerHTML !== sanitized) {
        editorRef.current.innerHTML = sanitized;
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(DOMPurify.sanitize(editorRef.current.innerHTML, { ALLOWED_TAGS }));
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(DOMPurify.sanitize(editorRef.current.innerHTML, { ALLOWED_TAGS }));
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const html = e.clipboardData.getData("text/html");
    if (html) {
      e.preventDefault();
      // Sanitize pasted HTML — strip everything except safe tags
      const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS });
      document.execCommand("insertHTML", false, clean);
      if (editorRef.current) {
        isInternalUpdate.current = true;
        onChange(DOMPurify.sanitize(editorRef.current.innerHTML, { ALLOWED_TAGS }));
      }
    }
  }, [onChange]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 sm:py-2 border-b border-stone-800 bg-stone-900/80 overflow-x-auto">
        <button onClick={() => exec("bold")} className="p-2 sm:p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-white transition-colors shrink-0" title="Bold">
          <span className="font-bold text-xs">B</span>
        </button>
        <button onClick={() => exec("italic")} className="p-2 sm:p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-white transition-colors shrink-0" title="Italic">
          <span className="italic text-xs">I</span>
        </button>
        <button onClick={() => exec("underline")} className="p-2 sm:p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-white transition-colors shrink-0" title="Underline">
          <span className="underline text-xs">U</span>
        </button>
        <div className="w-px h-4 bg-stone-700 mx-0.5 sm:mx-1 shrink-0" />
        <button onClick={() => exec("insertUnorderedList")} className="p-2 sm:p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-white transition-colors text-xs shrink-0" title="Bullet list">
          &#8226;
        </button>
        <button onClick={() => exec("insertOrderedList")} className="p-2 sm:p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-white transition-colors text-xs shrink-0" title="Numbered list">
          1.
        </button>
        <div className="w-px h-4 bg-stone-700 mx-0.5 sm:mx-1 shrink-0" />
        <select
          onChange={(e) => { if (e.target.value) exec("formatBlock", e.target.value); e.target.value = ""; }}
          className="bg-stone-800 text-stone-400 text-xs rounded px-2 py-2 sm:py-1 border-none focus:outline-none shrink-0"
          defaultValue=""
        >
          <option value="" disabled>Heading</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
        </select>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        suppressContentEditableWarning
        className={`flex-1 p-4 overflow-auto focus:outline-none leading-relaxed text-white ${className || ""}`}
        data-placeholder={placeholder}
        role="textbox"
        aria-label="Rich text editor"
        style={{ minHeight: 200 }}
      />
    </div>
  );
}
