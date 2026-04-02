export type PageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface BrandColors {
  primary: string;
  secondary: string;
  accent?: string;
}

export interface Client {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  subdomain: string | null;
  logoUrl: string | null;
  brandColors: string | null; // JSON string
  industry: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { pages: number };
}

export interface LandingPage {
  id: string;
  clientId: string;
  title: string;
  slug: string;
  prompt: string;
  status: PageStatus;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  versions?: PageVersion[];
  activeVersion?: PageVersion | null;
}

export interface PageVersion {
  id: string;
  pageId: string;
  versionNum: number;
  htmlContent: string;
  prompt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Deployment {
  id: string;
  pageId: string;
  versionId: string;
  targetDomain: string | null;
  notes: string | null;
  exportedAt: string;
}
