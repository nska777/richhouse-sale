export default {
  routes: [
    {
      method: "GET",
      path: "/sale-export",
      handler: "sale-import.exportProducts",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/sale-import",
      handler: "sale-import.importProducts",
      config: {
        auth: false,
      },
    },
  ],
};