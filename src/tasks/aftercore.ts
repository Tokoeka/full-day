import { getCurrentLeg, Leg, Quest } from "../engine/task";
import { breakfast, duffo, kingFreed, menagerie, pvp } from "./common";
import { Strategy } from "./strategies/strategy";

export function aftercoreQuest(strategy: Strategy): Quest {
  return {
    name: "Aftercore",
    completed: () => getCurrentLeg() > Leg.Aftercore,
    tasks: [
      ...kingFreed(),
      ...breakfast(),
      ...duffo(),
      ...menagerie(),
      ...strategy.tasks(true),
      ...pvp([]),
    ],
  };
}
