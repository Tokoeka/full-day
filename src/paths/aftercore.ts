import { batfellow, breakfast, duffo, endOfDay, pullAll, pvp } from "./common";
import { chooseStrategy } from "../strategies/strategy";
import { ascendedToday } from "../lib";
import { LoopQuest } from "../engine/engine";

export function aftercoreQuest(ascend: boolean): LoopQuest {
  const strategyTasks = chooseStrategy().tasks(ascend);
  return {
    name: "Aftercore",
    completed: () => ascendedToday(),
    tasks: [
      pullAll(),
      ...breakfast(),
      ...duffo(),
      ...batfellow(),
      ...strategyTasks,
      ...(ascend ? pvp() : endOfDay()),
    ],
  };
}
