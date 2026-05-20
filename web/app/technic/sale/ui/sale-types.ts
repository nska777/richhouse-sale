export type Lang = "ru" | "uz";

export type StrapiMedia = {
  url?: string | null;
  alternativeText?: string | null;
};

export type SaleSetting = {
  logoText?: string | null;

  title?: string | null;
  title_uz?: string | null;

  subtitle?: string | null;
  subtitle_uz?: string | null;

  phone?: string | null;
  telegram?: string | null;
  whatsapp?: string | null;

  buttonText?: string | null;
  button_text_uz?: string | null;

  hero_badge_ru?: string | null;
  hero_badge_uz?: string | null;

  promo_text_ru?: string | null;
  promo_text_uz?: string | null;

  isActive?: boolean | null;
  logo?: StrapiMedia | null;
  bannerImage?: StrapiMedia | null;
};

export type SaleProduct = {
  id: number;

  title?: string | null;
  title_uz?: string | null;

  sku?: string | null;
  category?: string | null;

  description?: string | null;
  description_uz?: string | null;

  price?: number | string | null;
  oldPrice?: number | string | null;

  badge?: string | null;
  badge_uz?: string | null;

  phone?: string | null;
  telegram?: string | null;
  whatsapp?: string | null;

  sortOrder?: number | null;
  isActive?: boolean | null;
  image?: StrapiMedia | null;
};