import { Task } from "../../engine/task";
import { args } from "../../main";
import { baggo } from "./baggo";
import { custom } from "./custom";
import { freecandy } from "./freecandy";
import { garbo } from "./garbo";

export function strategyTasks(ascend: boolean): Task[] {
  switch (args.major.strategy) {
    case "garbo":
      return garbo(ascend);
    case "freecandy":
      return freecandy(ascend);
    case "baggo":
      return baggo(ascend);
    default:
      return custom(ascend);
  }
}
