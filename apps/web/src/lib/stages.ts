import stagesData from "@/data/stages.json";
import type { StageDefinition } from "@/types/eml";

export const stages = stagesData as StageDefinition[];

export function getStageById(id: number) {
  return stages.find((stage) => stage.id === id) ?? null;
}

