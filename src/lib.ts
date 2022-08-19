import {
  fileToBuffer,
  fullnessLimit,
  getPermedSkills,
  inebrietyLimit,
  Item,
  itemType,
  Location,
  Monster,
  myAdventures,
  myFullness,
  myInebriety,
  myName,
  mySpleenUse,
  myTurncount,
  runChoice,
  runCombat,
  Skill,
  spleenLimit,
  todayToString,
  toUrl,
  useSkill,
  visitUrl,
} from "kolmafia";
import { $skill, get, have, Lifestyle } from "libram";

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

export function getSkillsToPerm(): Map<Skill, Lifestyle> {
  return new Map(
    Skill.all()
      .filter(
        (skill) => have(skill) && skill.permable && getPermedSkills()[skill.name] === undefined
      )
      .map((skill) => [skill, Lifestyle.hardcore])
  );
}

export function mapMonster(location: Location, monster: Monster): void {
  useSkill($skill`Map the Monsters`);
  if (!get("mappingMonsters")) {
    throw new Error("Failed to setup Map the Monsters.");
  }
  const turns = myTurncount();
  while (get("mappingMonsters")) {
    if (myTurncount() > turns) {
      throw new Error("Map the Monsters unsuccessful?");
    }
    visitUrl(toUrl(location));
    runChoice(1, `heyscriptswhatsupwinkwink=${monster.id}`);
    runCombat();
  }
}
