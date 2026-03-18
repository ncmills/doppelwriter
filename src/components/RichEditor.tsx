"use client";

import { useRef, useCallback } from "react";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichEditor({ value, onChange, placeholder, className }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    // Allow rich text paste — browser handles formatting preservation
    // Only strip if it's from external sources with heavy styling
    const html = e.clipboardData.getData("text/html");
    if (html) {
      e.preventDefault();
      // Clean but preserve basic formatting (bold, italic, links, lists)
      const cleaned = html
        .replace(/class="[^"]*"/g, "")
        .replace(/style="[^"]*"/g, "")
        .replace(/id="[^"]*"/g, "");
      document.execCommand("insertHTML", false, cleaned);
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    }
    // If no HTML, let plain text paste through normally
  }, [onChange]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-stone-800 bg-stone-900/80">
        <button onClick={() => exec("bold")} className="p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-white transition-colors" title="Bold">
          <span className="font-bold text-xs">B</span>
        </button>
        <button onClick={() => exec("italic")} className="p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-white transition-colors" title="Italic">
          <span className="italic text-xs">I</span>
        </button>
        <button onClick={() => exec("underline")} className="p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-white transition-colors" title="Underline">
          <span className="underline text-xs">U</span>
        </button>
        <div className="w-px h-4 bg-stone-700 mx-1" />
        <button onClick={() => exec("insertUnorderedList")} className="p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-white transition-colors text-xs" title="Bullet list">
          &#8226;
        </button>
        <button onClick={() => exec("insertOrderedList")} className="p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-white transition-colors text-xs" title="Numbered list">
          1.
        </button>
        <div className="w-px h-4 bg-stone-700 mx-1" />
        <select
          onChange={(e) => { if (e.target.value) exec("formatBlock", e.target.value); e.target.value = ""; }}
          className="bg-stone-800 text-stone-400 text-xs rounded px-2 py-1 border-none focus:outline-none"
          defaultValue=""
        >
          <option value="" disabled>Heading</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
        </select>
        <select
          onChange={(e) => { if (e.target.value) exec("fontSize", e.target.value); e.target.value = ""; }}
          className="bg-stone-800 text-stone-400 text-xs rounded px-2 py-1 border-none focus:outline-none"
          defaultValue=""
        >
          <option value="" disabled>Size</option>
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: value }}
        className={`flex-1 p-4 overflow-auto focus:outline-none leading-relaxed text-white ${className || ""}`}
        data-placeholder={placeholder}
        style={{ minHeight: 350 }}
      />

      {/* Styles in globals.css */}
    </div>
  );
}
