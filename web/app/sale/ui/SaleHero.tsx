"use client";

import Image from "next/image";
import type { Lang, SaleSetting } from "./sale-types";
import { STRAPI_URL } from "./sale-utils";

type Props = {
  lang: Lang;
  setting: SaleSetting | null;
  copy?: unknown;

  // поддерживаем оба варианта, чтобы не падало
  onLangChange?: (lang: Lang) => void;
  setLang?: (lang: Lang) => void;
};

const PHONE_DISPLAY = "+998 90 002 12 30";
const PHONE_HREF = "tel:+998900021230";

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
    const large = formats.large;
    const medium = formats.medium;
    const small = formats.small;

    for (const item of [large, medium, small]) {
      if (isRecord(item) && typeof item.url === "string" && item.url) {
        return item.url.startsWith("http")
          ? item.url
          : `${STRAPI_URL}${item.url}`;
      }
    }
  }

  return "";
}

function textByLang(
  lang: Lang,
  ru?: string | null,
  uz?: string | null,
  fallback = "",
) {
  if (lang === "uz") return uz || ru || fallback;
  return ru || fallback;
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
    setting?.title,
    setting?.title_uz,
    lang === "uz" ? "Mebelga katta chegirmalar" : "Распродажа мебели",
  );

  const heroBadge = textByLang(
    lang,
    setting?.hero_badge_ru,
    setting?.hero_badge_uz,
    lang === "uz" ? "Cheklangan taklif" : "Лимитированное предложение",
  );

  const banner = getMediaUrl(setting?.bannerImage);
  const logo = getMediaUrl(setting?.logo);

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

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.78fr] lg:gap-14">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-black/8 bg-white/70 px-5 py-3 text-[11px] font-black uppercase tracking-[0.38em] text-black/48 shadow-sm backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b68a4a]" />
              {heroBadge}
            </div>

            <h1 className="max-w-[760px] text-[56px] font-black leading-[0.95] tracking-[-0.065em] text-[#171717] sm:text-[82px] lg:text-[104px] xl:text-[116px]">
              {title}
            </h1>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] lg:max-w-[560px]">
            <div className="relative aspect-[0.92] overflow-hidden rounded-[34px] border-[10px] border-white bg-[#d7c8aa] shadow-[0_34px_110px_rgba(0,0,0,0.16)] sm:rounded-[42px]">
              {banner ? (
                <Image
                  src={banner}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 92vw, 560px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-black uppercase tracking-[0.32em] text-black/30">
                  RichHouse Sale
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
