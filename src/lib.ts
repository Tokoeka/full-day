import {
  Class,
  cliExecute,
  fullnessLimit,
  getPermedSkills,
  holiday,
  inebrietyLimit,
  Item,
  itemAmount,
  itemType,
  myClass,
  myDaycount,
  myFamiliar,
  myFullness,
  myInebriety,
  mySpleenUse,
  Path,
  print,
  putCloset,
  Skill,
  spleenLimit,
  takeCloset,
  visitUrl,
} from "kolmafia";
import { $familiar, $stat, have, Lifestyle, makeByXFunction } from "libram";
import { args } from "./args";

export function debug(message: string, color?: string): void {
  if (color) {
    print(message, color);
  } else {
    print(message);
  }
}

export function isStealable(item: Item): boolean {
  return item.tradeable && item.discardable && !item.gift;
}

export function isDMTDuplicable(item: Item): boolean {
  return isStealable(item) && ["food", "booze", "spleen item", "potion"].includes(itemType(item));
}

export function canPickpocket(class_: Class = myClass()): boolean {
  return class_.primestat === $stat`Moxie`;
}

export function canConsume(): boolean {
  return (
    myFullness() < fullnessLimit() ||
    myInebriety() < inebrietyLimit() ||
    mySpleenUse() < spleenLimit()
  );
}

export function stooperInebrietyLimit(): number {
  return inebrietyLimit() + Number(myFamiliar() !== $familiar`Stooper`);
}

export function numberWithCommas(x: number): string {
  const str = x.toString();
  if (str.includes(".")) return x.toFixed(2);
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function createPermOptions(): { permSkills: Map<Skill, Lifestyle>; neverAbort: boolean } {
  const permedSkills = getPermedSkills();
  return {
    permSkills: new Map(
      Skill.all()
        .filter((skill) => have(skill) && skill.permable && !permedSkills[skill.name])
        .map((skill) => [skill, Lifestyle.hardcore])
    ),
    neverAbort: false,
  };
}

export function cliExecuteThrow(command: string): void {
  if (!cliExecute(command)) throw `Failed to execute ${command}`;
}

export const byAscendingStat = makeByXFunction(() => args.major.class.primestat.toString());

export function withCloseted<T>(items: Item[], callback: () => T): T {
  const closetedItems = new Map(items.map((item) => [item, itemAmount(item)]));
  closetedItems.forEach((amount, item) => putCloset(amount, item));
  try {
    return callback();
  } finally {
    closetedItems.forEach((amount, item) => takeCloset(amount, item));
  }
}

export function ascendedToday(): boolean {
  return myDaycount() === 1;
}

export function holidays(): string[] {
  return holiday().split("/");
}

export function isHalloween(): boolean {
  return holidays().includes("Halloween") && !args.minor.skipholiday;
}

export function isAprilFools(): boolean {
  return holidays().includes("April Fool's Day");
}

export function mostRecentPath(): Path | null {
  const page = visitUrl("ascensionhistory.php?back=self&who=2460823");
  const pattern = /.+"([\w ]+)"><\/td><\/tr>/;
  const match = pattern.exec(page);
  return match !== null ? Path.get(match[1]) : null;
}
