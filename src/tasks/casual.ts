import { ascended, Quest } from "./structure";
import { cliExecute, getWorkshed, myAdventures, myPath, use } from "kolmafia";
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
import { createPermOptions } from "../lib";
import { breakfast, breakStone, duffo, endOfDay, menagerie } from "./common";
import { chooseStrategy } from "./strategies/strategy";

export const casualQuestName = "Casual";

export function casualQuest(): Quest {
  const strategy = chooseStrategy();
  return {
    name: casualQuestName,
    tasks: [
      {
        name: "Ascend",
        completed: () => ascended(),
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
      breakStone(),
      ...duffo([]),
      {
        name: "Run",
        ready: () => myPath() === $path`none`,
        completed: () => get("kingLiberated") && have($skill`Liver of Steel`),
        do: (): void => {
          cliExecute("loopcasual fluffers=false stomach=15 workshed='Asdon Martin keyfob'");
          if (myAdventures() === 0 && !have($skill`Liver of Steel`)) {
            cliExecute("cast 2 ancestral recall");
            cliExecute("loopcasual fluffers=false stomach=15");
          }
        },
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
      ...breakfast([]),
      ...menagerie([]),
      ...strategy.tasks(false),
      ...endOfDay([]),
    ],
  };
}
