import {
  cliExecute,
  fileToBuffer,
  fullnessLimit,
  getPermedSkills,
  inebrietyLimit,
  Item,
  itemType,
  myFamiliar,
  myFullness,
  myInebriety,
  myName,
  mySpleenUse,
  print,
  Skill,
  spleenLimit,
  todayToString,
} from "kolmafia";
import { $familiar, have, Kmail, Lifestyle } from "libram";

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

export function canAscendNoncasual(): boolean {
  const sessionLog = fileToBuffer(`${myName()}_${todayToString()}.txt`);
  return !/Ascend as a (?:Normal|Hardcore) .+? banking \d+ Karma./.test(sessionLog);
}

export function canAscendCasual(): boolean {
  const sessionLog = fileToBuffer(`${myName()}_${todayToString()}.txt`);
  return !/Ascend as a Casual .+? banking \d+ Karma./.test(sessionLog);
}

export function ascensionsToday(): Lifestyle[] {
  const sessionLog = fileToBuffer(`${myName()}_${todayToString()}.txt`);
  const pattern = /Ascend as a (\w+) .+?, banking \d+ Karma./g;
  let match;
  const result = [];
  while ((match = pattern.exec(sessionLog))) {
    const name = match[1].toLowerCase();
    result.push(Lifestyle[name as keyof typeof Lifestyle]);
  }
  return result;
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
        .filter(
          (skill) => have(skill) && skill.permable && getPermedSkills()[skill.name] === undefined
        )
        .map((skill) => [skill, Lifestyle.hardcore])
    ),
    neverAbort: false,
  };
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

export function cliExecuteThrow(command: string): void {
  if (!cliExecute(command)) throw `Failed to execute ${command}`;
}
