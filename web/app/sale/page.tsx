import type { Metadata } from "next";
import SaleClient from "./ui/SaleClient";

export const metadata: Metadata = {
  title: "Распродажа мебели RichHouse",
  description:
    "Премиальная мебель RichHouse по специальным ценам. Количество товаров ограничено.",
};

export default function SalePage() {
  return <SaleClient />;
}
