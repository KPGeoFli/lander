import Anthropic from "@anthropic-ai/sdk";
import { parseBrandColors } from "./utils";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert landing page developer for a marketing agency. Your job is to create high-converting, professional landing pages for paid ad campaigns.

STRICT OUTPUT RULES:
- Output ONLY a single complete HTML document. Nothing else.
- No markdown. No code fences. No explanation. No preamble. No comments outside the HTML.
- Start your response with <!DOCTYPE html> and end with </html>

HTML REQUIREMENTS:
- Fully self-contained: all CSS must be in <style> tags, all JS in <script> tags
- Mobile-first responsive design using CSS only (no external frameworks like Bootstrap or Tailwind CDN)
- No external JS libraries or CDN links (no jQuery, no React, nothing external)
- All images use https://picsum.photos/[width]/[height]?random=[seed] unless specific image URLs are provided
- Semantic HTML5 structure with proper meta tags
- Include <meta name="viewport" content="width=device-width, initial-scale=1">
- Include a compelling <title> tag

DESIGN REQUIREMENTS:
- Professional, modern design with clean typography
- Strong visual hierarchy with a prominent headline and CTA above the fold
- Mobile-first: looks great on phones, tablets, and desktops
- Fast-loading: no render-blocking resources
- Conversion-focused: clear call-to-action buttons, trust signals, benefit-oriented copy

TYPICAL LANDING PAGE SECTIONS (include what's relevant):
- Hero section with headline, subheadline, and primary CTA button
- Benefits/features section (3-4 key points with icons or visuals)
- Social proof (testimonials, star ratings, or statistics)
- About/trust section
- Secondary CTA section
- Simple contact form or lead capture form (use action="#" method="post")
- Footer with basic info

FORM HANDLING:
- Use action="#" method="post" on forms
- Include a simple JS handler that shows a success message on submit
- Never use external form services

STYLE GUIDELINES:
- Use CSS custom properties (variables) for colors at the top of your styles
- Use system font stack or Google Fonts loaded via @import (acceptable since it's just a font)
- Generous whitespace, clear sections with alternating backgrounds
- Buttons should be large, colorful, and have hover states`;

interface GenerateOptions {
  clientName: string;
  clientDomain?: string | null;
  clientBrandColors?: string | null;
  clientIndustry?: string | null;
  prompt: string;
  existingHtml?: string | null;
  isRefinement?: boolean;
}

export function buildUserPrompt(options: GenerateOptions): string {
  const {
    clientName,
    clientDomain,
    clientBrandColors,
    clientIndustry,
    prompt,
    existingHtml,
    isRefinement,
  } = options;

  const colors = parseBrandColors(clientBrandColors ?? null);
  const colorInfo = colors
    ? `Primary: ${colors.primary}, Secondary: ${colors.secondary}${colors.accent ? `, Accent: ${colors.accent}` : ""}`
    : null;

  let userPrompt = `CLIENT CONTEXT:
- Client name: ${clientName}${clientDomain ? `\n- Website domain: ${clientDomain}` : ""}${clientIndustry ? `\n- Industry: ${clientIndustry}` : ""}${colorInfo ? `\n- Brand colors: ${colorInfo}` : ""}

`;

  if (isRefinement && existingHtml) {
    userPrompt += `REFINEMENT REQUEST:
The landing page already exists. Apply the following change and return the complete updated HTML document.

CHANGE TO APPLY: ${prompt}

CURRENT HTML:
${existingHtml}`;
  } else {
    userPrompt += `PAGE REQUEST:
${prompt}

Generate a complete, professional landing page for this client based on the request above.`;
  }

  return userPrompt;
}

export async function generateLandingPage(
  options: GenerateOptions
): Promise<ReadableStream<Uint8Array>> {
  const userPrompt = buildUserPrompt(options);

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      stream.abort();
    },
  });
}
