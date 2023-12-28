import { freecandy } from "./freecandy";
import { garbo } from "./garbo";
import { args } from "../args";
import { chrono } from "./chrono";
import { LoopTask } from "../engine/engine";
import { visitUrl } from "kolmafia";
import { get } from "libram";
import { isHalloween } from "../lib";
import { crimbo } from "./crimbo";

export type Strategy = {
  tasks: (ascend: boolean) => LoopTask[];
};

export let chosenStrategy: Strategy = {
  tasks: () => {
    throw "A strategy has not been chosen";
  },
};

export function chooseStrategy(): void {
  switch (args.major.strategy) {
    case "auto":
      visitUrl("town.php");
      if (get("timeTowerAvailable")) chosenStrategy = chrono();
      else if (isHalloween()) chosenStrategy = freecandy();
      else chosenStrategy = garbo();
      break;
    case "garbo":
      chosenStrategy = garbo();
      break;
    case "freecandy":
      chosenStrategy = freecandy();
      break;
    case "chrono":
      chosenStrategy = chrono();
      break;
    case "crimbo":
      chosenStrategy = crimbo();
      break;
    default:
      throw `Unknown strategy name ${args.major.strategy}`;
  }
}
