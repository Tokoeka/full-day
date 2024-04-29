import { batfellow, breakfast, duffo, pullAll, pvp } from "./common";
import { ascendedToday } from "../lib";
import { LoopQuest } from "../engine/engine";
import { getStrategy } from "../strategies/strategy";

export function aftercoreQuest(): LoopQuest {
  return {
    name: "Aftercore",
    completed: () => ascendedToday(),
    tasks: [
      pullAll(),
      ...breakfast(),
      ...duffo(),
      ...batfellow(),
      ...getStrategy().tasks(true),
      ...pvp(),
    ],
  };
}
