import { CombatStrategy, step } from "grimoire-kolmafia";
import {
  buy,
  cliExecute,
  descToItem,
  getFuel,
  getWorkshed,
  itemAmount,
  myAdventures,
  myClass,
  myLevel,
  myPath,
  myTurncount,
  restoreMp,
  runChoice,
  totalTurnsPlayed,
  use,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $effects,
  $familiar,
  $item,
  $location,
  $path,
  $skill,
  ascend,
  AsdonMartin,
  ensureEffect,
  get,
  getKramcoWandererChance,
  have,
  Lifestyle,
  Macro,
  prepareAscension,
  RetroCape,
  SourceTerminal,
} from "libram";
import { getCurrentLeg, Leg, Quest } from "../engine/task";
import { canAscendNoncasual, createPermOptions } from "../lib";
import { breakfast, breakStone, duffo, kingFreed, pullAll, pvp } from "./common";
import { strategyTasks } from "./strategies/strategy";

export function gyouQuest(): Quest {
  return {
    name: "Grey You",
    completed: () => getCurrentLeg() > Leg.NonCasual,
    tasks: [
      {
        name: "Ascend",
        completed: () => !canAscendNoncasual(),
        do: (): void => {
          prepareAscension({
            eudora: "Our Daily Candles™ order form",
          });
          ascend(
            $path`Grey You`,
            $class`Grey Goo`,
            Lifestyle.softcore,
            "vole",
            $item`astral six-pack`,
            $item`astral pistol`,
            createPermOptions()
          );
          if (visitUrl("main.php").includes("somewhat-human-shaped mass of grey goo nanites")) {
            runChoice(-1);
          }
        },
        limit: { tries: 1 },
      },
      ...breakStone(),
      {
        name: "Run",
        ready: () => myPath() === $path`Grey You`,
        completed: () =>
          step("questL13Final") !== -1 && get("gooseReprocessed").split(",").length === 73,
        do: () => cliExecute("loopgyou delaytower tune=wombat"),
        limit: { tries: 1 },
        tracking: "Run",
      },
      {
        name: "In-Run Farm Initial",
        // after: ["Ascend", "Run", ...gear.map((task) => task.name)],
        completed: () => myTurncount() >= 1000,
        do: $location`Barf Mountain`,
        acquire: [{ item: $item`wad of used tape` }],
        prepare: (): void => {
          RetroCape.tuneToSkill($skill`Precision Shot`);

          if (have($item`How to Avoid Scams`)) ensureEffect($effect`How to Scam Tourists`);

          // Use only the first source terminal enhance, save the others for aftercore
          if (get("_sourceTerminalEnhanceUses") === 0) SourceTerminal.enhance($effect`meat.enh`);

          // Prepare latte
          if (
            have($item`latte lovers member's mug`) &&
            !get("latteModifier").includes("Meat Drop: 40") &&
            get("_latteRefillsUsed") < 2
          ) {
            const modifiers = [];
            if (get("latteUnlocks").includes("wing")) modifiers.push("wing");
            if (get("latteUnlocks").includes("cajun")) modifiers.push("cajun");
            modifiers.push("cinnamon", "pumpkin", "vanilla");
            cliExecute(`latte refill ${modifiers.slice(0, 3).join(" ")}`); // Always unlocked
          }

          // Swap to asdon when all extrovermectins are done
          if (
            have($item`Asdon Martin keyfob`) &&
            getWorkshed() === $item`cold medicine cabinet` &&
            get("_coldMedicineConsults") >= 5
          ) {
            use($item`Asdon Martin keyfob`);
          }

          // Prepare Asdon buff
          if (AsdonMartin.installed() && !have($effect`Driving Observantly`)) {
            if (getFuel() < 37 && itemAmount($item`wad of dough`) < 8) {
              // Get more wads of dough. We must do this ourselves since
              // retrieveItem($item`loaf of soda bread`) in libram will not
              // consider all-purpose flower.
              buy($item`all-purpose flower`);
              use($item`all-purpose flower`);
            }
            AsdonMartin.drive(AsdonMartin.Driving.Observantly);
          }
        },
        post: getExtros,
        outfit: {
          back: $item`unwrapped knock-off retro superhero cape`,
          weapon: $item`astral pistol`,
          offhand:
            getKramcoWandererChance() > 0.05
              ? $item`Kramco Sausage-o-Matic™`
              : $item`latte lovers member's mug`,
          acc1: $item`lucky gold ring`,
          acc2: $item`mafia pointer finger ring`,
          acc3: $item`mafia thumb ring`,
          familiar: $familiar`Space Jellyfish`,
          modifier: "meat",
        },
        combat: new CombatStrategy().macro(
          new Macro()
            .trySkill($skill`Bowl Straight Up`)
            .skill($skill`Extract Jelly`)
            .skill($skill`Sing Along`)
            .skill($skill`Precision Shot`)
            .skill($skill`Double Nanovision`)
            .repeat()
        ),
        limit: { tries: 550 },
        tracking: "GooFarming",
      },
      pullAll(),
      {
        name: "Tower",
        // after: ["Ascend", "Pull All", "In-Run Farm Initial"],
        completed: () => step("questL13Final") > 11,
        do: () => cliExecute("loopgyou delaytower"),
        limit: { tries: 1 },
        tracking: "Run",
      },
      {
        name: "In-Run Farm Final",
        // after: ["Ascend", "Tower", ...gear.map((task) => task.name)],
        completed: () => myAdventures() <= 40 || myClass() !== $class`Grey Goo`,
        prepare: (): void => {
          restoreMp(10);

          // Prepare Asdon buff
          if (AsdonMartin.installed() && !have($effect`Driving Observantly`))
            AsdonMartin.drive(AsdonMartin.Driving.Observantly);
        },
        do: $location`Barf Mountain`,
        outfit: {
          modifier: "meat",
          weapon: $item`haiku katana`,
          offhand:
            getKramcoWandererChance() > 0.05
              ? $item`Kramco Sausage-o-Matic™`
              : $item`latte lovers member's mug`,
          acc1: $item`lucky gold ring`,
          acc2: $item`mafia pointer finger ring`,
          familiar: $familiar`Space Jellyfish`,
        },
        effects: $effects`How to Scam Tourists`,
        combat: new CombatStrategy().macro(
          new Macro()
            .trySkill($skill`Bowl Straight Up`)
            .skill($skill`Extract Jelly`)
            .skill($skill`Sing Along`)
            .skill($skill`Summer Siesta`)
            .skill($skill`Double Nanovision`)
            .repeat()
        ),
        limit: { tries: 150 },
        tracking: "GooFarming",
      },
      {
        name: "Prism",
        // after: ["Ascend", "In-Run Farm Final"],
        completed: () => myClass() !== $class`Grey Goo`,
        do: () => cliExecute("loopgyou class=1"),
        limit: { tries: 1 },
      },
      {
        name: "Level",
        // after: ["Ascend", "Prism", "Pull All"],
        completed: () => myClass() !== $class`Grey Goo` && myLevel() >= 13,
        do: () => cliExecute("loopcasual goal=level"),
        limit: { tries: 1 },
      },

      ...kingFreed(),
      ...breakfast(),
      ...duffo(),
      ...strategyTasks(true),
      ...pvp([]),
    ],
  };
}

function getExtros(): void {
  if (getWorkshed() !== $item`cold medicine cabinet`) return;
  if (get("_coldMedicineConsults") >= 5 || get("_nextColdMedicineConsult") > totalTurnsPlayed()) {
    return;
  }
  const options = visitUrl("campground.php?action=workshed");
  let match;
  const regexp = /descitem\((\d+)\)/g;
  while ((match = regexp.exec(options)) !== null) {
    const item = descToItem(match[1]);
    if (item === $item`Extrovermectin™`) {
      visitUrl("campground.php?action=workshed");
      runChoice(5);
      return;
    }
  }
}