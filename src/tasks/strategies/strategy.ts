import { Item } from "kolmafia";
import { Task } from "../../engine/task";
import { args } from "../../main";
import { freecandy } from "./freecandy";
import { garbo } from "./garbo";
import { railo } from "./railo";

export type Strategy = {
  tasks: (ascend: boolean) => Task[];
  gyou?: { pulls: Item[]; ronin: Task["do"]; postronin: Task["do"] };
};

export function chooseStrategy(): Strategy {
  switch (args.major.strategy) {
    case "garbo":
      return garbo;
    case "freecandy":
      return freecandy;
    case "railo":
      return railo;
    default:
      throw `Unsupported strategy "${args.major.strategy}"`;
  }
}
