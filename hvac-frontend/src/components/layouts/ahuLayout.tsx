import type { AhuCardId } from "@/types/AhuCardId";

export interface AhuLayoutGroup {
  id: string;
  title: string;
  cards: AhuCardId[];
}

export const DEFAULT_AHU_LAYOUT: AhuLayoutGroup[] = [
  {
    id: "climate",
    title: "Clima",
    cards: ["temperature", "humidity"],
  },
  {
    id: "air",
    title: "Ventilación",
    cards: ["fan", "airflow", "damper"],
  },
  {
    id: "energy",
    title: "Energía & Filtros",
    cards: ["power", "filter"],
  },
];
