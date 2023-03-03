import {
  cliExecute,
  equippedItem,
  getStorage,
  getWorkshed,
  Item,
  myPath,
  myStorageMeat,
  retrieveItem,
  use,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $item,
  $path,
  $slot,
  ascend,
  AsdonMartin,
  get,
  have,
  Lifestyle,
  prepareAscension,
  uneffect,
} from "libram";
import { ascendedToday, Quest } from "./structure";
import { byStat, createPermOptions } from "../lib";
import { breakfast, breakStone, duffo, endOfDay } from "./common";
import { chooseStrategy } from "./strategies/strategy";
import { args } from "../args";

export const csQuestName = "Community Service";

function setBootSkin(skin: Item): boolean {
  if (!have($item`your cowboy boots`)) {
    visitUrl("place.php?whichplace=town_right&action=townright_ltt");
  }
  if (equippedItem($slot`bootskin`) === skin) return true;
  return retrieveItem(skin) && use(skin);
}

export function csQuest(): Quest {
  const strategy = chooseStrategy();
  return {
    name: csQuestName,
    tasks: [
      {
        name: "Ascend",
        completed: () => ascendedToday(),
        do: (): void => {
          setBootSkin(
            byStat(
              {
                Muscle: $item`grizzled bearskin`,
                Mysticality: $item`frontwinder skin`,
                Moxie: $item`mountain lion skin`,
              },
              args.major.class.primestat
            )
          );
          prepareAscension({
            garden: "Peppermint Pip Packet",
            eudora: "Our Daily Candles™ order form",
            chateau: {
              desk: "continental juice bar",
              nightstand: byStat(
                {
                  Muscle: "electric muscle stimulator",
                  Mysticality: "foreign language tapes",
                  Moxie: "bowl of potpourri",
                },
                args.major.class.primestat
              ),
              ceiling: "ceiling fan",
            },
          });
          visitUrl("council.php"); // Collect thwaitgold
          ascend(
            $path`Community Service`,
            args.major.class,
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
