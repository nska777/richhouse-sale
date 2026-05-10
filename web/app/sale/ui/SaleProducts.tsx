"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { Lang, SaleProduct, SaleSetting } from "./sale-types";
import { STRAPI_URL } from "./sale-utils";

type Props = {
  lang: Lang;
  setting: SaleSetting | null;
  products: SaleProduct[];
  loading: boolean;
  copy: Record<string, string>;
};

type MediaLike = {
  url?: unknown;
  name?: unknown;
  formats?: {
    thumbnail?: { url?: unknown };
    small?: { url?: unknown };
    medium?: { url?: unknown };
    large?: { url?: unknown };
  };
  data?: {
    attributes?: MediaLike;
  };
  attributes?: MediaLike;
};

function textValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function getField(product: SaleProduct, key: string): unknown {
  const record = product as unknown as Record<string, unknown>;
  const attrs = record.attributes as Record<string, unknown> | undefined;

  if (record[key] !== undefined && record[key] !== null) return record[key];
  if (attrs && attrs[key] !== undefined && attrs[key] !== null)
    return attrs[key];

  return undefined;
}

function normalizeMedia(media: unknown): MediaLike | null {
  if (!media || typeof media !== "object") return null;

  const item = media as MediaLike;

  if (item.data?.attributes) return item.data.attributes;
  if (item.attributes) return item.attributes;

  return item;
}

function absoluteImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const base = STRAPI_URL.replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;

  return `${base}${path}`;
}

function getImageUrl(product: SaleProduct): string {
  const directImage = getField(product, "image");
  const media = normalizeMedia(directImage);

  const large = textValue(media?.formats?.large?.url);
  const medium = textValue(media?.formats?.medium?.url);
  const small = textValue(media?.formats?.small?.url);
  const original = textValue(media?.url);

  return absoluteImageUrl(large || medium || small || original);
}

function getTitle(product: SaleProduct, lang: Lang): string {
  const titleUz = textValue(getField(product, "title_uz"));
  const titleRu = textValue(getField(product, "title"));

  if (lang === "uz" && titleUz) return titleUz;

  return titleRu || titleUz || "Товар RichHouse";
}

function getPrice(product: SaleProduct): number {
  const value = getField(product, "price");

  if (typeof value === "number") return value;

  const cleaned = String(value ?? "")
    .replace(/\s/g, "")
    .replace(/[^\d.-]/g, "");

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function formatPrice(value: unknown): string {
  const number =
    typeof value === "number"
      ? value
      : Number(
          String(value ?? "")
            .replace(/\s/g, "")
            .replace(/[^\d.-]/g, ""),
        );

  if (!Number.isFinite(number) || number <= 0) return "Цена по запросу";

  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(number)} UZS`;
}

function normalizePhone(value: unknown): string {
  const raw = textValue(value);

  if (!raw) return "";

  const plus = raw.trim().startsWith("+") ? "+" : "";
  const digits = raw.replace(/\D/g, "");

  return `${plus}${digits}`;
}

function phoneHref(value: unknown): string {
  const phone = normalizePhone(value);
  return phone ? `tel:${phone}` : "#";
}

function telegramHref(value: unknown): string {
  const raw = textValue(value);

  if (!raw) return "#";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("@")) return `https://t.me/${raw.slice(1)}`;

  return `https://t.me/${raw}`;
}

function getProductPhone(
  product: SaleProduct,
  setting: SaleSetting | null,
): string {
  return (
    textValue(getField(product, "phone")) ||
    textValue((setting as unknown as Record<string, unknown> | null)?.phone) ||
    "+998909256006"
  );
}

function getProductTelegram(
  product: SaleProduct,
  setting: SaleSetting | null,
): string {
  return (
    textValue(getField(product, "telegram")) ||
    textValue((setting as unknown as Record<string, unknown> | null)?.telegram)
  );
}

function getSortOrder(product: SaleProduct): number {
  const value = getField(product, "sortOrder");
  const number = Number(value);

  return Number.isFinite(number) ? number : 9999;
}

function isActive(product: SaleProduct): boolean {
  const value = getField(product, "isActive");
  return value !== false;
}

function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#ececec]">
      <span className="text-[13px] font-black uppercase tracking-[0.34em] text-[#a5a5a5]">
        Нет фото
      </span>
    </div>
  );
}

export default function SaleProducts({
  lang,
  setting,
  products,
  loading,
  copy,
}: Props) {
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  const visibleProducts = useMemo(() => {
    return [...products]
      .filter(isActive)
      .sort((a, b) => getSortOrder(a) - getSortOrder(b));
  }, [products]);

  const callText = copy.call || "Позвонить";
  const telegramText = copy.telegram || "Написать в Telegram";

  return (
    <section
      id="products"
      className="relative px-4 pb-16 pt-10 sm:px-6 sm:pb-20 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[12px] font-black uppercase tracking-[0.52em] text-[#b38b44]">
              {lang === "uz" ? "Sotuvdagi mahsulotlar" : "Товары распродажи"}
            </p>

            <h2 className="max-w-4xl text-[48px] font-black leading-[0.92] tracking-[-0.075em] text-[#111] sm:text-[68px] lg:text-[82px]">
              {lang === "uz" ? "Pozitsiyani tanlang" : "Выберите позицию"}
            </h2>
          </div>

          <div className="text-[15px] font-semibold text-[#7b7b7b]">
            {lang === "uz"
              ? `Topildi: ${visibleProducts.length} ta mahsulot`
              : `Найдено: ${visibleProducts.length} товаров`}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[520px] animate-pulse rounded-[34px] bg-white/70 shadow-[0_24px_70px_rgba(0,0,0,0.06)]"
              />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-[34px] bg-white p-10 text-center shadow-[0_24px_70px_rgba(0,0,0,0.06)]">
            <div className="text-[26px] font-black text-[#111]">
              {lang === "uz" ? "Mahsulotlar yo‘q" : "Товаров пока нет"}
            </div>
            <p className="mt-3 text-[16px] text-[#7b7b7b]">
              {lang === "uz"
                ? "Keyinroq qayta tekshiring."
                : "Проверьте позже или обновите список в Excel."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product, index) => {
              const title = getTitle(product, lang);
              const image = getImageUrl(product);
              const price = getPrice(product);
              const phone = getProductPhone(product, setting);
              const telegram = getProductTelegram(product, setting);

              const productId =
                textValue(getField(product, "documentId")) ||
                textValue(getField(product, "id")) ||
                `${title}-${index}`;

              return (
                <article
                  key={productId}
                  className="group overflow-hidden rounded-[34px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_90px_rgba(0,0,0,0.12)]"
                >
                  <button
                    type="button"
                    disabled={!image}
                    onClick={() => {
                      if (image) {
                        setPreviewImage({
                          src: image,
                          title,
                        });
                      }
                    }}
                    className="relative block h-[300px] w-full overflow-hidden bg-white text-left sm:h-[320px]"
                    aria-label={title}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-contain p-5 transition duration-500 group-hover:scale-[1.025]"
                        priority={index < 6}
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                  </button>

                  <div className="flex flex-1 flex-col px-6 pb-6 pt-5 sm:px-7 sm:pb-7">
                    <h3 className="line-clamp-2 min-h-[54px] text-[22px] font-black leading-[1.12] tracking-[-0.04em] text-[#111] sm:text-[24px]">
                      {title}
                    </h3>

                    <div className="mt-4 text-[28px] font-black leading-none tracking-[-0.04em] text-[#111] sm:text-[31px]">
                      {formatPrice(price)}
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <a
                        href={phoneHref(phone)}
                        className="flex h-14 items-center justify-center rounded-full bg-[#18b94f] px-4 text-center text-[15px] font-black text-white shadow-[0_18px_34px_rgba(24,185,79,0.22)] transition hover:bg-[#12a944]"
                      >
                        {callText}
                      </a>

                      <a
                        href={telegramHref(telegram)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-14 items-center justify-center rounded-full bg-[#20a8e0] px-4 text-center text-[15px] font-black text-white shadow-[0_18px_34px_rgba(32,168,224,0.22)] transition hover:bg-[#1598cf]"
                      >
                        {telegramText}
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
          <button
            type="button"
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[26px] font-black text-[#111] shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            onClick={(event) => {
              event.stopPropagation();
              setPreviewImage(null);
            }}
            aria-label="Закрыть"
          >
            ×
          </button>

          <div
            className="relative h-[82vh] w-full max-w-6xl overflow-hidden rounded-[30px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={previewImage.src}
              alt={previewImage.title}
              fill
              sizes="100vw"
              className="object-contain p-4 sm:p-8"
              priority
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
