// ── PageMeta ──────────────────────────────────────────────────
// Per-route meta tags via document.title and Open Graph.
// Works without a library — just uses useEffect.
// (J6)
import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description?: string;
  image?: string;
}

const DEFAULT_DESCRIPTION = "Find peer tutors at AUB, LAU, and NDU. Learn from students who've been there.";
const DEFAULT_IMAGE = "https://teachme.app/og-default.png"; // placeholder
const SITE_NAME = "Teachme";

function setMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function PageMeta({ title, description, image }: PageMetaProps) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  const desc = description ?? DEFAULT_DESCRIPTION;
  const img = image ?? DEFAULT_IMAGE;

  useEffect(() => {
    document.title = fullTitle;
    setMeta("description", desc);
    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", desc, true);
    setMeta("og:image", img, true);
    setMeta("og:type", "website", true);
    setMeta("og:site_name", SITE_NAME, true);
    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
    setMeta("twitter:image", img);
  }, [fullTitle, desc, img]);

  return null;
}
