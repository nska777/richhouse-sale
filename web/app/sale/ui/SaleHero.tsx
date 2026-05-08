import Image from "next/image";
import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { saleCopy } from "./sale-copy";
import type { Lang, SaleSetting } from "./sale-types";
import { mediaUrl, normalizePhone, whatsappLink } from "./sale-utils";

type Props = {
  lang: Lang;
  setLang: Dispatch<SetStateAction<Lang>>;
  setting: SaleSetting | null;
  copy: (typeof saleCopy)["ru"];
};

function pickSettingText(
  lang: Lang,
  ruValue: string | null | undefined,
  uzValue: string | null | undefined,
  fallback: string,
) {
  const ru = String(ruValue || "").trim();
  const uz = String(uzValue || "").trim();

  if (lang === "uz") return uz || fallback;
  return ru || fallback;
}

function telegramLink(raw?: string | null) {
  const value = String(raw || "").trim();

  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (value.startsWith("@")) return `https://t.me/${value.replace("@", "")}`;

  return `https://t.me/${value}`;
}

export default function SaleHero({ lang, setLang, setting, copy }: Props) {
  const logoText = setting?.logoText || "RichHouse";

  const title = pickSettingText(
    lang,
    setting?.title,
    setting?.title_uz,
    copy.sale,
  );

  const subtitle = pickSettingText(
    lang,
    setting?.subtitle,
    setting?.subtitle_uz,
    copy.subtitle,
  );

  const buttonText = pickSettingText(
    lang,
    setting?.buttonText,
    setting?.button_text_uz,
    copy.order,
  );

  const heroBadge = pickSettingText(
    lang,
    setting?.hero_badge_ru,
    setting?.hero_badge_uz,
    copy.heroBadge,
  );

  const promoText = pickSettingText(
    lang,
    setting?.promo_text_ru,
    setting?.promo_text_uz,
    copy.floatingText,
  );

  const phone = setting?.phone || "+998901234567";
  const telegram = telegramLink(setting?.telegram);
  const whatsapp = setting?.whatsapp || whatsappLink(phone);

  const orderHref = telegram || whatsapp || `tel:${normalizePhone(phone)}`;

  const banner = mediaUrl(setting?.bannerImage);
  const logo = mediaUrl(setting?.logo);

  const promoItems = [copy.promo1, copy.promo2, copy.promo3, copy.promo4];

  return (
    <section className="relative min-h-[92svh] overflow-hidden px-4 pb-10 pt-28 sm:px-6 sm:pt-24 lg:px-8">
      <div className="absolute inset-0">
        {banner ? (
          <Image
            src={banner}
            alt=""
            fill
            priority
            className="object-cover opacity-[0.035]"
          />
        ) : null}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,245,247,0.9)_0%,rgba(245,245,247,0.98)_68%,#f5f5f7_100%)]" />
        <div className="absolute left-[-120px] top-[-160px] h-[360px] w-[360px] rounded-full bg-[#eadcc8]/55 blur-3xl" />
        <div className="absolute right-[-140px] top-[110px] h-[420px] w-[420px] rounded-full bg-white/80 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(92svh-7rem)] max-w-7xl flex-col">
        <header className="appear fixed left-0 right-0 top-4 z-50 px-4 sm:px-6 lg:px-8">
          <div className="glass mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-[26px] px-3 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              {logo ? (
                <div className="relative h-11 w-40 overflow-hidden rounded-2xl sm:h-12 sm:w-48">
                  <Image
                    src={logo}
                    alt={logoText}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-2xl bg-[#1d1d1f] px-4 py-2.5 text-sm font-semibold tracking-[0.16em] text-white sm:px-5">
                  {logoText}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-[#f1f1f3] p-1 ring-1 ring-black/5">
                {(["ru", "uz"] as Lang[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLang(item)}
                    className={[
                      "lang-button rounded-full px-3 py-2 text-xs font-semibold",
                      lang === item
                        ? "bg-[#1d1d1f] text-white shadow-sm"
                        : "text-black/48 hover:text-black",
                    ].join(" ")}
                  >
                    {saleCopy[item].langName}
                  </button>
                ))}
              </div>

              <a
                href={`tel:${normalizePhone(phone)}`}
                className="btn-premium hidden rounded-full bg-[#1d1d1f] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_12px_32px_rgba(0,0,0,0.16)] sm:inline-flex sm:px-5 sm:py-3 sm:text-sm"
              >
                {phone}
              </a>
            </div>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-8">
          <div className="max-w-3xl">
            <div className="appear mb-5 inline-flex items-center gap-2 rounded-full bg-white/76 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/50 shadow-sm ring-1 ring-black/5 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b58a4c]" />
              {heroBadge}
            </div>

            <h1 className="appear-2 max-w-4xl text-[clamp(2.7rem,7.4vw,6.6rem)] font-semibold leading-[0.97] tracking-[-0.07em] text-[#1d1d1f]">
              {title}
            </h1>

            <p className="appear-3 mt-6 max-w-2xl text-[clamp(1rem,1.7vw,1.24rem)] font-normal leading-[1.58] tracking-[-0.02em] text-black/58">
              {subtitle}
            </p>

            <div className="appear-3 mt-7 flex flex-wrap gap-2.5">
              {promoItems.map((item, index) => (
                <div
                  key={item}
                  style={{ "--p": index } as CSSProperties}
                  className="promo-pill rounded-full bg-white/78 px-4 py-2.5 text-sm font-semibold text-black/58 shadow-sm ring-1 ring-black/5 backdrop-blur-xl"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="appear-3 mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={`tel:${normalizePhone(phone)}`}
                className="btn-premium rounded-full bg-[#1d1d1f] px-6 py-3.5 text-center text-sm font-semibold text-white shadow-[0_16px_42px_rgba(0,0,0,0.18)]"
              >
                {copy.call}
              </a>

              {telegram ? (
                <a
                  href={telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-premium sale-telegram-button"
                >
                  {copy.telegram}
                </a>
              ) : null}

              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-premium sale-whatsapp-button"
                >
                  {copy.whatsapp}
                </a>
              ) : null}
            </div>
          </div>

          <div className="appear-3 hidden lg:block">
            <div className="relative ml-auto flex justify-center">
              <div className="relative w-full max-w-[430px] overflow-hidden rounded-[42px] bg-white p-3 shadow-[0_28px_90px_rgba(0,0,0,0.13)] ring-1 ring-black/[0.06]">
                <div className="relative aspect-[1122/1402] w-full overflow-hidden rounded-[32px] bg-[#f2f2f4]">
                  {banner ? (
                    <Image
                      src={banner}
                      alt="RichHouse Sale"
                      fill
                      priority
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_18%,#ffffff_0%,#e7ded2_36%,#cbb18a_100%)]" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="appear-3 pb-2">
          <div className="soft-card grid gap-4 rounded-[32px] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <div>
              <div className="text-xl font-semibold tracking-[-0.045em] text-[#1d1d1f]">
                {copy.floatingTitle}
              </div>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-black/52">
                {promoText}
              </p>
            </div>

            <a
              href={orderHref}
              target={orderHref.startsWith("http") ? "_blank" : undefined}
              rel={orderHref.startsWith("http") ? "noreferrer" : undefined}
              className="btn-premium sale-hero-order-button"
            >
              {buttonText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
