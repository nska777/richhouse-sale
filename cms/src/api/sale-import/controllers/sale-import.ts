import fs from "node:fs";
import ExcelJS from "exceljs";

const UID = "api::sale-product.sale-product";
const SHEET_PRODUCTS = "Products";

const PRODUCT_COLUMNS = [
  { key: "sku", header: "sku", width: 18 },
  { key: "title", header: "title", width: 32 },
  { key: "title_uz", header: "title_uz", width: 32 },
  { key: "category", header: "category", width: 18 },
  { key: "description", header: "description", width: 42 },
  { key: "description_uz", header: "description_uz", width: 42 },
  { key: "price", header: "price", width: 16 },
  { key: "oldPrice", header: "oldPrice", width: 16 },
  { key: "badge", header: "badge", width: 16 },
  { key: "badge_uz", header: "badge_uz", width: 16 },
  { key: "imageFile", header: "imageFile", width: 28 },
  { key: "phone", header: "phone", width: 20 },
  { key: "telegram", header: "telegram", width: 30 },
  { key: "whatsapp", header: "whatsapp", width: 30 },
  { key: "sortOrder", header: "sortOrder", width: 12 },
  { key: "isActive", header: "isActive", width: 12 },
];

function cleanString(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "object" && value !== null && "text" in value) {
    return String((value as { text?: unknown }).text || "").trim();
  }

  if (typeof value === "object" && value !== null && "result" in value) {
    return String((value as { result?: unknown }).result || "").trim();
  }

  return String(value).trim();
}

function toNumber(value: unknown): number | null {
  const raw = cleanString(value);
  if (!raw) return null;

  const normalized = raw.replace(/\s/g, "").replace(/,/g, ".");
  const n = Number(normalized);

  if (!Number.isFinite(n)) return null;

  return n;
}

function toBool(value: unknown, fallback = true): boolean {
  const raw = cleanString(value).toLowerCase();

  if (!raw) return fallback;

  if (["true", "1", "yes", "y", "да", "активно", "active"].includes(raw)) {
    return true;
  }

  if (["false", "0", "no", "n", "нет", "неактивно", "inactive"].includes(raw)) {
    return false;
  }

  return fallback;
}

function normalizeCategory(value: unknown): string {
  const raw = cleanString(value).toLowerCase();

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

function getCell(row: ExcelJS.Row, key: string) {
  const worksheet = row.worksheet;
  const headerRow = worksheet.getRow(1);

  let columnNumber = 0;

  headerRow.eachCell((cell, colNumber) => {
    if (cleanString(cell.value) === key) {
      columnNumber = colNumber;
    }
  });

  if (!columnNumber) return "";

  return row.getCell(columnNumber).value;
}

async function findUploadByFileName(strapi: any, fileName: string) {
  const clean = fileName.trim();

  if (!clean) return null;

  const files = await strapi.entityService.findMany("plugin::upload.file", {
    filters: {
      $or: [
        { name: { $eq: clean } },
        { name: { $containsi: clean } },
        { url: { $containsi: clean } },
      ],
    },
    limit: 1,
  });

  return Array.isArray(files) && files.length > 0 ? files[0] : null;
}

async function findProductBySku(strapi: any, sku: string) {
  if (!sku) return null;

  const items = await strapi.documents(UID).findMany({
    filters: {
      sku: {
        $eq: sku,
      },
    },
    limit: 1,
    status: "draft",
  });

  return Array.isArray(items) && items.length > 0 ? items[0] : null;
}

async function getAllSaleProducts(strapi: any) {
  return await strapi.documents(UID).findMany({
    limit: 1000,
    status: "draft",
    populate: {
      image: true,
    },
    sort: ["sortOrder:asc", "title:asc"],
  });
}

export default {
  async exportProducts(ctx: any) {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "RichHouse Sale";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(SHEET_PRODUCTS);
    sheet.columns = PRODUCT_COLUMNS;

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).height = 22;

    const products = await getAllSaleProducts(strapi);

    for (const product of products) {
      const imageUrl = product?.image?.url || "";
      const imageFile = imageUrl ? String(imageUrl).split("/").pop() : "";

      sheet.addRow({
        sku: product.sku || "",
        title: product.title || "",
        title_uz: product.title_uz || "",
        category: product.category || "other",
        description: product.description || "",
        description_uz: product.description_uz || "",
        price: product.price || "",
        oldPrice: product.oldPrice || "",
        badge: product.badge || "",
        badge_uz: product.badge_uz || "",
        imageFile,
        phone: product.phone || "",
        telegram: product.telegram || "",
        whatsapp: product.whatsapp || "",
        sortOrder: product.sortOrder ?? 100,
        isActive: product.isActive !== false,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    ctx.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    ctx.set(
      "Content-Disposition",
      'attachment; filename="richhouse-sale-products.xlsx"'
    );

    ctx.body = Buffer.from(buffer);
  },

  async importProducts(ctx: any) {
    const replaceMode =
      cleanString(ctx.query?.replace).toLowerCase() === "true" ||
      cleanString(ctx.query?.replace) === "1";

    const uploadedFile = ctx.request.files?.file;

    if (!uploadedFile) {
      ctx.status = 400;
      ctx.body = {
        ok: false,
        error: "Excel file is required. Upload field name must be 'file'.",
      };
      return;
    }

    const filePath = Array.isArray(uploadedFile)
      ? uploadedFile[0]?.filepath || uploadedFile[0]?.path
      : uploadedFile.filepath || uploadedFile.path;

    if (!filePath || !fs.existsSync(filePath)) {
      ctx.status = 400;
      ctx.body = {
        ok: false,
        error: "Uploaded file path not found.",
      };
      return;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet(SHEET_PRODUCTS);

    if (!sheet) {
      ctx.status = 400;
      ctx.body = {
        ok: false,
        error: `Sheet '${SHEET_PRODUCTS}' not found.`,
      };
      return;
    }

    const seenSkus = new Set<string>();

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let deactivated = 0;

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);

      const sku = cleanString(getCell(row, "sku"));
      const title = cleanString(getCell(row, "title"));
      const title_uz = cleanString(getCell(row, "title_uz"));
      const category = normalizeCategory(getCell(row, "category"));
      const description = cleanString(getCell(row, "description"));
      const description_uz = cleanString(getCell(row, "description_uz"));
      const badge = cleanString(getCell(row, "badge"));
      const badge_uz = cleanString(getCell(row, "badge_uz"));
      const imageFile = cleanString(getCell(row, "imageFile"));
      const phone = cleanString(getCell(row, "phone"));
      const telegram = cleanString(getCell(row, "telegram"));
      const whatsapp = cleanString(getCell(row, "whatsapp"));

      const price = toNumber(getCell(row, "price"));
      const oldPrice = toNumber(getCell(row, "oldPrice"));
      const sortOrder = toNumber(getCell(row, "sortOrder"));
      const isActive = toBool(getCell(row, "isActive"), true);

      if (!sku && !title) {
        skipped++;
        continue;
      }

      const finalSku = sku || `SALE-${rowNumber}`;
      seenSkus.add(finalSku);

      const image = imageFile
        ? await findUploadByFileName(strapi, imageFile)
        : null;

      const data: any = {
        sku: finalSku,
        title: title || finalSku,
        title_uz,
        category,
        description,
        description_uz,
        price,
        oldPrice,
        badge,
        badge_uz,
        phone,
        telegram,
        whatsapp,
        sortOrder: sortOrder ?? 100,
        isActive,
        publishedAt: isActive ? new Date() : null,
      };

      if (image?.id) {
        data.image = image.id;
      }

      const existing = await findProductBySku(strapi, finalSku);

      if (existing?.documentId) {
        await strapi.documents(UID).update({
          documentId: existing.documentId,
          data,
          status: isActive ? "published" : "draft",
        });

        updated++;
      } else {
        await strapi.documents(UID).create({
          data,
          status: isActive ? "published" : "draft",
        });

        created++;
      }
    }

    if (replaceMode) {
      const allProducts = await getAllSaleProducts(strapi);

      for (const product of allProducts) {
        const sku = cleanString(product.sku);

        if (!sku || seenSkus.has(sku)) continue;

        await strapi.documents(UID).update({
          documentId: product.documentId,
          data: {
            isActive: false,
            publishedAt: null,
          },
          status: "draft",
        });

        deactivated++;
      }
    }

    ctx.body = {
      ok: true,
      mode: replaceMode ? "replace" : "update",
      created,
      updated,
      skipped,
      deactivated,
    };
  },
};