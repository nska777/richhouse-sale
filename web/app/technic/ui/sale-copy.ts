import type { Lang } from "./sale-types";

export const saleCopy: Record<
  Lang,
  {
    langName: string;
    sale: string;
    subtitle: string;
    heroBadge: string;
    premiumSale: string;
    limitedStock: string;
    call: string;
    whatsapp: string;
    telegram: string;
    productsLabel: string;
    choose: string;
    note: string;
    empty: string;
    order: string;
    writeTelegram: string;
    noPhoto: string;
    discountUpTo: string;
    miniText: string;
    promo1: string;
    promo2: string;
    promo3: string;
    promo4: string;
    floatingTitle: string;
    floatingText: string;
    loading: string;
  }
> = {
  ru: {
    langName: "RU",
    sale: "Распродажа мебели",
    subtitle:
      "Премиальная мебель RichHouse по специальным ценам. Количество товаров ограничено.",
    heroBadge: "Лимитированное предложение",
    premiumSale: "Premium sale",
    limitedStock: "limited collection",
    call: "Позвонить",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    productsLabel: "Товары распродажи",
    choose: "Выберите позицию",
    note:
      "Цены и наличие актуальны на момент публикации. Для брони товара свяжитесь с менеджером.",
    empty: "Товары пока не добавлены.",
    order: "Заказать",
    writeTelegram: "Написать в Telegram",
    noPhoto: "Нет фото",
    discountUpTo: "Скидки до",
    miniText:
      "Премиальные позиции по специальным ценам. Обновление через Strapi и Excel.",
    promo1: "До 50%",
    promo2: "Ограниченное количество",
    promo3: "Быстрая бронь",
    promo4: "Спеццены сегодня",
    floatingTitle: "Лучшие позиции уходят первыми",
    floatingText:
      "Забронируйте лучшие позиции, пока они доступны. Менеджер подтвердит наличие и поможет оформить заказ.",
    loading: "Загрузка...",
  },

  uz: {
    langName: "UZ",
    sale: "Mebelga katta chegirmalar",
    subtitle:
      "RichHouse premium mebellari maxsus narxlarda. Mahsulotlar soni cheklangan.",
    heroBadge: "Cheklangan taklif",
    premiumSale: "Premium aksiya",
    limitedStock: "cheklangan to‘plam",
    call: "Qo‘ng‘iroq qilish",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    productsLabel: "Chegirmadagi mahsulotlar",
    choose: "Mahsulotni tanlang",
    note:
      "Narxlar va mavjudlik e’lon qilingan vaqtda dolzarb. Band qilish uchun menejer bilan bog‘laning.",
    empty: "Mahsulotlar hali qo‘shilmagan.",
    order: "Buyurtma berish",
    writeTelegram: "Telegram orqali yozish",
    noPhoto: "Rasm yo‘q",
    discountUpTo: "Chegirmalar",
    miniText:
      "Premium mahsulotlar maxsus narxlarda. Strapi va Excel orqali yangilanadi.",
    promo1: "50% gacha",
    promo2: "Cheklangan miqdor",
    promo3: "Tezkor band qilish",
    promo4: "Bugungi maxsus narx",
    floatingTitle: "Eng yaxshi mahsulotlar tez tugaydi",
    floatingText:
      "Eng yaxshi mahsulotlarni mavjud paytida band qiling. Menejer mavjudlikni tasdiqlaydi va buyurtma berishga yordam beradi.",
    loading: "Yuklanmoqda...",
  },
};