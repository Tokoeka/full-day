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

export function kingFreed(): Task[] {
  return [
    {
      name: "Pull All",
      completed: () => Object.keys(getStorage()).length === 0 && myStorageMeat() === 0,
      do: () => {
        cliExecute("pull all");
        cliExecute("refresh all");
      },
      limit: { tries: 1 },
    },
    {
      name: "Closet Meat",
      completed: () => myMeat() <= args.maxmeat || myClosetMeat() > 0,
      do: () => cliExecute(`closet put ${myMeat() - args.maxmeat} meat`),
      limit: { tries: 1 },
    },
    {
      name: "Smash Stone",
      completed: () => hippyStoneBroken(),
      do: () => visitUrl("peevpee.php?action=smashstone&confirm=on"),
      limit: { tries: 1 },
    },
    {
      name: "Pledge Allegiance",
      completed: () => !visitUrl("peevpee.php?place=fight").includes("Pledge allegiance to"),
      do: () => visitUrl("peevpee.php?action=pledge&place=fight&pwd"),
      limit: { tries: 1 },
    },
    {
      name: "Enable Reverser",
      completed: () => get("backupCameraReverserEnabled"),
      do: () => cliExecute("backupcamera reverser on"),
      limit: { tries: 1 },
    },
    {
      name: "Rain-Doh",
      completed: () => !have($item`can of Rain-Doh`),
      do: () => use($item`can of Rain-Doh`),
      limit: { tries: 1 },
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
      limit: { tries: 1 },
    },
    {
      name: "Tune Moon",
      completed: () => mySign() === args.spoonsign || get("moonTuned"),
      do: () => cliExecute(`spoon ${args.spoonsign}`),
      limit: { tries: 1 },
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
      limit: { tries: 1 },
    },
  ];
}
