import {
  fileToBuffer,
  fullnessLimit,
  getPermedSkills,
  inebrietyLimit,
  Item,
  itemType,
  myAdventures,
  myFullness,
  myInebriety,
  myName,
  mySpleenUse,
  Skill,
  spleenLimit,
  todayToString,
} from "kolmafia";
import { have, Lifestyle } from "libram";

export function isStealable(item: Item): boolean {
  return item.tradeable && item.discardable && !item.gift;
}

export function isDMTDuplicable(item: Item): boolean {
  return isStealable(item) && ["food", "booze", "spleen item", "potion"].includes(itemType(item));
}

export function shouldOverdrink(): boolean {
  return (
    myFullness() >= fullnessLimit() &&
    myInebriety() === inebrietyLimit() &&
    mySpleenUse() >= spleenLimit() &&
    myAdventures() === 0
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

export function numberWithCommas(x: number): string {
  const str = x.toString();
  if (str.includes(".")) return x.toFixed(2);
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// From phccs
export function convertMilliseconds(milliseconds: number): string {
  const seconds = milliseconds / 1000;
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = Math.round((seconds - minutes * 60) * 1000) / 1000;
  const hours = Math.floor(minutes / 60);
  const minutesLeft = Math.round(minutes - hours * 60);
  return (
    (hours !== 0 ? `${hours} hours, ` : "") +
    (minutesLeft !== 0 ? `${minutesLeft} minutes, ` : "") +
    (secondsLeft !== 0 ? `${secondsLeft} seconds` : "")
  );
}

export function getSkillsToPerm(): Map<Skill, Lifestyle> {
  return new Map(
    Skill.all()
      .filter(
        (skill) => have(skill) && skill.permable && getPermedSkills()[skill.name] === undefined
      )
      .map((skill) => [skill, Lifestyle.hardcore])
  );
}
