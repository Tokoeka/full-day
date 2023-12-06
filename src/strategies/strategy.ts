import { Item } from "kolmafia";
import { freecandy } from "./freecandy";
import { garbo } from "./garbo";
import { baggo } from "./baggo";
import { args } from "../args";
import { chrono } from "./chrono";
import { LoopTask } from "../engine/engine";

export type Strategy = {
  tasks: (ascend: boolean) => LoopTask[];
  gyou?: {
    pulls: Item[];
    ronin: Pick<LoopTask, "do" | "outfit">;
  };
};

export function chooseStrategy(): Strategy {
  switch (args.major.strategy) {
    case "garbo":
      return garbo();
    case "freecandy":
      return freecandy();
    case "baggo":
      return baggo();
    case "chrono":
      return chrono();
    default:
      throw `Unsupported strategy: ${args.major.strategy}`;
  }
}
