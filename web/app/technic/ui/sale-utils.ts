import type { Lang, StrapiMedia } from "./sale-types";

export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getUrlFromMedia(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return getUrlFromMedia(value[0]);
  }

  if (!isRecord(value)) return "";

  const directUrl = value.url;
  if (typeof directUrl === "string") return directUrl;

  const data = value.data;
  if (data) return getUrlFromMedia(data);

  const attributes = value.attributes;
  if (attributes) return getUrlFromMedia(attributes);

  const formats = value.formats;
  if (isRecord(formats)) {
    const large = formats.large;
    const medium = formats.medium;
    const small = formats.small;
    const thumbnail = formats.thumbnail;

    return (
      getUrlFromMedia(large) ||
      getUrlFromMedia(medium) ||
      getUrlFromMedia(small) ||
      getUrlFromMedia(thumbnail)
    );
  }

  return "";
}

export function mediaUrl(media?: StrapiMedia | StrapiMedia[] | unknown | null) {
  const url = getUrlFromMedia(media);

  if (!url) return "";
  if (url.startsWith("http")) return url;

  return `${STRAPI_URL}${url}`;
}

export function formatPrice(value?: number | string | null) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return "";

  return (
    new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: 0,
    }).format(n) + " UZS"
  );
}

export function normalizePhone(phone?: string | null) {
  return String(phone || "").replace(/[^\d+]/g, "");
}

export function whatsappLink(raw?: string | null) {
  const clean = normalizePhone(raw).replace("+", "");
  if (!clean) return "";
  return `https://wa.me/${clean}`;
}

export function pickText(lang: Lang, ru?: string | null, uz?: string | null) {
  const ruText = String(ru || "").trim();
  const uzText = String(uz || "").trim();

  if (lang === "uz") return uzText || ruText;
  return ruText || uzText;
}