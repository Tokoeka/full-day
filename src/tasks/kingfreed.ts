import {
  cliExecute,
  getStorage,
  handlingChoice,
  hippyStoneBroken,
  itemAmount,
  lastChoice,
  myAscensions,
  myClosetMeat,
  myMeat,
  mySign,
  myStorageMeat,
  toInt,
  use,
  visitUrl,
} from "kolmafia";
import { $familiar, $item, $items, get, have } from "libram";
import { isDMTDuplicable, tryUse } from "../lib";
import { Task } from "grimoire-kolmafia";
import { args } from "../main";

const MAX_MEAT = 2_000_000;
const SPOON_SIGN = "Platypus";

export function kingFreed(): Task[] {
  return [
    {
      name: "Pull All",
      completed: () => Object.keys(getStorage()).length === 0 && myStorageMeat() === 0,
      do: () => {
        cliExecute("pull all");
        cliExecute("refresh all");
      },
    },
    {
      name: "Closet Meat",
      completed: () => myMeat() <= MAX_MEAT || myClosetMeat() > 0,
      do: () => cliExecute(`closet put ${myMeat() - MAX_MEAT} meat`),
    },
    {
      name: "Smash Stone",
      completed: () => hippyStoneBroken(),
      do: () => visitUrl("peevpee.php?action=smashstone&confirm=on"),
    },
    {
      name: "Pledge Allegiance",
      completed: () => !visitUrl("peevpee.php?place=fight").includes("Pledge allegiance to"),
      do: () => visitUrl("peevpee.php?action=pledge&place=fight&pwd"),
    },
    {
      name: "Enable Reverser",
      completed: () => get("backupCameraReverserEnabled"),
      do: () => cliExecute("backupcamera reverser on"),
    },
    {
      name: "Rain-Doh",
      completed: () => !have($item`can of Rain-Doh`),
      do: () => use($item`can of Rain-Doh`),
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
    },
    {
      name: "Tune Moon",
      completed: () => mySign().toLowerCase() === SPOON_SIGN.toLowerCase() || get("moonTuned"),
      do: () => cliExecute(`spoon ${SPOON_SIGN}`),
    },
    {
      name: "Duplicate",
      ready: () => itemAmount(args.duplicate) > 0 && get("encountersUntilDMTChoice") < 1,
      prepare: (): void => {
        if (!isDMTDuplicable(args.duplicate)) throw `Cannot duplicate ${args.duplicate} in the DMT`;
      },
      completed: () => get("lastDMTDuplication") >= myAscensions(),
      do: (): void => {
        visitUrl("adventure.php?snarfblat=458");
        if (handlingChoice() && lastChoice() === 1119) {
          visitUrl("choice.php?pwd&whichchoice=1119&option=4");
          visitUrl(`choice.php?whichchoice=1125&pwd&option=1&iid=${toInt(args.duplicate)}`);
        }
      },
      outfit: { familiar: $familiar`Machine Elf` },
    },
  ];
}
