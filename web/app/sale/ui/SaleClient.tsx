"use client";

import { useEffect, useState } from "react";
import "./sale-styles.css";

import SaleHero from "./SaleHero";
import SaleProducts from "./SaleProducts";
import { saleCopy } from "./sale-copy";
import type { Lang, SaleProduct, SaleSetting } from "./sale-types";
import { STRAPI_URL } from "./sale-utils";

export default function SaleClient() {
  const [lang, setLang] = useState<Lang>("ru");
  const [setting, setSetting] = useState<SaleSetting | null>(null);
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("richhouse-sale-lang");

    if (saved === "uz") {
      setLang("uz");
      return;
    }

    if (saved === "ru") {
      setLang("ru");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("richhouse-sale-lang", lang);
  }, [lang]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);

        const [settingRes, productsRes] = await Promise.all([
          fetch(`${STRAPI_URL}/api/sale-setting?populate=*`, {
            cache: "no-store",
          }),
          fetch(
            `${STRAPI_URL}/api/sale-products?populate=*&sort=sortOrder:asc`,
            {
              cache: "no-store",
            },
          ),
        ]);

        const settingJson = settingRes.ok ? await settingRes.json() : null;
        const productsJson = productsRes.ok ? await productsRes.json() : null;

        if (!alive) return;

        setSetting(settingJson?.data || null);

        const items = Array.isArray(productsJson?.data)
          ? productsJson.data
          : [];

        setProducts(
          items
            .filter((item: SaleProduct) => item?.isActive !== false)
            .sort((a: SaleProduct, b: SaleProduct) => {
              const aa = Number(a.sortOrder || 100);
              const bb = Number(b.sortOrder || 100);
              return aa - bb;
            }),
        );
      } catch (error) {
        console.error("Sale page load error:", error);

        if (!alive) return;

        setSetting(null);
        setProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const copy = saleCopy[lang];

  return (
    <main className="sale-page min-h-screen overflow-x-hidden bg-[#f5f5f7] text-[#1d1d1f]">
      <SaleHero lang={lang} setLang={setLang} setting={setting} copy={copy} />

      <SaleProducts
        lang={lang}
        setting={setting}
        products={products}
        loading={loading}
        copy={copy}
      />
    </main>
  );
}
