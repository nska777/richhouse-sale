"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Lang, SaleProduct, SaleSetting } from "./sale-types";

type Props = {
  lang: Lang;
  setting: SaleSetting | null;
  products: SaleProduct[];
  loading: boolean;
  copy: Record<string, string>;
};

type PreviewImage = {
  src: string;
  title: string;
} | null;

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ||
  "https://api.rframe.ru";

const PHONE_HREF = "tel:+998900021230";
const TELEGRAM_URL = "https://t.me/Mebel_LD";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function getNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  }

  return 0;
}

function formatPrice(value: unknown) {
  const num = getNumber(value);
  if (!num) return "";

  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(num)} UZS`;
}

function resolveImageUrl(url: unknown): string {
  const src = getText(url);
  if (!src) return "";

  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return `${STRAPI_URL}${src}`;

  return `${STRAPI_URL}/${src}`;
}

function extractImageUrl(product: SaleProduct): string {
  const p = product as unknown as Record<string, unknown>;

  const directImageFile = resolveImageUrl(p.imageFile);
  if (directImageFile) return directImageFile;

  const image = p.image;

  if (typeof image === "string") {
    return resolveImageUrl(image);
  }

  if (Array.isArray(image)) {
    const first = image[0];

    if (isRecord(first)) {
      const url = resolveImageUrl(first.url);
      if (url) return url;
    }
  }

  if (isRecord(image)) {
    const directUrl = resolveImageUrl(image.url);
    if (directUrl) return directUrl;

    const data = image.data;

    if (isRecord(data)) {
      const dataUrl = resolveImageUrl(data.url);
      if (dataUrl) return dataUrl;

      const attributes = data.attributes;
      if (isRecord(attributes)) {
        const attrUrl = resolveImageUrl(attributes.url);
        if (attrUrl) return attrUrl;
      }
    }

    if (Array.isArray(data)) {
      const first = data[0];

      if (isRecord(first)) {
        const firstUrl = resolveImageUrl(first.url);
        if (firstUrl) return firstUrl;

        const attributes = first.attributes;
        if (isRecord(attributes)) {
          const attrUrl = resolveImageUrl(attributes.url);
          if (attrUrl) return attrUrl;
        }
      }
    }
  }

  return "";
}

function getTitle(product: SaleProduct, lang: Lang) {
  const p = product as unknown as Record<string, unknown>;

  const titleRu = getText(p.title);
  const titleUz = getText(p.title_uz);

  if (lang === "uz" && titleUz) return titleUz;

  return titleRu || "Товар RichHouse";
}

export default function SaleProducts({
  lang,
  setting,
  products,
  loading,
  copy,
}: Props) {
  const [previewImage, setPreviewImage] = useState<PreviewImage>(null);

  const activeProducts = useMemo(() => {
    return products
      .filter((product) => product?.isActive !== false)
      .sort((a, b) => {
        const aa = getNumber((a as any).sortOrder) || 1000;
        const bb = getNumber((b as any).sortOrder) || 1000;
        return aa - bb;
      });
  }, [products]);

  return (
    <section
      id="products"
      className="relative px-4 pb-20 pt-10 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.45em] text-[#b88746]">
              {copy.productsKicker || "Товары распродажи"}
            </p>

            <h2 className="text-4xl font-black tracking-tight text-[#101010] sm:text-5xl lg:text-6xl">
              {copy.productsTitle || "Выберите позицию"}
            </h2>
          </div>

          <p className="text-sm font-semibold text-black/45">
            {copy.found || "Найдено"}: {activeProducts.length}{" "}
            {lang === "uz" ? "mahsulot" : "товаров"}
          </p>
        </div>

        {loading ? (
          <div className="rounded-[34px] bg-white p-10 text-center shadow-[0_20px_70px_rgba(0,0,0,0.06)]">
            <p className="text-sm font-bold text-black/45">
              {copy.loading || "Загрузка товаров..."}
            </p>
          </div>
        ) : activeProducts.length === 0 ? (
          <div className="rounded-[34px] bg-white p-10 text-center shadow-[0_20px_70px_rgba(0,0,0,0.06)]">
            <p className="text-sm font-bold text-black/45">
              {copy.noProducts || "Товары пока не добавлены."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeProducts.map((product, index) => {
              const title = getTitle(product, lang);
              const imageUrl = extractImageUrl(product);
              const price = formatPrice((product as any).price);

              return (
                <article
                  key={`${getText((product as any).id) || title}-${index}`}
                  className="group overflow-hidden rounded-[34px] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.08)]"
                >
                  <div className="relative h-[330px] overflow-hidden bg-[#ececec] sm:h-[360px] lg:h-[390px]">
                    {imageUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImage({
                            src: imageUrl,
                            title,
                          })
                        }
                        className="relative block h-full w-full cursor-zoom-in overflow-hidden bg-white"
                        aria-label={`Открыть фото ${title}`}
                      >
                        <Image
                          src={imageUrl}
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="scale-[1.24] object-cover object-center transition-transform duration-500 group-hover:scale-[1.32]"
                        />
                      </button>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs font-black uppercase tracking-[0.35em] text-black/25">
                          Нет фото
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 sm:p-7">
                    <h3 className="min-h-[64px] text-2xl font-black leading-tight tracking-tight text-[#101010]">
                      {title}
                    </h3>

                    {price ? (
                      <p className="mt-3 text-3xl font-black tracking-tight text-[#101010]">
                        {price}
                      </p>
                    ) : null}

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <a
                        href={PHONE_HREF}
                        className="flex h-14 items-center justify-center rounded-full bg-[#12b84f] px-4 text-center text-sm font-black text-white shadow-[0_16px_36px_rgba(18,184,79,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0fab48]"
                      >
                        {copy.call || "Позвонить"}
                      </a>

                      <a
                        href={TELEGRAM_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-14 items-center justify-center rounded-full bg-[#1c9ed8] px-4 text-center text-sm font-black text-white shadow-[0_16px_36px_rgba(28,158,216,0.22)] transition hover:-translate-y-0.5 hover:bg-[#168fc4]"
                      >
                        {copy.telegram || "Написать в Telegram"}
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
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black text-2xl font-black leading-none text-white shadow-lg transition hover:scale-105"
              aria-label="Закрыть"
            >
              ×
            </button>

            <div className="relative h-[78vh] w-full bg-white">
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
        </div>
      ) : null}
    </section>
  );
}
