import { getCurrentLeg, Leg, Quest } from "../engine/task";
import { breakfast, duffo, kingFreed, menagerie, pvp } from "./common";
import { strategyTasks } from "./strategies/strategy";

export function aftercoreQuest(): Quest {
  return {
    name: "Aftercore",
    completed: () => getCurrentLeg() > Leg.Aftercore,
    tasks: [
      ...kingFreed(),
      ...breakfast(),
      ...duffo(),
      ...menagerie(),
      ...strategyTasks(true),
      ...pvp([]),
    ],
  };
}
