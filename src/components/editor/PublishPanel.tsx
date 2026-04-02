"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, Globe, Info } from "lucide-react";
import type { Client, LandingPage } from "@/types";

interface PublishPanelProps {
  page: LandingPage;
  client: Client;
  hasContent: boolean;
  onPublished: () => void;
}

export function PublishPanel({
  page,
  client,
  hasContent,
  onPublished,
}: PublishPanelProps) {
  const [exporting, setExporting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(page.status === "PUBLISHED");

  async function handleExport() {
    setExporting(true);
    const res = await fetch(`/api/pages/${page.id}/export`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers
        .get("Content-Disposition")
        ?.split("filename=")[1]
        ?.replace(/"/g, "") ?? `${page.slug}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  }

  async function handlePublish() {
    setPublishing(true);
    await fetch(`/api/pages/${page.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PUBLISHED" }),
    });
    setPublished(true);
    setPublishing(false);
    onPublished();
  }

  const targetUrl =
    client.domain && client.subdomain
      ? `${client.subdomain}.${client.domain}`
      : null;

  return (
    <div className="p-4 space-y-4">
      {/* Target URL */}
      {targetUrl && (
        <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <Globe className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-indigo-800">Target URL</p>
            <p className="text-sm text-indigo-700 font-mono mt-0.5">
              https://{targetUrl}
            </p>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-slate-700">Status</p>
        <Badge variant={published ? "success" : "outline"}>
          {published ? "Published" : page.status.toLowerCase()}
        </Badge>
      </div>

      {/* Export button */}
      <div>
        <Button
          onClick={handleExport}
          loading={exporting}
          disabled={!hasContent}
          className="w-full"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Building ZIP…" : "Export as ZIP"}
        </Button>
        {!hasContent && (
          <p className="text-xs text-slate-400 mt-1.5 text-center">
            Generate the page first before exporting
          </p>
        )}
        {hasContent && (
          <p className="text-xs text-slate-500 mt-1.5">
            Downloads a self-contained <code className="bg-slate-100 px-1 rounded">index.html</code> + deployment instructions
          </p>
        )}
      </div>

      {/* Publish/mark button */}
      {!published && hasContent && (
        <Button
          variant="outline"
          onClick={handlePublish}
          loading={publishing}
          className="w-full"
        >
          <CheckCircle className="h-4 w-4" />
          Mark as Published
        </Button>
      )}

      {published && (
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4" />
          This page is marked as published
        </div>
      )}

      {/* Deployment guide */}
      {hasContent && (
        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            <p className="text-xs font-medium text-slate-600">Quick Deploy</p>
          </div>
          <ol className="space-y-1.5 text-xs text-slate-600">
            <li className="flex gap-2">
              <span className="font-bold text-indigo-600 flex-shrink-0">1.</span>
              Export the ZIP above
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-indigo-600 flex-shrink-0">2.</span>
              Go to{" "}
              <strong>netlify.com/drop</strong> and drag the folder
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-indigo-600 flex-shrink-0">3.</span>
              {targetUrl
                ? `Add custom domain: ${targetUrl}`
                : "Add the client's custom subdomain"}
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-indigo-600 flex-shrink-0">4.</span>
              Add CNAME DNS record (instructions in ZIP)
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
