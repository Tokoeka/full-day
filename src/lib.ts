import {
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
} = {
  confirmTasks: false,
};

export function tryUse(item: Item, quantity = 1): boolean {
  return have(item, quantity) && use(quantity, item);
}

export function isStealable(item: Item): boolean {
  return item.tradeable && item.discardable && !item.gift;
}

export function isDMTDuplicable(item: Item): boolean {
  return isStealable(item) && ["food", "booze", "spleen item", "potion"].includes(itemType(item));
}

// function getDisplay(): { [item: string]: number } {
//   const mapValue: { [item: string]: number } = {};
//   const pattern = /<td valign=center><b>(.+?)<\/b>(?: \(([\d,]+)\))?<\/td>/g;
//   const page = visitUrl(`displaycollection.php?who=${myId()}`);
//   let result;
//   while ((result = pattern.exec(page))) {
//     const name = result[1];
//     const amount = parseInt(result[2].replace(/,/g, ""));
//     mapValue[name] = amount;
//   }
//   return mapValue;
// }

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
