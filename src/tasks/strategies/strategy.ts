import { Task } from "../../engine/task";
import { args } from "../../main";
import { baggo } from "./baggo";
import { chrono } from "./chrono";
import { freecandy } from "./freecandy";
import { garbo } from "./garbo";

export function strategyTasks(ascend: boolean): Task[] {
  switch (args.strategy) {
    case "garbo":
      return garbo(ascend);
    case "baggo":
      return baggo(ascend);
    case "chrono":
      return chrono(ascend);
    case "freecandy":
      return freecandy(ascend);
    default:
      throw `Strategy ${args.strategy} is not not implemented`;
  }
}
