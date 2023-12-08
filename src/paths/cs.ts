import { cliExecute, equippedItem, Item, myPath, retrieveItem, use, visitUrl } from "kolmafia";
import {
  $effect,
  $item,
  $path,
  $slot,
  ascend,
  get,
  have,
  Lifestyle,
  prepareAscension,
  uneffect,
} from "libram";
import { ascendedToday, byAscendingStat, createPermOptions } from "../lib";
import { breakStone } from "./common";
import { args } from "../args";
import { LoopQuest } from "../engine/engine";

function setBootSkin(skin: Item): boolean {
  if (!have($item`your cowboy boots`)) {
    visitUrl("place.php?whichplace=town_right&action=townright_ltt");
  }
  if (equippedItem($slot`bootskin`) === skin) return true;
  return retrieveItem(skin) && use(skin);
}

export function csQuest(): LoopQuest {
  return {
    name: "Community Service",
    tasks: [
      {
        name: "Ascend",
        completed: () => ascendedToday(),
        do: (): void => {
          setBootSkin(
            byAscendingStat({
              Muscle: $item`grizzled bearskin`,
              Mysticality: $item`frontwinder skin`,
              Moxie: $item`mountain lion skin`,
            })
          );
          prepareAscension({
            garden: "Peppermint Pip Packet",
            eudora: "Our Daily Candles™ order form",
            chateau: {
              desk: "continental juice bar",
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
            path: $path`Community Service`,
            playerClass: args.major.class,
            lifestyle: Lifestyle.softcore,
            moon: "knoll",
            consumable: $item`astral six-pack`,
            pet: $item`astral chapeau`,
            permOptions: createPermOptions(),
          });
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
        name: "Uneffect Lost",
        completed: () => !have($effect`Feeling Lost`),
        do: () => uneffect($effect`Feeling Lost`),
        limit: { tries: 1 },
      },
    ],
  };
}
