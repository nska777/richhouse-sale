"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { saleCopy } from "./sale-copy";
import type { Lang, SaleProduct, SaleSetting } from "./sale-types";
import {
  formatPrice,
  mediaUrl,
  normalizePhone,
  pickText,
  whatsappLink,
} from "./sale-utils";

type Props = {
  lang: Lang;
  setting: SaleSetting | null;
  products: SaleProduct[];
  loading: boolean;
  copy: (typeof saleCopy)["ru"];
};

type PreviewState = {
  src: string;
  title: string;
  badge: string;
} | null;

type SaleCategory = {
  key: string;
  icon: string;
  ru: string;
  uz: string;
};

const SALE_CATEGORIES: SaleCategory[] = [
  { key: "all", icon: "✨", ru: "Все", uz: "Hammasi" },
  { key: "beds", icon: "🛏️", ru: "Кровати", uz: "Karavotlar" },
  { key: "sofas", icon: "🛋️", ru: "Диваны", uz: "Divanlar" },
  { key: "wardrobes", icon: "🚪", ru: "Шкафы", uz: "Shkaflar" },
  { key: "tables", icon: "◼️", ru: "Столы", uz: "Stollar" },
  { key: "dressers", icon: "▤", ru: "Комоды", uz: "Komodlar" },
  { key: "cabinets", icon: "▥", ru: "Тумбы", uz: "Tumbalar" },
  { key: "mirrors", icon: "◯", ru: "Зеркала", uz: "Ko‘zgular" },
  { key: "armchairs", icon: "🪑", ru: "Кресла", uz: "Kreslolar" },
  { key: "chairs", icon: "♕", ru: "Стулья", uz: "Stullar" },
  { key: "decor", icon: "◆", ru: "Декор", uz: "Dekor" },
  { key: "other", icon: "＋", ru: "Другое", uz: "Boshqa" },
];

function asNumber(value?: number | string | null) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function normCategory(value?: string | null) {
  const raw = String(value || "")
    .trim()
    .toLowerCase();

  const map: Record<string, string> = {
    bed: "beds",
    beds: "beds",
    krovati: "beds",
    krovat: "beds",
    кровати: "beds",
    кровать: "beds",

    sofa: "sofas",
    sofas: "sofas",
    divan: "sofas",
    divany: "sofas",
    диван: "sofas",
    диваны: "sofas",

    wardrobe: "wardrobes",
    wardrobes: "wardrobes",
    shkaf: "wardrobes",
    shkafy: "wardrobes",
    шкаф: "wardrobes",
    шкафы: "wardrobes",

    table: "tables",
    tables: "tables",
    stol: "tables",
    stoli: "tables",
    стол: "tables",
    столы: "tables",

    dresser: "dressers",
    dressers: "dressers",
    komod: "dressers",
    komody: "dressers",
    комод: "dressers",
    комоды: "dressers",

    cabinet: "cabinets",
    cabinets: "cabinets",
    tumba: "cabinets",
    tumby: "cabinets",
    тумба: "cabinets",
    тумбы: "cabinets",

    mirror: "mirrors",
    mirrors: "mirrors",
    zerkalo: "mirrors",
    zerkala: "mirrors",
    зеркало: "mirrors",
    зеркала: "mirrors",

    armchair: "armchairs",
    armchairs: "armchairs",
    kreslo: "armchairs",
    кресло: "armchairs",
    кресла: "armchairs",

    chair: "chairs",
    chairs: "chairs",
    stul: "chairs",
    stulya: "chairs",
    стул: "chairs",
    стулья: "chairs",

    decor: "decor",
    dekor: "decor",
    декор: "decor",

    other: "other",
    другое: "other",
  };

  return map[raw] || raw || "other";
}

function calcDiscountBadge(product: SaleProduct) {
  const price = asNumber(product.price);
  const oldPrice = asNumber(product.oldPrice);

  if (price > 0 && oldPrice > price) {
    const percent = Math.round(((oldPrice - price) / oldPrice) * 100);

    if (percent > 0) {
      return `-${percent}%`;
    }
  }

  return "";
}

export default function SaleProducts({
  lang,
  setting,
  products,
  loading,
  copy,
}: Props) {
  const [preview, setPreview] = useState<PreviewState>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const phone = setting?.phone || "+998901234567";
  const telegram = setting?.telegram || "";
  const buttonText =
    pickText(lang, setting?.buttonText, setting?.button_text_uz) || copy.order;

  const labels = useMemo(() => {
    if (lang === "uz") {
      return {
        topSale: "Chegirma",
        hurry: "Ulgurib qoling",
        enlarge: "Rasmni kattalashtirish",
        close: "Yopish",
        filterTitle: "Kerakli bo‘limni tanlang",
        countPrefix: "Topildi",
        countSuffix: "ta mahsulot",
      };
    }

    return {
      topSale: "Распродажа",
      hurry: "Успейте купить",
      enlarge: "Увеличить фото",
      close: "Закрыть",
      filterTitle: "Выберите нужный раздел",
      countPrefix: "Найдено",
      countSuffix: "товаров",
    };
  }, [lang]);

  const categoriesWithCount = useMemo(() => {
    return SALE_CATEGORIES.map((category) => {
      if (category.key === "all") {
        return {
          ...category,
          count: products.length,
        };
      }

      return {
        ...category,
        count: products.filter(
          (product) => normCategory(product.category) === category.key,
        ).length,
      };
    });
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (activeCategory === "all") return products;

    return products.filter(
      (product) => normCategory(product.category) === activeCategory,
    );
  }, [activeCategory, products]);

  useEffect(() => {
    if (!preview) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreview(null);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [preview]);

  return (
    <>
      <section className="relative px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="gold-text text-xs font-semibold uppercase tracking-[0.22em]">
                {copy.productsLabel}
              </p>

              <h2 className="mt-3 text-[clamp(2.05rem,4vw,4.1rem)] font-semibold leading-[1] tracking-[-0.065em] text-[#1d1d1f]">
                {copy.choose}
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-black/48 sm:text-right">
              {copy.note}
            </p>
          </div>

          <div className="mb-8 rounded-[32px] bg-white/72 p-3 shadow-[0_18px_54px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.045] backdrop-blur-2xl sm:p-4">
            <div className="mb-3 flex flex-col gap-1 px-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                {labels.filterTitle}
              </div>

              <div className="text-xs font-medium text-black/42">
                {labels.countPrefix}: {visibleProducts.length}{" "}
                {labels.countSuffix}
              </div>
            </div>

            <div className="sale-category-scroll flex gap-2 overflow-x-auto pb-1">
              {categoriesWithCount.map((category) => {
                const isActive = activeCategory === category.key;
                const title = lang === "uz" ? category.uz : category.ru;

                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => setActiveCategory(category.key)}
                    className={[
                      "sale-category-button",
                      isActive ? "sale-category-button-active" : "",
                      category.count === 0 && category.key !== "all"
                        ? "sale-category-button-empty"
                        : "",
                    ].join(" ")}
                  >
                    <span className="sale-category-icon">{category.icon}</span>
                    <span className="sale-category-title">{title}</span>
                    <span className="sale-category-count">
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="soft-card rounded-[32px] p-9 text-center text-base font-medium text-black/54">
              {copy.loading}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="soft-card rounded-[32px] p-9 text-center text-base font-medium text-black/54">
              {copy.empty}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product, index) => {
                const image = mediaUrl(product.image);
                const productPhone = product.phone || phone;
                const productWhatsapp =
                  product.whatsapp || whatsappLink(productPhone);
                const productTelegram = product.telegram || telegram;

                const price = formatPrice(product.price);
                const oldPrice = formatPrice(product.oldPrice);

                const productTitle =
                  pickText(lang, product.title, product.title_uz) ||
                  product.title ||
                  "";

                const productDescription = pickText(
                  lang,
                  product.description,
                  product.description_uz,
                );

                const discountBadge = calcDiscountBadge(product);
                const productCategory = SALE_CATEGORIES.find(
                  (cat) => cat.key === normCategory(product.category),
                );

                return (
                  <article
                    key={product.id}
                    style={{ "--i": index } as CSSProperties}
                    className="product-card group overflow-hidden rounded-[32px] bg-white shadow-[0_18px_54px_rgba(0,0,0,0.075)] ring-1 ring-black/[0.055] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_72px_rgba(0,0,0,0.11)]"
                  >
                    <button
                      type="button"
                      disabled={!image}
                      onClick={() => {
                        if (!image) return;

                        setPreview({
                          src: image,
                          title: productTitle,
                          badge: discountBadge,
                        });
                      }}
                      className="sale-photo-button relative block aspect-[4/3] w-full overflow-hidden bg-[#eeeeef] text-left disabled:cursor-default"
                      aria-label={labels.enlarge}
                    >
                      {image ? (
                        <Image
                          src={image}
                          alt={productTitle || "Product"}
                          fill
                          className="image-soft object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,#ffffff,#e4e4e7)] text-xs font-semibold uppercase tracking-[0.18em] text-black/26">
                          {copy.noPhoto}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/10" />

                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <span className="sale-top-badge sale-top-badge-red">
                          {labels.topSale}
                        </span>
                      </div>

                      {image ? (
                        <div className="absolute bottom-4 right-4 hidden rounded-full bg-white/82 px-3.5 py-2 text-xs font-semibold text-black/62 shadow-sm backdrop-blur-xl transition group-hover:bg-white sm:block">
                          {labels.enlarge}
                        </div>
                      ) : null}
                    </button>

                    <div className="p-5 sm:p-6">
                      <div className="mb-4 grid grid-cols-2 gap-2">
                        {discountBadge ? (
                          <span className="sale-discount-badge sale-discount-pulse">
                            {discountBadge}
                          </span>
                        ) : (
                          <span className="sale-discount-placeholder">
                            {labels.topSale}
                          </span>
                        )}

                        <span className="sale-hurry-badge">{labels.hurry}</span>
                      </div>

                      <div className="mb-3 flex items-center justify-between gap-2">
                        {product.sku ? (
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/32">
                            {product.sku}
                          </p>
                        ) : (
                          <span />
                        )}

                        {productCategory ? (
                          <div className="sale-card-category">
                            <span>{productCategory.icon}</span>
                            <span>
                              {lang === "uz"
                                ? productCategory.uz
                                : productCategory.ru}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <h3 className="text-xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#1d1d1f] sm:text-2xl">
                        {productTitle}
                      </h3>

                      {productDescription ? (
                        <p className="mt-3 min-h-[48px] text-sm leading-6 text-black/50">
                          {productDescription}
                        </p>
                      ) : null}

                      <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
                        {price ? (
                          <div className="text-2xl font-semibold tracking-[-0.055em] text-[#1d1d1f] sm:text-[1.7rem]">
                            {price}
                          </div>
                        ) : null}

                        {oldPrice ? (
                          <div className="pb-1 text-base font-medium tracking-[-0.03em] text-black/34 line-through">
                            {oldPrice}
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <a
                          href={
                            productWhatsapp ||
                            `tel:${normalizePhone(productPhone)}`
                          }
                          target={productWhatsapp ? "_blank" : undefined}
                          rel={productWhatsapp ? "noreferrer" : undefined}
                          className="btn-premium rounded-full bg-[#1d1d1f] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_12px_32px_rgba(0,0,0,0.16)]"
                        >
                          {buttonText}
                        </a>

                        <a
                          href={`tel:${normalizePhone(productPhone)}`}
                          className="btn-premium rounded-full bg-[#f2f2f4] px-4 py-3 text-center text-sm font-semibold text-[#1d1d1f] hover:bg-[#e9e9ec]"
                        >
                          {copy.call}
                        </a>
                      </div>

                      {productTelegram ? (
                        <a
                          href={productTelegram}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-premium mt-3 block rounded-full bg-[#f2f2f4] px-4 py-3 text-center text-sm font-semibold text-[#1d1d1f] hover:bg-[#e9e9ec]"
                        >
                          {copy.writeTelegram}
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {preview ? (
        <div
          className="sale-preview-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreview(null)}
        >
          <div
            className="sale-preview-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sale-preview-header">
              <div>
                {preview.badge ? (
                  <div className="sale-preview-badge">{preview.badge}</div>
                ) : null}

                <div className="mt-2 text-lg font-semibold tracking-[-0.035em] text-[#1d1d1f] sm:text-xl">
                  {preview.title}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreview(null)}
                className="sale-preview-close"
                aria-label={labels.close}
              >
                ×
              </button>
            </div>

            <div className="sale-preview-image-wrap">
              <Image
                src={preview.src}
                alt={preview.title || "Product"}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
