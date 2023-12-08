import { cliExecute, myAdventures, myPath, visitUrl } from "kolmafia";
import { $item, $path, $skill, ascend, get, have, Lifestyle, prepareAscension } from "libram";
import { ascendedToday, byAscendingStat, createPermOptions } from "../lib";
import { breakStone, duffo } from "./common";
import { args } from "../args";
import { LoopQuest } from "../engine/engine";

export function casualQuest(): LoopQuest {
  return {
    name: "Casual",
    tasks: [
      {
        name: "Ascend",
        completed: () => ascendedToday(),
        do: (): void => {
          prepareAscension({
            garden: "packet of thanksgarden seeds",
            eudora: "New-You Club Membership Form",
            chateau: {
              desk: "Swiss piggy bank",
              nightstand: byAscendingStat({
                Muscle: "electric muscle stimulator",
                Mysticality: "foreign language tapes",
                Moxie: "bowl of potpourri",
              }),
              ceiling: "ceiling fan",
            },
          });
          visitUrl("council.php"); // Collect thwaitgold
          ascend({
            path: $path`none`,
            playerClass: args.major.class,
            lifestyle: Lifestyle.casual,
            moon: "knoll",
            consumable: $item`astral six-pack`,
            pet: $item`astral pet sweater`,
            permOptions: createPermOptions(),
          });
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
    ],
  };
}
