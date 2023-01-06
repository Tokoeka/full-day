import { Item } from "kolmafia";
import { Task } from "../../engine/task";
import { args } from "../../main";
import { freecandy } from "./freecandy";
import { garbo } from "./garbo";
import { baggo } from "./baggo";

export type Strategy = {
  tasks: (ascend: boolean) => Task[];
  gyou?: {
    pulls: Item[];
    ronin: Pick<Task, "prepare" | "do" | "outfit">;
    postronin: Pick<Task, "prepare" | "do" | "outfit">;
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
      throw `Unsupported strategy "${args.major.strategy}"`;
  }
}
