"use client";

import Image from "next/image";

import type { Dispatch, SetStateAction } from "react";
import type { Lang, SaleSetting } from "./sale-types";
import { STRAPI_URL } from "./sale-utils";

type Props = {
  lang: Lang;
  setLang: Dispatch<SetStateAction<Lang>>;
  setting: SaleSetting | null;
  copy: Record<string, string>;
};

type MediaFormat = {
  url?: unknown;
};

type MediaLike = {
  url?: unknown;
  name?: unknown;
  formats?: {
    thumbnail?: MediaFormat;
    small?: MediaFormat;
    medium?: MediaFormat;
    large?: MediaFormat;
  };
  data?: {
    attributes?: MediaLike;
  } | null;
  attributes?: MediaLike;
};

function textValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function getField(source: unknown, key: string): unknown {
  const record = source as Record<string, unknown> | null;
  const attrs = record?.attributes as Record<string, unknown> | undefined;

  if (record && record[key] !== undefined && record[key] !== null) {
    return record[key];
  }

  if (attrs && attrs[key] !== undefined && attrs[key] !== null) {
    return attrs[key];
  }

  return undefined;
}

function normalizeMedia(media: unknown): MediaLike | null {
  if (!media) return null;

  if (typeof media === "string") {
    return {
      url: media,
    };
  }

  if (Array.isArray(media)) {
    return normalizeMedia(media[0]);
  }

  if (typeof media !== "object") return null;

  const item = media as MediaLike;

  if (item.data?.attributes) return item.data.attributes;
  if (item.attributes) return item.attributes;

  return item;
}

function absoluteImageUrl(url: string): string {
  const cleanUrl = url.trim();

  if (!cleanUrl) return "";

  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  const base = STRAPI_URL.replace(/\/$/, "");
  const path = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;

  return `${base}${path}`;
}

function getImageUrl(mediaValue: unknown): string {
  const media = normalizeMedia(mediaValue);

  const large = textValue(media?.formats?.large?.url);
  const medium = textValue(media?.formats?.medium?.url);
  const small = textValue(media?.formats?.small?.url);
  const thumbnail = textValue(media?.formats?.thumbnail?.url);
  const original = textValue(media?.url);

  return absoluteImageUrl(large || medium || small || thumbnail || original);
}

function phoneHref(): string {
  return "tel:+998900021230";
}

function getDisplayPhone(): string {
  return "+998 90 002 12 30";
}

function getBanner(setting: SaleSetting | null): string {
  const direct =
    getField(setting, "banner") ||
    getField(setting, "bannerImage") ||
    getField(setting, "heroBanner") ||
    getField(setting, "heroImage") ||
    getField(setting, "mainBanner") ||
    getField(setting, "desktopBanner") ||
    getField(setting, "image") ||
    getField(setting, "cover") ||
    getField(setting, "photo") ||
    getField(setting, "file");

  const imageFromDirect = getImageUrl(direct);

  if (imageFromDirect) return imageFromDirect;

  const record = setting as unknown as Record<string, unknown> | null;
  const attrs = record?.attributes as Record<string, unknown> | undefined;
  const source = attrs || record;

  if (!source) return "";

  for (const value of Object.values(source)) {
    const image = getImageUrl(value);
    if (image) return image;
  }

  return "";
}

function getTitle(setting: SaleSetting | null, lang: Lang): string {
  const titleUz = textValue(getField(setting, "title_uz"));
  const titleRu = textValue(getField(setting, "title"));

  if (lang === "uz" && titleUz) return titleUz;

  return titleRu || titleUz || "Распродажа мебели";
}

function getSubtitle(setting: SaleSetting | null, lang: Lang): string {
  const subtitleUz = textValue(getField(setting, "subtitle_uz"));
  const subtitleRu = textValue(getField(setting, "subtitle"));

  const fallback =
    lang === "uz"
      ? "Barcha pozitsiyalarga 65% gacha chegirmalar. Miqdor cheklangan."
      : "Скидки до 65% на все позиции. Количество ограничено.";

  const value =
    lang === "uz" && subtitleUz
      ? subtitleUz
      : subtitleRu || subtitleUz || fallback;

  return value
    .replaceAll("50%", "65%")
    .replaceAll("50 %", "65%")
    .replaceAll("50 foiz", "65 foiz");
}

export default function SaleHero({ lang, setLang, setting }: Props) {
  const phone = getDisplayPhone();
  const banner = getBanner(setting);
  const title = getTitle(setting, lang);
  const subtitle = getSubtitle(setting, lang);

  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-[-18%] top-[-28%] h-[520px] w-[520px] rounded-full bg-[#f1e4c8]/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-22%] right-[-18%] h-[560px] w-[560px] rounded-full bg-[#dfe8dd]/70 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-12 flex items-center justify-between rounded-[28px] bg-white/78 px-5 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <div className="flex h-11 items-center justify-center rounded-[18px] bg-[#111] px-7 text-[15px] font-black tracking-[0.18em] text-white">
            RichHouse
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-[#f2f2f2] p-1 sm:flex">
              <button
                type="button"
                onClick={() => setLang("ru")}
                className={`h-9 rounded-full px-4 text-[12px] font-black uppercase transition ${
                  lang === "ru"
                    ? "bg-[#111] text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
                    : "text-[#777] hover:text-[#111]"
                }`}
              >
                RU
              </button>

              <button
                type="button"
                onClick={() => setLang("uz")}
                className={`h-9 rounded-full px-4 text-[12px] font-black uppercase transition ${
                  lang === "uz"
                    ? "bg-[#111] text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
                    : "text-[#777] hover:text-[#111]"
                }`}
              >
                UZ
              </button>
            </div>

            <a
              href={phoneHref()}
              className="flex h-11 items-center justify-center rounded-[18px] bg-[#111] px-5 text-[14px] font-black tracking-[0.04em] text-white shadow-[0_18px_45px_rgba(0,0,0,0.16)]"
            >
              {phone}
            </a>
          </div>
        </header>

        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div className="max-w-2xl">
            <div className="mb-8 inline-flex rounded-full bg-white/82 px-7 py-3 text-[13px] font-black uppercase tracking-[0.5em] text-[#7b7b7b] shadow-[0_18px_50px_rgba(0,0,0,0.07)]">
              {lang === "uz"
                ? "Cheklangan taklif"
                : "Лимитированное предложение"}
            </div>

            <h1 className="text-[64px] font-black leading-[0.92] tracking-[-0.08em] text-[#050505] sm:text-[86px] lg:text-[104px]">
              {title}
            </h1>

            <p className="mt-7 max-w-2xl text-[20px] font-bold leading-[1.45] tracking-[-0.035em] text-[#6f7478] sm:text-[22px]">
              {subtitle}
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 translate-y-8 rounded-[42px] bg-black/10 blur-3xl" />

            <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-[34px] border-[10px] border-white bg-white shadow-[0_34px_100px_rgba(0,0,0,0.16)] lg:max-w-[620px]">
              {banner ? (
                <Image
                  src={banner}
                  alt={title}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 620px"
                  className="object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white px-8 text-center">
                  <div>
                    <div className="text-[13px] font-black uppercase tracking-[0.36em] text-black/35">
                      RichHouse
                    </div>

                    <div className="mt-4 text-[38px] font-black leading-none tracking-[-0.04em] text-black/65">
                      Баннер распродажи
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
