import { ascendedToday, Quest } from "./structure";
import { breakfast, duffo, endOfDay, pvp } from "./common";
import { chooseStrategy } from "./strategies/strategy";

export function aftercoreQuest(ascend: boolean): Quest {
  const strategyTasks = chooseStrategy().tasks(ascend);
  return {
    name: "Aftercore",
    completed: () => ascendedToday(),
    tasks: [
      ...breakfast([]),
      ...duffo([]),
      // ...menagerie(),
      ...strategyTasks,
      ...(ascend ? pvp([]) : endOfDay([])),
    ],
  };
}
