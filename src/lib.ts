import {
  Class,
  cliExecute,
  fullnessLimit,
  getPermedSkills,
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
  Stat,
  StatType,
  takeCloset,
  visitUrl,
} from "kolmafia";
import { $familiar, $stat, have, Kmail, Lifestyle } from "libram";

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
  return {
    permSkills: new Map(
      Skill.all()
        .filter((skill) => have(skill) && skill.permable && !getPermedSkills()[skill.name])
        .map((skill) => [skill, Lifestyle.hardcore])
    ),
    neverAbort: false,
  };
}

export function cliExecuteThrow(command: string): void {
  if (!cliExecute(command)) throw `Failed to execute ${command}`;
}

export function cleanInbox(): void {
  Kmail.delete(
    Kmail.inbox().filter((k) =>
      ["Lady Spookyraven's Ghost", "The Loathing Postal Service", "CheeseFax"].includes(
        k.senderName
      )
    )
  );
}

type StatSwitch<T> = Record<StatType, T> | (Partial<{ [x in StatType]: T }> & { default: T });
type ClassSwitch<T> = { options: Map<Class, T>; default: T };
export function byClass<T>(thing: ClassSwitch<T>, class_: Class): T {
  return thing.options.get(class_) ?? thing.default;
}
export function byStat<T>(thing: StatSwitch<T>, primestat: Stat): T {
  const stat = primestat.toString();
  return "default" in thing ? thing[stat] ?? thing.default : thing[stat];
}

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

export function mostRecentPath(): Path | null {
  const page = visitUrl("ascensionhistory.php?back=self&who=2460823");
  const pattern = /.+"([\w ]+)"><\/td><\/tr>/;
  const match = pattern.exec(page);
  return match !== null ? Path.get(match[1]) : null;
}
