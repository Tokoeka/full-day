import { Quest } from "../engine/task";
import { cliExecute, getWorkshed, myPath, use } from "kolmafia";
import {
  $class,
  $effect,
  $item,
  $path,
  $skill,
  ascend,
  AsdonMartin,
  get,
  have,
  Lifestyle,
  prepareAscension,
} from "libram";
import { canAscendCasual, createPermOptions } from "../lib";
import { breakfast, breakStone, duffo, endOfDay, kingFreed, menagerie } from "./common";
import { chooseStrategy } from "./strategies/strategy";

export function casualQuest(): Quest {
  const strategy = chooseStrategy();
  return {
    name: "Casual",
    tasks: [
      {
        name: "Ascend",
        completed: () => !canAscendCasual(),
        do: (): void => {
          prepareAscension({
            garden: "packet of thanksgarden seeds",
            eudora: "New-You Club Membership Form",
            chateau: {
              desk: "Swiss piggy bank",
              nightstand: "electric muscle stimulator",
              ceiling: "ceiling fan",
            },
          });
          ascend(
            $path`none`,
            $class`Seal Clubber`,
            Lifestyle.casual,
            "knoll",
            $item`astral six-pack`,
            $item`astral pet sweater`,
            createPermOptions()
          );
        },
        limit: { tries: 1 },
      },
      ...breakStone(),
      ...duffo(),
      {
        name: "Run",
        ready: () => myPath() === $path`none`,
        completed: () => get("kingLiberated") && have($skill`Liver of Steel`),
        do: () => cliExecute("loopcasual"),
        limit: { tries: 1 },
        tracking: "Run",
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
      ...kingFreed(),
      ...breakfast(),
      ...menagerie(),
      ...strategy.tasks(false),
      ...endOfDay(),
    ],
  };
}
