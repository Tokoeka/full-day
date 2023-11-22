import { ascendedToday, Quest } from "./structure";
import { batfellow, breakfast, duffo, endOfDay, pullAll, pvp } from "./common";
import { chooseStrategy } from "../strategies/strategy";

export function aftercoreQuest(ascend: boolean): Quest {
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
