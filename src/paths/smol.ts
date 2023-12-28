import { CombatStrategy, step } from "grimoire-kolmafia";
import {
  buy,
  cliExecute,
  inebrietyLimit,
  myAscensions,
  myFullness,
  myInebriety,
  myPath,
  retrieveItem,
  runChoice,
  toInt,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $path,
  $skill,
  ascend,
  get,
  getRemainingLiver,
  getRemainingStomach,
  have,
  Lifestyle,
  Macro,
  prepareAscension,
  set,
  uneffect,
} from "libram";
import { args } from "../args";
import { LoopQuest } from "../engine/engine";
// import { chooseStrategy } from "../strategies/strategy";
import { ascendedToday, byAscendingStat } from "../lib";
import { breakStone, pullAll } from "./common";

export function smolQuest(): LoopQuest {
  // const strategy = chooseStrategy();
  return {
    name: "Community Service",
    tasks: [
      {
        name: "Pizza of Legend",
        completed: () => have($item`Pizza of Legend`) || ascendedToday(),
        do: () => retrieveItem($item`Pizza of Legend`),
        limit: { tries: 1 },
      },
      {
        name: "Ascend",
        completed: () => ascendedToday(),
        prepare: () =>
          prepareAscension({
            garden: "packet of tall grass seeds",
            eudora: "Our Daily Candles™ order form",
            chateau: {
              desk: "continental juice bar",
              ceiling: "ceiling fan",
              nightstand: byAscendingStat({
                Muscle: "electric muscle stimulator",
                Mysticality: "foreign language tapes",
                Moxie: "bowl of potpourri",
              }),
            },
          }),
        do: (): void => {
          ascend({
            path: $path`A Shrunken Adventurer am I`,
            playerClass: args.major.class,
            lifestyle: Lifestyle.softcore,
            moon: "knoll",
            consumable: $item`astral six-pack`,
            pet: $item`astral mask`,
          });
          if (visitUrl("main.php").includes("dense, trackless jungle")) runChoice(-1);
        },
        limit: { tries: 1 },
      },
      breakStone(),
      {
        name: "Run",
        completed: () => step("questL13Final") > 11,
        do: () => cliExecute("loopsmol"),
        limit: { tries: 1 },
        tracking: "Run",
      },
      {
        name: "Prism",
        completed: () => myPath() !== $path`A Shrunken Adventurer am I`,
        do: () => visitUrl("place.php?whichplace=nstower&action=ns_11_prism"),
        limit: { tries: 1 },
      },
      pullAll(),
      {
        name: "Uneat",
        after: ["Ascend", "Prism", "Pull All"],
        completed: () =>
          (getRemainingStomach() >= 0 && getRemainingLiver() >= 0) ||
          myInebriety() > inebrietyLimit() + 5,
        do: (): void => {
          if (myFullness() >= 3 && myInebriety() >= 3 && !get("spiceMelangeUsed")) {
            if (!have($item`spice melange`)) buy($item`spice melange`, 600000);
            use($item`spice melange`);
          }
          if (getRemainingStomach() < 0 && get("_augSkillsCast") < 5 && !get("_aug16Cast")) {
            useSkill($skill`Aug. 16th: Roller Coaster Day!`);
          }
          if (
            getRemainingStomach() < 0 &&
            have($item`distention pill`) &&
            !get("_distentionPillUsed")
          ) {
            use($item`distention pill`);
          }
          if (
            getRemainingLiver() < 0 &&
            have($item`synthetic dog hair pill`) &&
            !get("_syntheticDogHairPillUsed")
          ) {
            use($item`synthetic dog hair pill`);
          }
          if (getRemainingLiver() < 0 && !get("_sobrieTeaUsed")) {
            if (!have($item`cuppa Sobrie tea`)) buy($item`cuppa Sobrie tea`, 100000);
            use($item`cuppa Sobrie tea`);
          }
        },
        limit: { tries: 1 },
      },
      {
        name: "Organ",
        after: ["Ascend", "Prism", "Pull All", "Uneat"],
        completed: () => have($skill`Liver of Steel`),
        do: () => cliExecute("loopcasual goal=organ"),
        limit: { tries: 1 },
      },
      {
        name: "Duplicate",
        after: ["Ascend", "Prism", "Pull All"],
        ready: () => have(args.minor.duplicate),
        completed: () => get("lastDMTDuplication") === myAscensions(),
        prepare: () => set("choiceAdventure1125", `1&iid=${toInt(args.minor.duplicate)}`),
        do: $location`The Deep Machine Tunnels`,
        post: (): void => {
          if (have($effect`Beaten Up`)) uneffect($effect`Beaten Up`);
        },
        choices: { 1119: 4 },
        combat: new CombatStrategy().macro(new Macro().attack().repeat()),
        outfit: { familiar: $familiar`Machine Elf`, modifier: "muscle" },
        limit: { tries: 6 },
      },
    ],
  };
}
