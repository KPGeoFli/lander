import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, parseBrandColors } from "@/lib/utils";
import {
  Plus,
  Globe,
  Pencil,
  FileText,
  ChevronRight,
  Clock,
} from "lucide-react";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const client = await db.client.findUnique({
    where: { id: clientId },
    include: {
      pages: {
        orderBy: { createdAt: "desc" },
        include: {
          versions: { where: { isActive: true }, take: 1 },
          _count: { select: { versions: true } },
        },
      },
    },
  });

  if (!client) notFound();

  const colors = parseBrandColors(client.brandColors);

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-4">
          <Link href="/clients" className="hover:text-slate-900">
            Clients
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{client.name}</span>
        </nav>

        {/* Client header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0">
              <span className="text-white font-bold text-xl">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  {client.name}
                </h1>
                {client.industry && (
                  <Badge variant="outline">{client.industry}</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                {client.domain && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    {client.domain}
                  </span>
                )}
                {client.domain && client.subdomain && (
                  <span className="text-indigo-600 font-medium text-xs bg-indigo-50 px-2 py-0.5 rounded-md">
                    → {client.subdomain}.{client.domain}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link href={`/clients/${client.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
        </div>

        {/* Brand colors */}
        {colors && (
          <div className="flex items-center gap-3 mb-6 p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Brand Colors
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="h-5 w-5 rounded-full border border-white shadow"
                style={{ background: colors.primary }}
                title={`Primary: ${colors.primary}`}
              />
              <div
                className="h-5 w-5 rounded-full border border-white shadow"
                style={{ background: colors.secondary }}
                title={`Secondary: ${colors.secondary}`}
              />
              {colors.accent && (
                <div
                  className="h-5 w-5 rounded-full border border-white shadow"
                  style={{ background: colors.accent }}
                  title={`Accent: ${colors.accent}`}
                />
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {client.notes && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            {client.notes}
          </div>
        )}

        {/* Landing pages */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Landing Pages
          </h2>
          <Link href={`/clients/${client.id}/pages/new`}>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              New Page
            </Button>
          </Link>
        </div>

        {client.pages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">
              No landing pages yet
            </h3>
            <p className="text-sm text-slate-500 mb-4 max-w-xs">
              Create your first AI-generated landing page for {client.name}.
            </p>
            <Link href={`/clients/${client.id}/pages/new`}>
              <Button size="sm">
                <Plus className="h-3.5 w-3.5" />
                Create first page
              </Button>
            </Link>
          </div>
        )}

        {client.pages.length > 0 && (
          <div className="grid gap-3">
            {client.pages.map((page) => {
              const hasContent = page.versions.length > 0;
              return (
                <Link
                  key={page.id}
                  href={`/clients/${client.id}/pages/${page.id}`}
                >
                  <Card className="hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                            hasContent ? "bg-indigo-50" : "bg-slate-100"
                          }`}
                        >
                          <FileText
                            className={`h-4 w-4 ${hasContent ? "text-indigo-500" : "text-slate-400"}`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">
                              {page.title}
                            </p>
                            <Badge
                              variant={
                                page.status === "PUBLISHED"
                                  ? "success"
                                  : page.status === "ARCHIVED"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {page.status.toLowerCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(page.createdAt.toString())}
                            </span>
                            <span>{page._count.versions} version{page._count.versions !== 1 ? "s" : ""}</span>
                            {!hasContent && (
                              <span className="text-amber-600">
                                Not generated yet
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
