"use client";

import { useMemo, useState } from "react";
import type { Lang, SaleProduct, SaleSetting } from "./sale-types";
import { STRAPI_URL } from "./sale-utils";

type Props = {
  lang: Lang;
  setting: SaleSetting | null;
  products: SaleProduct[];
  loading: boolean;
  copy?: Record<string, string>;
};

type PreviewImage = {
  src: string;
  title: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getValue(obj: unknown, key: string): unknown {
  if (!isRecord(obj)) return undefined;
  return obj[key];
}

function toText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return "";
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const normalized = value.replace(/\s/g, "").replace(",", ".");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : 0;
  }

  return 0;
}

function formatPhoneHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");

  if (!digits) return "";

  if (digits.startsWith("+")) {
    return `tel:${digits}`;
  }

  return `tel:+${digits.replace(/[^\d]/g, "")}`;
}

function normalizeTelegramLink(value: string) {
  const raw = value.trim();

  if (!raw) return "";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  if (raw.startsWith("@")) {
    return `https://t.me/${raw.slice(1)}`;
  }

  return `https://t.me/${raw}`;
}

function resolveMediaUrl(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") {
    if (!value.trim()) return "";
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }
    if (value.startsWith("/")) {
      return `${STRAPI_URL}${value}`;
    }
    return value;
  }

  if (Array.isArray(value)) {
    return resolveMediaUrl(value[0]);
  }

  if (!isRecord(value)) return "";

  const directUrl = toText(value.url);
  if (directUrl) return resolveMediaUrl(directUrl);

  const data = value.data;
  if (Array.isArray(data)) return resolveMediaUrl(data[0]);
  if (data) return resolveMediaUrl(data);

  const attributes = value.attributes;
  if (attributes) return resolveMediaUrl(attributes);

  const formats = value.formats;
  if (isRecord(formats)) {
    const large = resolveMediaUrl(formats.large);
    if (large) return large;

    const medium = resolveMediaUrl(formats.medium);
    if (medium) return medium;

    const small = resolveMediaUrl(formats.small);
    if (small) return small;
  }

  return "";
}

function getProductImage(product: SaleProduct): string {
  const directImage = resolveMediaUrl(getValue(product, "image"));
  if (directImage) return directImage;

  const attributes = getValue(product, "attributes");
  const attrImage = resolveMediaUrl(getValue(attributes, "image"));
  if (attrImage) return attrImage;

  return "";
}

function getProductTitle(product: SaleProduct, lang: Lang): string {
  const attributes = getValue(product, "attributes");
  const source = isRecord(attributes) ? attributes : product;

  const titleUz = toText(getValue(source, "title_uz"));
  const titleRu = toText(getValue(source, "title"));
  const sku = toText(getValue(source, "sku"));

  if (lang === "uz" && titleUz) return titleUz;
  if (titleRu) return titleRu;
  if (titleUz) return titleUz;
  if (sku) return sku;

  return "Товар RichHouse";
}

function getProductSortOrder(product: SaleProduct) {
  const attributes = getValue(product, "attributes");
  const source = isRecord(attributes) ? attributes : product;

  const sortOrder = toNumber(getValue(source, "sortOrder"));
  return sortOrder || 9999;
}

function getProductIsActive(product: SaleProduct) {
  const attributes = getValue(product, "attributes");
  const source = isRecord(attributes) ? attributes : product;

  return getValue(source, "isActive") !== false;
}

function getProductPhone(product: SaleProduct, setting: SaleSetting | null) {
  const attributes = getValue(product, "attributes");
  const source = isRecord(attributes) ? attributes : product;

  return (
    toText(getValue(source, "phone")) ||
    toText(getValue(setting, "phone")) ||
    "+998 90 925 60 06"
  );
}

function getProductTelegram(product: SaleProduct, setting: SaleSetting | null) {
  const attributes = getValue(product, "attributes");
  const source = isRecord(attributes) ? attributes : product;

  return (
    toText(getValue(source, "telegram")) ||
    toText(getValue(setting, "telegram")) ||
    ""
  );
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[34px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
      <div className="flex h-[340px] items-center justify-center bg-[#eeeeef] text-xs font-black uppercase tracking-[0.45em] text-black/25 sm:h-[380px]">
        Нет фото
      </div>

      <div className="grid grid-cols-2 gap-3 p-6">
        <div className="h-14 rounded-full bg-black/10" />
        <div className="h-14 rounded-full bg-black/10" />
      </div>
    </div>
  );
}

export default function SaleProducts({
  lang,
  setting,
  products,
  loading,
}: Props) {
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);

  const visibleProducts = useMemo(() => {
    return [...products]
      .filter(getProductIsActive)
      .sort((a, b) => getProductSortOrder(a) - getProductSortOrder(b));
  }, [products]);

  const sectionTitle =
    lang === "uz" ? "Mahsulotni tanlang" : "Выберите позицию";
  const sectionKicker =
    lang === "uz" ? "Sotuvdagi mahsulotlar" : "Товары распродажи";
  const foundText =
    lang === "uz"
      ? `Topildi: ${visibleProducts.length} ta mahsulot`
      : `Найдено: ${visibleProducts.length} товаров`;

  const callText = lang === "uz" ? "Qo‘ng‘iroq qilish" : "Позвонить";
  const telegramText =
    lang === "uz" ? "Telegramga yozish" : "Написать в Telegram";

  return (
    <section id="products" className="relative px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.45em] text-[#b9874a]">
              {sectionKicker}
            </p>

            <h2 className="max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.07em] text-black sm:text-6xl lg:text-7xl">
              {sectionTitle}
            </h2>
          </div>

          <p className="text-sm font-semibold text-black/55">{foundText}</p>
        </div>

        {loading ? (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : visibleProducts.length ? (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product, index) => {
              const title = getProductTitle(product, lang);
              const image = getProductImage(product);
              const phone = getProductPhone(product, setting);
              const telegram = getProductTelegram(product, setting);

              const phoneHref = formatPhoneHref(phone);
              const telegramHref = normalizeTelegramLink(telegram);

              return (
                <article
                  key={`${title}-${index}`}
                  className="group overflow-hidden rounded-[34px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_100px_rgba(0,0,0,0.12)]"
                >
                  <button
                    type="button"
                    disabled={!image}
                    onClick={() => {
                      if (!image) return;
                      setPreviewImage({ src: image, title });
                    }}
                    className="relative flex h-[340px] w-full items-center justify-center overflow-hidden bg-white sm:h-[380px]"
                    aria-label={title}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.025]"
                        loading={index < 6 ? "eager" : "lazy"}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#eeeeef] text-xs font-black uppercase tracking-[0.45em] text-black/25">
                        Нет фото
                      </div>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-3 p-5 sm:p-6">
                    <a
                      href={phoneHref || "#"}
                      className="flex h-14 items-center justify-center rounded-full bg-[#12b84f] px-4 text-center text-sm font-black text-white shadow-[0_18px_45px_rgba(18,184,79,0.22)] transition hover:scale-[1.02] hover:bg-[#0fa846]"
                    >
                      {callText}
                    </a>

                    <a
                      href={telegramHref || "#"}
                      target={telegramHref ? "_blank" : undefined}
                      rel={telegramHref ? "noreferrer" : undefined}
                      className="flex h-14 items-center justify-center rounded-full bg-[#1da1d8] px-4 text-center text-sm font-black text-white shadow-[0_18px_45px_rgba(29,161,216,0.22)] transition hover:scale-[1.02] hover:bg-[#168fc1]"
                    >
                      {telegramText}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[34px] bg-white p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
            <p className="text-lg font-black text-black">
              {lang === "uz" ? "Hozircha mahsulotlar yo‘q" : "Пока нет товаров"}
            </p>
          </div>
        )}
      </div>

      {previewImage ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-[101] flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-black text-black shadow-2xl transition hover:scale-105"
            onClick={(event) => {
              event.stopPropagation();
              setPreviewImage(null);
            }}
            aria-label="Закрыть"
          >
            ×
          </button>

          <div
            className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={previewImage.src}
              alt={previewImage.title}
              className="max-h-[88vh] w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
