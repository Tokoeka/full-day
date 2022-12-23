import { Quest } from "../engine/task";
import {
  cliExecute,
  getWorkshed,
  maximize,
  myPath,
  numericModifier,
  retrieveItem,
  retrievePrice,
  use,
} from "kolmafia";
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
  haveInCampground,
  Lifestyle,
  prepareAscension,
} from "libram";
import { canAscendCasual, createPermOptions } from "../lib";
import { breakfast, breakStone, duffo, kingFreed, menagerie } from "./common";
import { strategyTasks } from "./strategies/strategy";

export function casualQuest(): Quest {
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
      ...strategyTasks(false),
      {
        name: "Clockwork Maid",
        completed: () =>
          haveInCampground($item`clockwork maid`) ||
          numericModifier($item`clockwork maid`, "Adventures") * get("valueOfAdventure") <
            retrievePrice($item`clockwork maid`),
        do: (): void => {
          retrieveItem($item`clockwork maid`);
          use($item`clockwork maid`);
        },
        limit: { tries: 1 },
      },
      {
        name: "Raffle",
        completed: () => have($item`raffle ticket`),
        do: () => cliExecute(`raffle ${Math.random() * 10 + 1}`),
        limit: { tries: 1 },
      },
      {
        name: "Pajamas",
        completed: () =>
          maximize("adv, switch tot, switch left-hand man, switch disembodied hand", true) &&
          numericModifier("Generated:_spec", "Adventures") <= numericModifier("Adventures"),
        do: () => maximize("adv, switch tot, switch left-hand man, switch disembodied hand", false),
        limit: { tries: 1 },
      },
    ],
  };
}
