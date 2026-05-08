"use client";

import Image from "next/image";
import type { Lang, SaleProduct, SaleSetting } from "./sale-types";
import { STRAPI_URL } from "./sale-utils";

type Props = {
  lang: Lang;
  products: SaleProduct[];
  setting: SaleSetting | null;
  loading?: boolean;
  copy?: unknown;
};

const PHONE_HREF = "tel:+998900021230";
const TELEGRAM_URL = "https://t.me/Mebel_LD";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getMediaUrl(media: unknown): string {
  if (!media) return "";

  if (Array.isArray(media)) {
    return getMediaUrl(media[0]);
  }

  if (!isRecord(media)) return "";

  const directUrl = media.url;
  if (typeof directUrl === "string" && directUrl) {
    return directUrl.startsWith("http")
      ? directUrl
      : `${STRAPI_URL}${directUrl}`;
  }

  const formats = media.formats;
  if (isRecord(formats)) {
    for (const key of ["large", "medium", "small", "thumbnail"]) {
      const item = formats[key];

      if (isRecord(item) && typeof item.url === "string" && item.url) {
        return item.url.startsWith("http")
          ? item.url
          : `${STRAPI_URL}${item.url}`;
      }
    }
  }

  return "";
}

function formatPrice(value: unknown) {
  const n = Number(String(value ?? "").replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(n) || n <= 0) return "";

  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(n)} UZS`;
}

function getTitle(product: SaleProduct, lang: Lang) {
  if (lang === "uz") return product.title_uz || product.title || "";
  return product.title || "";
}

export default function SaleProducts({ lang, products, loading }: Props) {
  const activeProducts = products
    .filter((product) => product.isActive !== false)
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));

  return (
    <section className="bg-[#f4f4f2] px-4 pb-20 pt-4 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-8 flex flex-col gap-2">
          <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#b68a4a]">
            {lang === "uz" ? "Savdo mahsulotlari" : "Товары распродажи"}
          </p>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <h2 className="text-[42px] font-black leading-none tracking-[-0.055em] text-[#171717] sm:text-[58px]">
              {lang === "uz" ? "Pozitsiyani tanlang" : "Выберите позицию"}
            </h2>

            <p className="text-sm font-semibold text-black/45">
              {lang === "uz"
                ? `${activeProducts.length} ta mahsulot`
                : `Найдено: ${activeProducts.length} товаров`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[34px] border border-black/5 bg-white/70 p-10 text-center shadow-sm">
            <p className="text-lg font-bold text-black/55">
              {lang === "uz" ? "Yuklanmoqda..." : "Загрузка..."}
            </p>
          </div>
        ) : activeProducts.length === 0 ? (
          <div className="rounded-[34px] border border-black/5 bg-white/70 p-10 text-center shadow-sm">
            <p className="text-lg font-bold text-black/55">
              {lang === "uz" ? "Hozircha mahsulot yo‘q" : "Пока нет товаров"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {activeProducts.map((product) => {
              const image = getMediaUrl(product.image);
              const title = getTitle(product, lang);
              const price = formatPrice(product.price);

              return (
                <article
                  key={product.id ?? product.sku}
                  className="group overflow-hidden rounded-[34px] border border-black/5 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_110px_rgba(0,0,0,0.12)]"
                >
                  <div className="relative aspect-[1.18] overflow-hidden bg-gradient-to-b from-[#f7f7f7] to-[#d9d9d9]">
                    {image ? (
                      <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.035]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-black uppercase tracking-[0.28em] text-black/24">
                        {lang === "uz" ? "Rasm yo‘q" : "Нет фото"}
                      </div>
                    )}
                  </div>

                  <div className="p-6 sm:p-7">
                    <div className="mb-4">
                      <h3 className="text-2xl font-black leading-tight tracking-[-0.035em] text-[#171717]">
                        {title}
                      </h3>
                    </div>

                    {price ? (
                      <div className="mb-6 text-3xl font-black tracking-[-0.045em] text-[#171717]">
                        {price}
                      </div>
                    ) : null}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <a
                        href={PHONE_HREF}
                        className="flex h-14 items-center justify-center rounded-full bg-[#16b857] px-5 text-sm font-black text-white shadow-[0_16px_36px_rgba(22,184,87,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0fa64b]"
                      >
                        {lang === "uz" ? "Qo‘ng‘iroq" : "Позвонить"}
                      </a>

                      <a
                        href={TELEGRAM_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-14 items-center justify-center rounded-full bg-[#229ed9] px-5 text-sm font-black text-white shadow-[0_16px_36px_rgba(34,158,217,0.2)] transition hover:-translate-y-0.5 hover:bg-[#168ac0]"
                      >
                        {lang === "uz"
                          ? "Telegramga yozish"
                          : "Написать в Telegram"}
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
