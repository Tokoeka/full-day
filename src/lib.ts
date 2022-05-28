import {
  cliExecute,
  fileToBuffer,
  fullnessLimit,
  inebrietyLimit,
  Item,
  itemType,
  myFamiliar,
  myFullness,
  myInebriety,
  myName,
  mySpleenUse,
  spleenLimit,
  todayToString,
  use,
} from "kolmafia";
import { $familiar, have } from "libram";

export const globalOptions: {
  confirmTasks: boolean;
  printDetails: boolean;
  noCasual: boolean;
} = {
  confirmTasks: false,
  printDetails: false,
  noCasual: false,
};

export const worksheds = [
  "warbear LP-ROM burner",
  "warbear jackhammer drill press",
  "warbear induction oven",
  "warbear high-efficiency still",
  "warbear chemistry lab",
  "warbear auto-anvil",
  "spinning wheel",
  "snow machine",
  "Little Geneticist DNA-Splicing Lab",
  "portable Mayo Clinic",
  "Asdon Martin keyfob",
  "diabolic pizza cube",
  "cold medicine cabinet",
];

export const gardens = [
  "packet of pumpkin seeds",
  "Peppermint Pip Packet",
  "packet of dragon's teeth",
  "packet of beer seeds",
  "packet of winter seeds",
  "packet of thanksgarden seeds",
  "packet of tall grass seeds",
  "packet of mushroom spores",
];

export function tryUse(item: Item, quantity = 1): boolean {
  return have(item, quantity) && use(quantity, item);
}

export function isStealable(item: Item): boolean {
  return item.tradeable && item.discardable && !item.gift;
}

export function isDMTDuplicable(item: Item): boolean {
  return isStealable(item) && ["food", "booze", "spleen item", "potion"].includes(itemType(item));
}

export function organsFull(): boolean {
  return (
    myFullness() >= fullnessLimit() &&
    myInebriety() > inebrietyLimit() + (myFamiliar() !== $familiar`Stooper` ? 1 : 0) &&
    mySpleenUse() >= spleenLimit()
  );
}

export function canAscendNoncasual(): boolean {
  const sessionLog = fileToBuffer(`${myName()}_${todayToString()}.txt`);
  return !/Ascend as a (?:Normal|Hardcore) .+? banking \d+ Karma./.test(sessionLog);
}

export function canAscendCasual(): boolean {
  const sessionLog = fileToBuffer(`${myName()}_${todayToString()}.txt`);
  return !/Ascend as a Casual .+? banking \d+ Karma./.test(sessionLog);
}

export function ascensionsToday(): number {
  const sessionLog = fileToBuffer(`${myName()}_${todayToString()}.txt`);
  return (sessionLog.match(/Ascend as a .+? banking \d+ Karma./g) || []).length;
}

export function formatNumber(num: number): string {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

export function cliExecuteThrow(command: string): void {
  if (!cliExecute(command)) {
    throw "";
  }
}
