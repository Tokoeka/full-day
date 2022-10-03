import { getCurrentLeg, Leg, Quest } from "../engine/task";
import { breakfast, duffo, garboAscend, kingFreed, menagerie } from "./common";

export const AftercoreQuest: Quest = {
  name: "Aftercore",
  completed: () => getCurrentLeg() > Leg.Aftercore,
  tasks: [...kingFreed(), ...breakfast(), ...duffo(), ...menagerie(), ...garboAscend()],
};
