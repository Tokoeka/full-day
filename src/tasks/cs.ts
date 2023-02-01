import { cliExecute, getStorage, getWorkshed, myPath, myStorageMeat, use } from "kolmafia";
import {
  $class,
  $effect,
  $item,
  $path,
  ascend,
  AsdonMartin,
  get,
  have,
  Lifestyle,
  prepareAscension,
  uneffect,
} from "libram";
import { ascended, Quest } from "./structure";
import { createPermOptions } from "../lib";
import { breakfast, breakStone, duffo, endOfDay } from "./common";
import { chooseStrategy } from "./strategies/strategy";

export const csQuestName = "Community Service";

export function csQuest(): Quest {
  const strategy = chooseStrategy();
  return {
    name: csQuestName,
    tasks: [
      {
        name: "Ascend",
        completed: () => ascended(),
        do: (): void => {
          prepareAscension({
            garden: "Peppermint Pip Packet",
            eudora: "Our Daily Candles™ order form",
            chateau: {
              desk: "continental juice bar",
              nightstand: "foreign language tapes",
              ceiling: "ceiling fan",
            },
          });
          ascend(
            $path`Community Service`,
            $class`Pastamancer`,
            Lifestyle.softcore,
            "knoll",
            $item`astral six-pack`,
            $item`astral chapeau`,
            createPermOptions()
          );
        },
        limit: { tries: 1 },
      },
      breakStone(),
      {
        name: "Run",
        ready: () => myPath() === $path`Community Service`,
        completed: () => get("kingLiberated"),
        do: () => cliExecute("loopcs"),
        limit: { tries: 1 },
        tracking: "Run",
      },
      {
        name: "Pull All",
        completed: () => Object.keys(getStorage()).length === 0 && myStorageMeat() === 0,
        do: () => cliExecute("pull all"),
        post: () => cliExecute("refresh all"),
        limit: { tries: 1 },
      },
      {
        name: "Uneffect Lost",
        completed: () => !have($effect`Feeling Lost`),
        do: () => uneffect($effect`Feeling Lost`),
        limit: { tries: 1 },
      },
      {
        name: "Workshed",
        completed: () => get("_workshedItemUsed") || getWorkshed() === $item`cold medicine cabinet`,
        do: (): void => {
          AsdonMartin.drive($effect`Driving Observantly`, 1000);
          use($item`cold medicine cabinet`);
        },
        limit: { tries: 1 },
      },
      ...breakfast([]),
      ...duffo([]),
      ...strategy.tasks(false),
      ...endOfDay([]),
    ],
  };
}
