import Link from "next/link";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Plus, Globe, FileText, ChevronRight } from "lucide-react";

export default async function ClientsPage() {
  const clients = await db.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { pages: true } } },
  });

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Manage clients and their landing pages
            </p>
          </div>
          <Link href="/clients/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Client
            </Button>
          </Link>
        </div>

        {/* Empty state */}
        {clients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 mb-4">
              <Globe className="h-7 w-7 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              No clients yet
            </h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm">
              Add your first client to start building landing pages that bypass
              their clunky CMS.
            </p>
            <Link href="/clients/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add your first client
              </Button>
            </Link>
          </div>
        )}

        {/* Client grid */}
        {clients.length > 0 && (
          <div className="grid gap-3">
            {clients.map((client) => (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <Card className="hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {client.name}
                          </h3>
                          {client.industry && (
                            <Badge variant="outline">{client.industry}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                          {client.domain && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {client.subdomain
                                ? `${client.subdomain}.${client.domain}`
                                : client.domain}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {client._count.pages}{" "}
                            {client._count.pages === 1 ? "page" : "pages"}
                          </span>
                          <span>Added {formatDate(client.createdAt.toString())}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
