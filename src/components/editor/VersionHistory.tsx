"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { History, Loader2 } from "lucide-react";

interface Version {
  id: string;
  versionNum: number;
  prompt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface VersionHistoryProps {
  pageId: string;
  refreshKey: number;
  onVersionSwitch: () => void;
}

export function VersionHistory({
  pageId,
  refreshKey,
  onVersionSwitch,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/pages/${pageId}/versions`)
      .then((r) => r.json())
      .then((data) => {
        setVersions(data);
        setLoading(false);
      });
  }, [pageId, refreshKey]);

  async function switchVersion(versionId: string) {
    setSwitching(versionId);
    await fetch(`/api/pages/${pageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeVersionId: versionId }),
    });
    setSwitching(null);
    onVersionSwitch();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
        <History className="h-8 w-8 text-slate-300 mb-2" />
        <p className="text-sm text-slate-500">No versions yet</p>
        <p className="text-xs text-slate-400 mt-1">
          Generated versions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-slate-100">
      {versions.map((v) => (
        <button
          key={v.id}
          onClick={() => !v.isActive && switchVersion(v.id)}
          disabled={v.isActive || switching === v.id}
          className={cn(
            "flex flex-col gap-1 px-4 py-3 text-left transition-colors",
            v.isActive
              ? "bg-indigo-50 cursor-default"
              : "hover:bg-slate-50 cursor-pointer"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              v{v.versionNum}
            </span>
            <div className="flex items-center gap-1.5">
              {v.isActive && (
                <Badge variant="success" className="text-xs">
                  Active
                </Badge>
              )}
              {switching === v.id && (
                <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
              )}
            </div>
          </div>
          {v.prompt && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {v.prompt}
            </p>
          )}
          <p className="text-xs text-slate-400">
            {formatDateTime(v.createdAt)}
          </p>
        </button>
      ))}
    </div>
  );
}
