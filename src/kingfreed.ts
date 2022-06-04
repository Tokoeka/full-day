import {
  adv1,
  cliExecute,
  handlingChoice,
  Item,
  itemAmount,
  lastChoice,
  myAdventures,
  myAscensions,
  myMeat,
  toInt,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $skill,
  ensureEffect,
  get,
  have,
  Macro,
  Requirement,
  set,
  uneffect,
} from "libram";
import { isDMTDuplicable, tryUse } from "./lib";

function duplicateInDMT(item: Item): void {
  if (get("lastDMTDuplication") >= myAscensions()) return;
  if (!isDMTDuplicable(item)) throw `Cannot duplicate ${item} in the DMT choice adventure`;
  if (itemAmount(item) < 1) throw `Missing one ${item} in inventory`;
  if (get("encountersUntilDMTChoice") > 0) throw "DMT choice adventure is not ready.";
  if (myAdventures() < 1) throw "Ran out of adventures.";

  useFamiliar($familiar`Machine Elf`);
  visitUrl("adventure.php?snarfblat=458");
  if (!handlingChoice() || lastChoice() !== 1119)
    throw new Error(`Failed to encounter DMT choice adventure`);
  visitUrl("choice.php?pwd&whichchoice=1119&option=4");
  visitUrl(`choice.php?whichchoice=1125&pwd&option=1&iid=${toInt(item)}`);
}

function getDoghouseVolcoino(): void {
  while ($location`The Bubblin' Caldera`.turnsSpent < 6) {
    if ($location`The Bubblin' Caldera`.noncombatQueue.includes("Lava Dogs")) break;
    if (myAdventures() < 1) throw "Ran out of adventures.";
    adv1($location`The Bubblin' Caldera`, -1, Macro.attack().repeat().toString());
    if (have($effect`Beaten Up`)) throw "Fight was lost; stop.";
  }
  set("lastDoghouseVolcoino", myAscensions());
}

export function kingFreed(): void {
  cliExecute("pull all");
  cliExecute("peevpee.php?action=smashstone&confirm=on");
  cliExecute("backupcamera reverser on");
  cliExecute(`closet put ${Math.max(0, myMeat() - 2000000)} meat`);
  uneffect($effect`Feeling Lost`);
  tryUse($item`can of Rain-Doh`);
  tryUse($item`astral six-pack`);
  ensureEffect($effect`A Few Extra Pounds`);
  new Requirement(["mainstat"], {
    forceEquip: $items`Fourth of May Cosplay Saber, Mr. Screege's spectacles, mafia thumb ring, lucky gold ring`,
  }).maximize();
  useSkill($skill`Cannelloni Cocoon`);
  duplicateInDMT($item`very fancy whiskey`);
  getDoghouseVolcoino();
}
