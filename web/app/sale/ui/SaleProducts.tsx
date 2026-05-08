"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Lang, SaleProduct, SaleSetting } from "./sale-types";
import { STRAPI_URL } from "./sale-utils";

type Copy = Record<string, string>;

type Props = {
  lang: Lang;
  setting: SaleSetting | null;
  products: SaleProduct[];
  loading: boolean;
  copy?: Copy;
};

type PreviewImage = {
  src: string;
  title: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getProp(obj: unknown, key: string): unknown {
  return isRecord(obj) ? obj[key] : undefined;
}

function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function asNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  }

  return 0;
}

function formatPrice(value: unknown) {
  const price = asNumber(value);

  if (!price) return "Цена по запросу";

  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(price)} UZS`;
}

function cleanBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function resolveImageUrl(url: string) {
  const clean = url.trim();

  if (!clean) return "";

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  if (clean.startsWith("/uploads/")) {
    return `${cleanBaseUrl(STRAPI_URL)}${clean}`;
  }

  return `${cleanBaseUrl(STRAPI_URL)}/uploads/${clean.replace(/^\/+/, "")}`;
}

function getMediaUrl(media: unknown): string {
  if (!media) return "";

  if (typeof media === "string") {
    return resolveImageUrl(media);
  }

  if (Array.isArray(media)) {
    return getMediaUrl(media[0]);
  }

  if (!isRecord(media)) return "";

  const directUrl = asString(media.url);
  if (directUrl) return resolveImageUrl(directUrl);

  const data = media.data;

  if (Array.isArray(data)) {
    return getMediaUrl(data[0]);
  }

  if (isRecord(data)) {
    const dataUrl = asString(data.url);
    if (dataUrl) return resolveImageUrl(dataUrl);

    const attributes = data.attributes;
    if (isRecord(attributes)) {
      const attrUrl = asString(attributes.url);
      if (attrUrl) return resolveImageUrl(attrUrl);
    }
  }

  const attributes = media.attributes;
  if (isRecord(attributes)) {
    const attrUrl = asString(attributes.url);
    if (attrUrl) return resolveImageUrl(attrUrl);
  }

  return "";
}

function getProductImage(product: SaleProduct) {
  const image = getProp(product, "image");
  const imageUrl = getMediaUrl(image);

  if (imageUrl) return imageUrl;

  const imageFile = asString(getProp(product, "imageFile"));
  if (imageFile) return resolveImageUrl(imageFile);

  return "";
}

function getTitle(product: SaleProduct, lang: Lang) {
  const titleUz = asString(getProp(product, "title_uz"));
  const titleRu = asString(getProp(product, "title"));

  if (lang === "uz" && titleUz) return titleUz;

  return titleRu || titleUz || "Товар RichHouse";
}

function getPhone(product: SaleProduct, setting: SaleSetting | null) {
  return (
    asString(getProp(product, "phone")) ||
    asString(getProp(setting, "phone")) ||
    "+998 90 925 60 06"
  );
}

function getPhoneHref(phone: string) {
  const clean = phone.replace(/[^\d+]/g, "");
  return `tel:${clean}`;
}

function getTelegram(product: SaleProduct, setting: SaleSetting | null) {
  const productTelegram = asString(getProp(product, "telegram"));
  const settingTelegram = asString(getProp(setting, "telegram"));

  return productTelegram || settingTelegram || "";
}

function makeTelegramHref(raw: string) {
  const value = raw.trim();

  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("@")) {
    return `https://t.me/${value.slice(1)}`;
  }

  return `https://t.me/${value}`;
}

function getItemKey(product: SaleProduct, index: number) {
  const id = asString(getProp(product, "id"));
  const documentId = asString(getProp(product, "documentId"));
  const sku = asString(getProp(product, "sku"));
  const title = asString(getProp(product, "title"));

  return documentId || id || sku || `${title}-${index}`;
}

export default function SaleProducts({
  lang,
  setting,
  products,
  loading,
  copy,
}: Props) {
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);

  const visibleProducts = useMemo(() => {
    return Array.isArray(products) ? products : [];
  }, [products]);

  const sectionTitle =
    lang === "uz"
      ? copy?.productsTitle || "Pozitsiyani tanlang"
      : copy?.productsTitle || "Выберите позицию";

  const sectionLabel =
    lang === "uz"
      ? copy?.productsLabel || "Sotuvdagi mahsulotlar"
      : copy?.productsLabel || "Товары распродажи";

  const foundText =
    lang === "uz"
      ? `Topildi: ${visibleProducts.length} ta mahsulot`
      : `Найдено: ${visibleProducts.length} товаров`;

  const callText = lang === "uz" ? "Qo‘ng‘iroq qilish" : "Позвонить";
  const telegramText =
    lang === "uz" ? "Telegramga yozish" : "Написать в Telegram";

  return (
    <>
      <section
        className="relative px-4 pb-20 pt-8 sm:px-6 lg:px-8"
        id="sale-products"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="gold-text mb-3 text-xs font-black uppercase tracking-[0.42em]">
                {sectionLabel}
              </p>

              <h2 className="max-w-4xl text-5xl font-black tracking-[-0.06em] text-[#111] sm:text-6xl lg:text-7xl">
                {sectionTitle}
              </h2>
            </div>

            <p className="text-sm font-semibold text-[#777]">{foundText}</p>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="soft-card h-[520px] animate-pulse rounded-[32px]"
                />
              ))}
            </div>
          ) : visibleProducts.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product, index) => {
                const title = getTitle(product, lang);
                const imageUrl = getProductImage(product);
                const phone = getPhone(product, setting);
                const telegram = makeTelegramHref(
                  getTelegram(product, setting),
                );
                const price = getProp(product, "price");

                return (
                  <article
                    key={getItemKey(product, index)}
                    className="product-card soft-card group overflow-hidden rounded-[32px]"
                    style={{ "--i": index } as React.CSSProperties}
                  >
                    <button
                      type="button"
                      className="relative block h-[300px] w-full overflow-hidden bg-white text-left sm:h-[315px]"
                      onClick={() => {
                        if (imageUrl) {
                          setPreviewImage({
                            src: imageUrl,
                            title,
                          });
                        }
                      }}
                      aria-label={title}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="image-soft object-contain p-3"
                          priority={index < 3}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#e5e5e5]">
                          <span className="text-xs font-black uppercase tracking-[0.35em] text-[#aaa]">
                            Нет фото
                          </span>
                        </div>
                      )}
                    </button>

                    <div className="relative z-10 bg-white px-7 pb-7 pt-6 sm:px-8 sm:pb-8">
                      <h3 className="min-h-[62px] text-2xl font-black leading-[1.08] tracking-[-0.04em] text-[#111]">
                        {title}
                      </h3>

                      <div className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#111]">
                        {formatPrice(price)}
                      </div>

                      <div className="mt-7 grid grid-cols-2 gap-3">
                        <a
                          href={getPhoneHref(phone)}
                          className="btn-premium flex h-14 items-center justify-center rounded-full bg-[#16b84e] px-4 text-center text-sm font-black text-white shadow-[0_16px_36px_rgba(22,184,78,0.22)]"
                        >
                          {callText}
                        </a>

                        {telegram ? (
                          <a
                            href={telegram}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-premium flex h-14 items-center justify-center rounded-full bg-[#1da1d8] px-4 text-center text-sm font-black text-white shadow-[0_16px_36px_rgba(29,161,216,0.18)]"
                          >
                            {telegramText}
                          </a>
                        ) : (
                          <a
                            href={getPhoneHref(phone)}
                            className="btn-premium flex h-14 items-center justify-center rounded-full bg-[#1da1d8] px-4 text-center text-sm font-black text-white shadow-[0_16px_36px_rgba(29,161,216,0.18)]"
                          >
                            {telegramText}
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="soft-card rounded-[32px] px-8 py-14 text-center">
              <p className="text-lg font-bold text-[#777]">
                {lang === "uz"
                  ? "Hozircha mahsulotlar yo‘q"
                  : "Пока товаров нет"}
              </p>
            </div>
          )}
        </div>
      </section>

      {previewImage ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-[130] flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-black text-black shadow-xl"
            onClick={(event) => {
              event.stopPropagation();
              setPreviewImage(null);
            }}
            aria-label="Закрыть"
          >
            ×
          </button>

          <div
            className="relative h-[86vh] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={previewImage.src}
              alt={previewImage.title}
              fill
              sizes="100vw"
              className="object-contain p-3 sm:p-6"
              priority
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
