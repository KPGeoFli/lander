import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageEditor } from "@/components/editor/PageEditor";
import { AppShell } from "@/components/layout/AppShell";

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string; pageId: string }>;
  searchParams: Promise<{ generate?: string; prompt?: string }>;
}) {
  const { clientId, pageId } = await params;
  const { generate, prompt } = await searchParams;

  const page = await db.landingPage.findUnique({
    where: { id: pageId },
    include: {
      client: true,
      versions: { orderBy: { versionNum: "desc" } },
    },
  });

  if (!page || page.clientId !== clientId) notFound();

  const activeVersion = page.versions.find((v) => v.isActive) ?? null;

  // Serialize dates for client components
  const serializedPage = {
    ...page,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
    client: {
      ...page.client,
      createdAt: page.client.createdAt.toISOString(),
      updatedAt: page.client.updatedAt.toISOString(),
    },
    versions: page.versions.map((v) => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
    })),
    activeVersion: activeVersion
      ? {
          ...activeVersion,
          createdAt: activeVersion.createdAt.toISOString(),
        }
      : null,
  };

  return (
    <AppShell>
      <PageEditor
        page={serializedPage}
        autoGenerate={generate === "true"}
        autoGeneratePrompt={prompt ?? ""}
      />
    </AppShell>
  );
}
