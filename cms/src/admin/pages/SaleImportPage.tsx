import { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Typography,
  Alert,
  Loader,
  Main,
} from "@strapi/design-system";

type ImportResult = {
  ok?: boolean;
  mode?: string;
  created?: number;
  updated?: number;
  skipped?: number;
  deactivated?: number;
  error?: string;
};

const API_BASE = "";

function downloadFile() {
  window.location.href = `${API_BASE}/api/sale-export`;
}

async function uploadExcel(file: File, replace: boolean): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const url = replace
    ? `${API_BASE}/api/sale-import?replace=true`
    : `${API_BASE}/api/sale-import`;

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      ok: false,
      error: json?.error || "Ошибка импорта Excel",
    };
  }

  return json;
}

export default function SaleImportPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  const fileLabel = useMemo(() => {
    if (!file) return "Файл не выбран";
    return `${file.name} • ${(file.size / 1024).toFixed(1)} KB`;
  }, [file]);

  async function handleImport(replace: boolean) {
    if (!file) {
      setError("Сначала выбери Excel файл.");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    try {
      const data = await uploadExcel(file, replace);

      if (!data.ok) {
        setError(data.error || "Импорт не выполнен.");
        return;
      }

      setResult(data);
    } catch (e) {
      console.error(e);
      setError("Ошибка загрузки файла. Проверь Strapi route /api/sale-import.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Main>
      <Box padding={8} background="neutral100" minHeight="100vh">
        <Flex direction="column" alignItems="stretch" gap={6}>
          <Box>
            <Typography variant="alpha" as="h1">
              Импорт / Экспорт распродажи
            </Typography>

            <Box paddingTop={2}>
              <Typography textColor="neutral600">
                Управление товарами мини-сайта RichHouse Sale через Excel.
              </Typography>
            </Box>
          </Box>

          {error ? (
            <Alert closeLabel="Закрыть" title="Ошибка" variant="danger">
              {error}
            </Alert>
          ) : null}

          {result?.ok ? (
            <Alert closeLabel="Закрыть" title="Импорт завершен" variant="success">
              Режим: {result.mode}. Создано: {result.created || 0}. Обновлено:{" "}
              {result.updated || 0}. Пропущено: {result.skipped || 0}.
              Деактивировано: {result.deactivated || 0}.
            </Alert>
          ) : null}

          <Box
            background="neutral0"
            padding={6}
            hasRadius
            shadow="tableShadow"
            borderColor="neutral150"
          >
            <Flex direction="column" alignItems="stretch" gap={5}>
              <Box>
                <Typography variant="beta" as="h2">
                  1. Выгрузить текущие товары
                </Typography>

                <Box paddingTop={2}>
                  <Typography textColor="neutral600">
                    Скачай Excel, отредактируй товары, цены, скидки, тексты RU/UZ
                    и загрузи обратно.
                  </Typography>
                </Box>
              </Box>

              <Flex gap={3} wrap="wrap">
                <Button variant="secondary" onClick={downloadFile}>
                  Выгрузить Excel
                </Button>
              </Flex>
            </Flex>
          </Box>

          <Box
            background="neutral0"
            padding={6}
            hasRadius
            shadow="tableShadow"
            borderColor="neutral150"
          >
            <Flex direction="column" alignItems="stretch" gap={5}>
              <Box>
                <Typography variant="beta" as="h2">
                  2. Загрузить Excel
                </Typography>

                <Box paddingTop={2}>
                  <Typography textColor="neutral600">
                    Используй файл с листом Products и колонками sku, title,
                    title_uz, description, description_uz, price, oldPrice,
                    badge, badge_uz, imageFile, phone, telegram, whatsapp,
                    sortOrder, isActive.
                  </Typography>
                </Box>
              </Box>

              <input
                ref={inputRef}
                type="file"
                accept=".xlsx"
                style={{ display: "none" }}
                onChange={(event) => {
                  const selected = event.target.files?.[0] || null;
                  setFile(selected);
                  setError("");
                  setResult(null);
                }}
              />

              <Box
                padding={4}
                background="neutral100"
                hasRadius
                borderColor="neutral200"
              >
                <Flex justifyContent="space-between" alignItems="center" gap={4}>
                  <Box>
                    <Typography fontWeight="bold">Выбранный файл</Typography>
                    <Box paddingTop={1}>
                      <Typography textColor="neutral600">{fileLabel}</Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="tertiary"
                    onClick={() => inputRef.current?.click()}
                  >
                    Выбрать файл
                  </Button>
                </Flex>
              </Box>

              <Flex gap={3} wrap="wrap">
                <Button
                  disabled={loading || !file}
                  onClick={() => handleImport(false)}
                >
                  {loading ? <Loader small /> : "Обновить товары"}
                </Button>

                <Button
                  variant="danger-light"
                  disabled={loading || !file}
                  onClick={() => {
                    const ok = window.confirm(
                      "Заменить распродажу полностью? Товары, которых нет в Excel, будут скрыты."
                    );

                    if (ok) handleImport(true);
                  }}
                >
                  Заменить полностью
                </Button>
              </Flex>
            </Flex>
          </Box>

          <Box
            background="neutral0"
            padding={6}
            hasRadius
            shadow="tableShadow"
            borderColor="neutral150"
          >
            <Flex direction="column" alignItems="stretch" gap={3}>
              <Typography variant="beta" as="h2">
                Как работает
              </Typography>

              <Typography textColor="neutral600">
                “Обновить товары” — создает новые товары и обновляет существующие
                по sku.
              </Typography>

              <Typography textColor="neutral600">
                “Заменить полностью” — делает то же самое, но товары, которых нет
                в Excel, переводит в isActive=false.
              </Typography>

              <Typography textColor="neutral600">
                Фото подтягиваются по колонке imageFile. Сначала загрузи фото в
                Media Library Strapi, потом укажи имя файла в Excel.
              </Typography>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Main>
  );
}