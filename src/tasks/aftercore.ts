import { ascended, Quest } from "./structure";
import { breakfast, duffo, kingFreed, pvp } from "./common";
import { chooseStrategy } from "./strategies/strategy";

export function aftercoreQuest(): Quest {
  const strategy = chooseStrategy();
  return {
    name: "Aftercore",
    completed: ascended,
    tasks: [
      ...kingFreed(),
      ...breakfast(),
      ...duffo(),
      // ...menagerie(),
      ...strategy.tasks(true),
      ...pvp([]),
    ],
  };
}
