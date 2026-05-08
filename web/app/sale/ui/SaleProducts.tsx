"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Lang, SaleProduct, SaleSetting } from "./sale-types";
import { STRAPI_URL } from "./sale-utils";

type Props = {
  lang: Lang;
  setting: SaleSetting | null;
  products: SaleProduct[];
  loading: boolean;
  copy?: {
    productsEyebrow?: string;
    productsTitle?: string;
    found?: string;
    loading?: string;
  };
};

type PreviewImage = {
  src: string;
  title: string;
};

const PHONE_DISPLAY = "+998 90 002 12 30";
const PHONE_HREF = "tel:+998900021230";
const TELEGRAM_URL = "https://t.me/Mebel_LD";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getProp(obj: unknown, key: string): unknown {
  return isRecord(obj) ? obj[key] : undefined;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const cleaned = value.replace(/\s/g, "").replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  return 0;
}

function getAttributes(item: SaleProduct): Record<string, unknown> {
  const maybeAttributes = getProp(item, "attributes");

  if (isRecord(maybeAttributes)) return maybeAttributes;

  return isRecord(item) ? item : {};
}

function pickText(item: SaleProduct, lang: Lang, key: string): string {
  const attrs = getAttributes(item);

  if (lang === "uz") {
    const uz = asString(attrs[`${key}_uz`]);
    if (uz) return uz;
  }

  return asString(attrs[key]);
}

function pickTitle(item: SaleProduct, lang: Lang): string {
  return (
    pickText(item, lang, "title") ||
    pickText(item, "ru", "title") ||
    "Товар RichHouse"
  );
}

function pickPrice(item: SaleProduct): number {
  const attrs = getAttributes(item);
  return asNumber(attrs.price);
}

function formatPrice(value: number): string {
  if (!value) return "Цена по запросу";

  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(value)} UZS`;
}

function getImageFromMedia(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    const first = value[0];
    return getImageFromMedia(first);
  }

  if (!isRecord(value)) return "";

  const directUrl = asString(value.url);
  if (directUrl) return directUrl;

  const data = value.data;
  if (Array.isArray(data)) return getImageFromMedia(data[0]);
  if (isRecord(data)) return getImageFromMedia(data);

  const attrs = value.attributes;
  if (isRecord(attrs)) return getImageFromMedia(attrs);

  return "";
}

function resolveImageUrl(path: string): string {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${STRAPI_URL}${path}`;
  }

  return `${STRAPI_URL}/uploads/${path}`;
}

function pickImage(item: SaleProduct): string {
  const attrs = getAttributes(item);

  const mediaUrl =
    getImageFromMedia(attrs.image) ||
    getImageFromMedia(attrs.photo) ||
    getImageFromMedia(attrs.media) ||
    getImageFromMedia(attrs.cover);

  if (mediaUrl) return resolveImageUrl(mediaUrl);

  const imageFile = asString(attrs.imageFile);
  if (imageFile) return resolveImageUrl(imageFile);

  return "";
}

export default function SaleProducts({ lang, products, loading, copy }: Props) {
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);

  const sectionCopy = useMemo(
    () => ({
      eyebrow:
        copy?.productsEyebrow ||
        (lang === "uz" ? "SOTUV MAHSULOTLARI" : "ТОВАРЫ РАСПРОДАЖИ"),
      title:
        copy?.productsTitle ||
        (lang === "uz" ? "Mahsulotni tanlang" : "Выберите позицию"),
      found: copy?.found || (lang === "uz" ? "Topildi" : "Найдено"),
      loading:
        copy?.loading || (lang === "uz" ? "Yuklanmoqda..." : "Загрузка..."),
      noPhoto: lang === "uz" ? "RASM YO‘Q" : "НЕТ ФОТО",
      call: lang === "uz" ? "Qo‘ng‘iroq qilish" : "Позвонить",
      telegram:
        lang === "uz" ? "Telegram orqali yozish" : "Написать в Telegram",
      close: lang === "uz" ? "Yopish" : "Закрыть",
      empty: lang === "uz" ? "Hozircha mahsulotlar yo‘q" : "Пока товаров нет",
    }),
    [copy, lang],
  );

  useEffect(() => {
    if (!previewImage) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [previewImage]);

  const items = useMemo(() => {
    return [...products].sort((a, b) => {
      const aa = asNumber(getAttributes(a).sortOrder) || 1000;
      const bb = asNumber(getAttributes(b).sortOrder) || 1000;
      return aa - bb;
    });
  }, [products]);

  return (
    <section id="products" className="relative px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="gold-text mb-2 text-xs font-black uppercase tracking-[0.42em]">
              {sectionCopy.eyebrow}
            </p>

            <h2 className="max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.06em] text-[#111113] sm:text-6xl lg:text-7xl">
              {sectionCopy.title}
            </h2>
          </div>

          <p className="text-sm font-semibold text-[#7b7b82]">
            {loading
              ? sectionCopy.loading
              : `${sectionCopy.found}: ${items.length} товаров`}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="soft-card h-[520px] animate-pulse rounded-[32px]"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="soft-card rounded-[32px] px-6 py-12 text-center text-lg font-bold text-[#7b7b82]">
            {sectionCopy.empty}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product, index) => {
              const title = pickTitle(product, lang);
              const price = pickPrice(product);
              const imageSrc = pickImage(product);

              return (
                <article
                  key={`${title}-${index}`}
                  className="product-card group overflow-hidden rounded-[32px] bg-white shadow-[0_18px_55px_rgba(0,0,0,0.08)] ring-1 ring-black/5"
                  style={{ "--i": index } as React.CSSProperties}
                >
                  {imageSrc ? (
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ src: imageSrc, title })}
                      className="relative block h-[300px] w-full overflow-hidden bg-white text-left sm:h-[320px] lg:h-[340px]"
                      aria-label={title}
                    >
                      <Image
                        src={imageSrc}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="image-soft object-cover object-top scale-[1.12]"
                      />
                    </button>
                  ) : (
                    <div className="flex h-[300px] w-full items-center justify-center bg-[#ededee] sm:h-[320px] lg:h-[340px]">
                      <span className="text-sm font-black uppercase tracking-[0.35em] text-[#a7a7ad]">
                        {sectionCopy.noPhoto}
                      </span>
                    </div>
                  )}

                  <div className="p-6 sm:p-7">
                    <h3 className="mb-4 min-h-[58px] text-2xl font-black leading-[1.08] tracking-[-0.04em] text-[#111113]">
                      {title}
                    </h3>

                    <p className="mb-6 text-3xl font-black tracking-[-0.05em] text-[#111113]">
                      {formatPrice(price)}
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <a
                        href={PHONE_HREF}
                        className="btn-premium flex h-14 items-center justify-center rounded-full bg-[#12b84f] px-5 text-center text-sm font-black text-white shadow-[0_14px_30px_rgba(18,184,79,0.25)]"
                      >
                        {sectionCopy.call}
                      </a>

                      <a
                        href={TELEGRAM_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-premium flex h-14 items-center justify-center rounded-full bg-[#229ed9] px-5 text-center text-sm font-black text-white shadow-[0_14px_30px_rgba(34,158,217,0.25)]"
                      >
                        {sectionCopy.telegram}
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {previewImage ? (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-black text-black shadow-xl"
            aria-label={sectionCopy.close}
          >
            ×
          </button>

          <div
            className="relative h-[82vh] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={previewImage.src}
              alt={previewImage.title}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
