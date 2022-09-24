import { getCurrentLeg, Leg, Quest } from "../engine/task";
import { breakfast, duffo, garboAscend, menagerie } from "./common";

export const AftercoreQuest: Quest = {
  name: "Aftercore",
  completed: () => getCurrentLeg() > Leg.Aftercore,
  tasks: [...breakfast(), ...duffo(), ...menagerie(), ...garboAscend()],
};
