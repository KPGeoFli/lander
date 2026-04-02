import JSZip from "jszip";

interface ExportOptions {
  clientName: string;
  clientDomain?: string | null;
  clientSubdomain?: string | null;
  pageTitle: string;
  pageSlug: string;
  htmlContent: string;
}

export async function buildExportZip(options: ExportOptions): Promise<Buffer> {
  const {
    clientName,
    clientDomain,
    clientSubdomain,
    pageTitle,
    pageSlug,
    htmlContent,
  } = options;

  const zip = new JSZip();

  zip.file("index.html", htmlContent);

  const subdomain = clientSubdomain || "promo";
  const targetUrl = clientDomain
    ? `https://${subdomain}.${clientDomain}`
    : `https://${subdomain}.your-clients-domain.com`;

  const readme = buildReadme({
    clientName,
    pageTitle,
    pageSlug,
    targetUrl,
    subdomain,
    clientDomain,
  });

  zip.file("README.txt", readme);

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  return buffer;
}

function buildReadme(opts: {
  clientName: string;
  pageTitle: string;
  pageSlug: string;
  targetUrl: string;
  subdomain: string;
  clientDomain?: string | null;
}): string {
  const { clientName, pageTitle, targetUrl, subdomain, clientDomain } = opts;

  return `LANDING PAGE DEPLOYMENT INSTRUCTIONS
=====================================
Page:   ${pageTitle}
Client: ${clientName}
Target: ${targetUrl}
Date:   ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

This ZIP contains:
  index.html  ← Your complete, self-contained landing page

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPTION 1: Netlify Drop (Easiest — 2 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Go to https://app.netlify.com/drop
2. Drag this entire folder onto the page to deploy
3. In Netlify → Site settings → Domain management → Add custom domain:
   ${clientDomain ? subdomain + "." + clientDomain : "promo.your-clients-domain.com"}
4. Netlify will provide a CNAME value — add it to your DNS:
   Type: CNAME
   Name: ${subdomain}
   Value: [your-site-name].netlify.app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPTION 2: Cloudflare Pages
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Go to Cloudflare Dashboard → Pages → Create a project
2. Upload index.html as a Direct Upload project
3. Add custom domain: ${clientDomain ? subdomain + "." + clientDomain : "promo.your-clients-domain.com"}
4. If the domain is on Cloudflare, SSL is automatic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPTION 3: Any Web Host (cPanel, Plesk, etc.)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Log into the hosting control panel
2. Create a subdomain: ${subdomain}${clientDomain ? "." + clientDomain : ".your-clients-domain.com"}
   pointing to a new folder (e.g., /public_html/${subdomain}/)
3. Upload index.html into that folder

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DNS RECORD (required for custom domain)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:  CNAME
Name:  ${subdomain}
Value: [provided by your hosting/CDN provider]
TTL:   3600

Note: DNS propagation can take up to 24 hours, though typically < 30 minutes.
`;
}
