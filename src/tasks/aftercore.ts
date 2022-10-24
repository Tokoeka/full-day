import { getCurrentLeg, Leg, Quest } from "../engine/task";
import { breakfast, duffo, kingFreed, menagerie, pvp } from "./common";
import { farmUsingStrategy } from "./strategy";

export function AftercoreQuest(): Quest {
  return {
    name: "Aftercore",
    completed: () => getCurrentLeg() > Leg.Aftercore,
    tasks: [
      ...kingFreed(),
      ...breakfast(),
      ...duffo(),
      ...menagerie(),
      ...farmUsingStrategy(true),
      ...pvp([]),
    ],
  };
}
