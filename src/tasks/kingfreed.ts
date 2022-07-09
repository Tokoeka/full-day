import {
  cliExecute,
  getStorage,
  handlingChoice,
  hippyStoneBroken,
  itemAmount,
  lastChoice,
  myAscensions,
  myMeat,
  toInt,
  use,
  visitUrl,
} from "kolmafia";
import { $familiar, $item, $items, get, have } from "libram";
import { isDMTDuplicable, tryUse } from "../lib";
import { Task } from "fizzlib";
import { DUPLICATE_ITEM, MAX_MEAT } from "./config";

export const kingFreedTasks: Task[] = [
  {
    name: "Empty Storage",
    completed: () => Object.keys(getStorage()).length === 0,
    do: () => cliExecute("pull all"),
    freeaction: true,
    noadventures: true,
  },
  {
    name: "Closet Meat",
    completed: () => myMeat() <= MAX_MEAT,
    do: () => cliExecute(`closet put ${myMeat() - MAX_MEAT} meat`),
    freeaction: true,
    noadventures: true,
    limit: Infinity,
  },
  {
    name: "Smash Stone",
    completed: () => hippyStoneBroken(),
    do: () => visitUrl("peevpee.php?action=smashstone&confirm=on"),
    freeaction: true,
    noadventures: true,
  },
  {
    name: "Enable Reverser",
    completed: () => get("backupCameraReverserEnabled"),
    do: () => cliExecute("backupcamera reverser on"),
    freeaction: true,
    noadventures: true,
  },
  {
    name: "Open Rain-Doh",
    completed: () => !have($item`can of Rain-Doh`),
    do: () => use($item`can of Rain-Doh`),
    freeaction: true,
    noadventures: true,
  },
  {
    name: "Astral Consumable",
    completed: () =>
      $items`astral hot dog dinner, astral six-pack, [10882]carton of astral energy drinks`.every(
        (item) => !have(item)
      ),
    do: () =>
      $items`astral hot dog dinner, astral six-pack, [10882]carton of astral energy drinks`.forEach(
        (item) => tryUse(item)
      ),
    freeaction: true,
    noadventures: true,
  },
  {
    name: "DMT Duplicate",
    ready: () => itemAmount(DUPLICATE_ITEM) > 0 && get("encountersUntilDMTChoice") < 1,
    prepare: (): void => {
      if (!isDMTDuplicable(DUPLICATE_ITEM)) throw `Cannot duplicate ${DUPLICATE_ITEM} in the DMT`;
    },
    completed: () => get("lastDMTDuplication") >= myAscensions(),
    do: (): void => {
      visitUrl("adventure.php?snarfblat=458");
      if (handlingChoice() && lastChoice() === 1119) {
        visitUrl("choice.php?pwd&whichchoice=1119&option=4");
        visitUrl(`choice.php?whichchoice=1125&pwd&option=1&iid=${toInt(DUPLICATE_ITEM)}`);
      }
    },
    outfit: { familiar: $familiar`Machine Elf` },
    freeaction: true,
  },
];
