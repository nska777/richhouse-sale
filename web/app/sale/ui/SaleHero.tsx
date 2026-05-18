"use client";

import Image from "next/image";
import type { Lang, SaleSetting } from "./sale-types";
import { STRAPI_URL } from "./sale-utils";

type Props = {
  lang: Lang;
  setting: SaleSetting | null;
  copy?: unknown;
  onLangChange?: (lang: Lang) => void;
  setLang?: (lang: Lang) => void;
};

type MediaFormat = {
  url?: unknown;
};

type MediaLike = {
  url?: unknown;
  formats?: {
    thumbnail?: MediaFormat;
    small?: MediaFormat;
    medium?: MediaFormat;
    large?: MediaFormat;
  };
  data?:
    | {
        attributes?: MediaLike;
      }
    | {
        attributes?: MediaLike;
      }[]
    | null;
  attributes?: MediaLike;
};

const PHONE_DISPLAY = "+998 90 002 12 30";
const PHONE_HREF = "tel:+998900021230";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function textValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function getSettingField(setting: SaleSetting | null, key: string): unknown {
  if (!setting) return "";

  const record = setting as unknown as Record<string, unknown>;
  const attrs = record.attributes as Record<string, unknown> | undefined;

  if (record[key] !== undefined && record[key] !== null) return record[key];

  if (attrs && attrs[key] !== undefined && attrs[key] !== null) {
    return attrs[key];
  }

  return "";
}

function absoluteMediaUrl(url: string): string {
  const cleanUrl = url.trim();

  if (!cleanUrl) return "";

  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  const base = STRAPI_URL.replace(/\/$/, "");
  const path = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;

  return `${base}${path}`;
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

  if (!isRecord(media)) return null;

  const item = media as MediaLike;

  if (Array.isArray(item.data)) {
    return normalizeMedia(item.data[0]);
  }

  if (item.data && !Array.isArray(item.data) && item.data.attributes) {
    return item.data.attributes;
  }

  if (item.attributes) return item.attributes;

  return item;
}

function getMediaUrl(media: unknown): string {
  const item = normalizeMedia(media);

  if (!item) return "";

  const medium = textValue(item.formats?.medium?.url);
  const large = textValue(item.formats?.large?.url);
  const small = textValue(item.formats?.small?.url);
  const thumbnail = textValue(item.formats?.thumbnail?.url);
  const original = textValue(item.url);

  return absoluteMediaUrl(medium || large || small || thumbnail || original);
}

function textByLang(
  lang: Lang,
  ru: unknown,
  uz: unknown,
  fallback = "",
): string {
  const ruText = textValue(ru);
  const uzText = textValue(uz);

  if (lang === "uz") return uzText || ruText || fallback;

  return ruText || uzText || fallback;
}

export default function SaleHero({
  lang,
  setting,
  onLangChange,
  setLang,
}: Props) {
  const changeLang = onLangChange || setLang || (() => {});

  const title = textByLang(
    lang,
    getSettingField(setting, "title"),
    getSettingField(setting, "title_uz"),
    lang === "uz" ? "Mebelga katta chegirmalar" : "Распродажа мебели",
  );

  const subtitle = textByLang(
    lang,
    getSettingField(setting, "subtitle"),
    getSettingField(setting, "subtitle_uz"),
    lang === "uz"
      ? "Barcha mahsulotlarga 50% gacha chegirmalar. Mahsulotlar soni cheklangan."
      : "Скидки до 50% на все позиции. Количество ограничено.",
  );

  const heroBadge = textByLang(
    lang,
    getSettingField(setting, "hero_badge_ru"),
    getSettingField(setting, "hero_badge_uz"),
    lang === "uz" ? "Cheklangan taklif" : "Лимитированное предложение",
  );

  const buttonText = textByLang(
    lang,
    getSettingField(setting, "buttonText"),
    getSettingField(setting, "button_text_uz"),
    lang === "uz" ? "Tanlash" : "Выбрать товары",
  );

  const banner =
    getMediaUrl(getSettingField(setting, "bannerImage")) ||
    getMediaUrl(getSettingField(setting, "banner")) ||
    getMediaUrl(getSettingField(setting, "heroImage")) ||
    getMediaUrl(getSettingField(setting, "image"));

  const logo = getMediaUrl(getSettingField(setting, "logo"));

  return (
    <section className="relative overflow-hidden bg-[#f4f4f2] pb-8 pt-5 sm:pb-12 sm:pt-6 lg:pb-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.96),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(216,196,158,0.24),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f4f4f2_58%,#eeeeec_100%)]" />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <header className="sticky top-3 z-30 mb-10 rounded-[28px] border border-black/5 bg-white/75 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:mb-14 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {logo ? (
                <div className="relative h-10 w-[150px] overflow-hidden rounded-2xl bg-white sm:h-12 sm:w-[190px]">
                  <Image
                    src={logo}
                    alt="RichHouse"
                    fill
                    priority
                    unoptimized
                    sizes="190px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-2xl bg-[#151515] px-7 py-3 text-sm font-black tracking-[0.22em] text-white shadow-lg">
                  RichHouse
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="flex rounded-full bg-black/5 p-1">
                <button
                  type="button"
                  onClick={() => changeLang("ru")}
                  className={[
                    "h-9 cursor-pointer rounded-full px-4 text-xs font-black transition-all",
                    lang === "ru"
                      ? "bg-[#151515] text-white shadow-md"
                      : "text-black/45 hover:text-black",
                  ].join(" ")}
                >
                  RU
                </button>

                <button
                  type="button"
                  onClick={() => changeLang("uz")}
                  className={[
                    "h-9 cursor-pointer rounded-full px-4 text-xs font-black transition-all",
                    lang === "uz"
                      ? "bg-[#151515] text-white shadow-md"
                      : "text-black/45 hover:text-black",
                  ].join(" ")}
                >
                  UZ
                </button>
              </div>

              <a
                href={PHONE_HREF}
                className="hidden rounded-full bg-[#151515] px-5 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-black sm:block"
              >
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </header>

        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex rounded-full border border-black/5 bg-white/80 px-8 py-3 text-[12px] font-black uppercase tracking-[0.56em] text-[#6f6f6f] shadow-[0_14px_42px_rgba(0,0,0,0.08)]">
              {heroBadge}
            </div>

            <h1 className="max-w-4xl text-[64px] font-black leading-[0.9] tracking-[-0.08em] text-[#111] sm:text-[88px] lg:text-[112px]">
              {title}
            </h1>

            <p className="mt-7 max-w-2xl text-[18px] font-semibold leading-[1.55] text-[#6f6f6f] sm:text-[20px]">
              {subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#products"
                className="rounded-full bg-[#151515] px-8 py-4 text-[15px] font-black text-white shadow-[0_18px_44px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-black"
              >
                {buttonText}
              </a>

              <a
                href={PHONE_HREF}
                className="rounded-full bg-white px-8 py-4 text-[15px] font-black text-[#151515] shadow-[0_18px_44px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
              >
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[46px] bg-[#d8c49e]/30 blur-3xl" />

            <div className="relative aspect-[1.08/1] overflow-hidden rounded-[42px] border-[10px] border-white bg-[#d6c8a8] shadow-[0_38px_110px_rgba(0,0,0,0.14)]">
              {banner ? (
                <Image
                  src={banner}
                  alt={title}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 680px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#d6c8a8] px-8 text-center">
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
