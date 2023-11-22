import { Item } from "kolmafia";
import { Task } from "../paths/structure";
import { freecandy } from "./freecandy";
import { garbo } from "./garbo";
import { baggo } from "./baggo";
import { args } from "../args";

export type Strategy = {
  tasks: (ascend: boolean) => Task[];
  gyou?: {
    pulls: Item[];
    ronin: Pick<Task, "do" | "outfit">;
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
    default:
      throw `Unsupported strategy: ${args.major.strategy}`;
  }
}
