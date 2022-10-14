import { getCurrentLeg, Leg, Quest } from "../engine/task";
import { breakfast, duffo, kingFreed, menagerie, pvp, strategy } from "./common";

export function AftercoreQuest(): Quest {
  return {
    name: "Aftercore",
    completed: () => getCurrentLeg() > Leg.Aftercore,
    tasks: [...kingFreed(), ...breakfast(), ...duffo(), ...menagerie(), ...strategy(true), pvp()],
  };
}
