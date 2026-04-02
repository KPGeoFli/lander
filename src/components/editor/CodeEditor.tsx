"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Copy, Check } from "lucide-react";

interface CodeEditorProps {
  pageId: string;
  html: string;
  onSaved: () => void;
}

export function CodeEditor({ pageId, html, onSaved }: CodeEditorProps) {
  const [code, setCode] = useState(html);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (code === html) return; // no change
    setSaving(true);
    setError("");
    const res = await fetch(`/api/pages/${pageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ htmlContent: code }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Failed to save. Please try again.");
      return;
    }
    onSaved();
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white flex-shrink-0">
        <p className="text-sm font-medium text-slate-700">HTML Source</p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            loading={saving}
            disabled={code === html}
          >
            <Save className="h-3.5 w-3.5" />
            Save as New Version
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full p-4 font-mono text-xs text-slate-800 bg-slate-950 text-slate-100 resize-none focus:outline-none leading-relaxed"
          spellCheck={false}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 px-4 py-2 border-t border-slate-200">
          {error}
        </p>
      )}
    </div>
  );
}
