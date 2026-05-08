import type { StrapiApp } from "@strapi/strapi/admin";

const SaleImportIcon = () => <span style={{ fontSize: 18 }}>%</span>;

export default {
  config: {
    locales: ["ru"],
  },

  bootstrap() {},

  register(app: StrapiApp) {
    app.addMenuLink({
      to: "/plugins/sale-import",
      icon: SaleImportIcon,
      intlLabel: {
        id: "sale-import.plugin.name",
        defaultMessage: "Импорт распродажи",
      },
      Component: async () => {
        const component = await import("./pages/SaleImportPage");
        return component;
      },
      permissions: [],
    });
  },
};