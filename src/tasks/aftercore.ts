import { getCurrentLeg, Leg, Quest } from "../engine/task";
import { breakfast, duffo, garboAscend } from "./common";

export const AftercoreQuest: Quest = {
  name: "Aftercore",
  completed: () => getCurrentLeg() > Leg.Aftercore,
  tasks: [...breakfast(), duffo(), ...garboAscend()],
};
