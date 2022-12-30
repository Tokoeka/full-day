import { CombatStrategy, Outfit, step } from "grimoire-kolmafia";
import {
  autosell,
  buy,
  buyUsingStorage,
  cliExecute,
  descToItem,
  Familiar,
  getFuel,
  getWorkshed,
  Item,
  itemAmount,
  myAdventures,
  myClass,
  myLevel,
  myPath,
  myTurncount,
  restoreMp,
  runChoice,
  storageAmount,
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
  $monster,
  $path,
  $skill,
  $slot,
  ascend,
  AsdonMartin,
  get,
  getKramcoWandererChance,
  have,
  Lifestyle,
  Macro,
  Pantogram,
  prepareAscension,
  RetroCape,
  SongBoom,
} from "libram";
import { getCurrentLeg, Leg, Quest, Task } from "../engine/task";
import { canAscendNoncasual, createPermOptions } from "../lib";
import { breakfast, breakStone, duffo, kingFreed, pullAll, pvp } from "./common";
import { Strategy } from "./strategies/strategy";

const gear: Task[] = [
  {
    name: "Pants",
    completed: () => have($item`pantogram pants`),
    do: () => {
      if (step("questM05Toot") === -1) visitUrl("council.php");
      if (step("questM05Toot") === 0) visitUrl("tutorial.php?action=toot");
      if (have($item`letter from King Ralph XI`)) use($item`letter from King Ralph XI`);
      if (have($item`pork elf goodies sack`)) use($item`pork elf goodies sack`);
      if (!have($item`porquoise`)) {
        if (storageAmount($item`porquoise`) === 0) buyUsingStorage($item`porquoise`);
        cliExecute("pull 1 porquoise");
      }
      Pantogram.makePants(
        "Muscle",
        "Stench Resistance: 2",
        "Maximum MP: 20",
        "Combat Rate: 5",
        "Meat Drop: 60"
      );
      autosell($item`hamethyst`, itemAmount($item`hamethyst`));
      autosell($item`baconstone`, itemAmount($item`baconstone`));
    },
    limit: { tries: 1 },
  },
  {
    name: "Lucky Gold Ring",
    completed: () => have($item`lucky gold ring`),
    do: () => cliExecute("pull lucky gold ring"),
    limit: { tries: 1 },
  },
  {
    name: "Pointer Finger",
    completed: () => have($item`mafia pointer finger ring`),
    do: () => cliExecute("pull mafia pointer finger ring"),
    limit: { tries: 1 },
  },
  {
    name: "Asdon",
    completed: () =>
      have($item`Asdon Martin keyfob`) ||
      have($item`cold medicine cabinet`) ||
      storageAmount($item`Asdon Martin keyfob`) === 0,
    do: () => cliExecute("pull Asdon Martin keyfob"),
    limit: { tries: 1 },
  },
];

export function createPull(item: Item): Task {
  return {
    name: item.name,
    completed: () => have(item),
    do: () => cliExecute(`pull ${item}`),
    limit: { tries: 1 },
  };
}

export function gyouQuest(strategy: Strategy): Quest {
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
            runChoice(1);
          }
        },
        limit: { tries: 1 },
      },
      ...(strategy.gyou?.pulls.map(createPull) ?? gear),
      ...breakStone(),
      {
        name: "Run",
        ready: () => myPath() === $path`Grey You`,
        completed: () =>
          step("questL13Final") !== -1 && get("gooseReprocessed").split(",").length >= 69,
        do: () => cliExecute("loopgyou delaytower tune=wombat"),
        limit: { tries: 1 },
        tracking: "Run",
      },
      strategy.gyou
        ? {
            name: "In-Run Farm Initial",
            completed: () => myTurncount() >= 1000,
            do: strategy.gyou.ronin,
            limit: { tries: 1 },
            tracking: "GooFarming",
          }
        : {
            name: "In-Run Barf Initial",
            completed: () => myTurncount() >= 1000,
            do: $location`Barf Mountain`,
            acquire: [{ item: $item`wad of used tape` }],
            prepare: (): void => {
              restoreMp(20);
              RetroCape.tuneToSkill($skill`Precision Shot`);
              SongBoom.setSong("Total Eclipse of Your Meat");

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
            outfit: () => {
              const outfit = new Outfit();
              outfit.equip($item`unwrapped knock-off retro superhero cape`, $slot`back`);
              outfit.equip($item`astral pistol`, $slot`weapon`);
              outfit.equip(
                getKramcoWandererChance() > 0.05
                  ? $item`Kramco Sausage-o-Matic™`
                  : $item`latte lovers member's mug`,
                $slot`off-hand`
              );
              outfit.equip([
                $item`lucky gold ring`,
                $item`mafia pointer finger ring`,
                $item`mafia thumb ring`,
              ]);
              outfit.equip($familiar`Space Jellyfish`);
              outfit.modifier = "meat";
              return outfit;
            },
            effects: () => (have($item`How to Avoid Scams`) ? $effects`How to Scam Tourists` : []),
            combat: new CombatStrategy()
              .macro(
                new Macro()
                  .trySkill($skill`Bowl Straight Up`)
                  .skill($skill`Extract Jelly`)
                  .skill($skill`Sing Along`)
                  .trySkill($skill`Precision Shot`)
                  .skill($skill`Double Nanovision`)
                  .repeat()
              )
              .macro(
                new Macro()
                  .item($item`Time-Spinner`)
                  .skill($skill`Infinite Loop`)
                  .repeat(),
                $monster`sausage goblin`
              ),
            limit: { tries: 550 },
            tracking: "GooFarming",
          },
      pullAll(),
      {
        name: "Tower",
        completed: () => step("questL13Final") > 11,
        do: () => cliExecute("loopgyou delaytower"),
        limit: { tries: 1 },
        tracking: "Run",
      },
      strategy.gyou
        ? {
            name: "In-Run Farm Final",
            completed: () => myAdventures() <= 40 || myClass() !== $class`Grey Goo`,
            do: strategy.gyou.postronin,
            tracking: "GooFarming",
            limit: { tries: 1 },
          }
        : {
            name: "In-Run Barf Final",
            completed: () => myAdventures() <= 40 || myClass() !== $class`Grey Goo`,
            prepare: (): void => {
              restoreMp(20);

              // Prepare Asdon buff
              if (AsdonMartin.installed() && !have($effect`Driving Observantly`))
                AsdonMartin.drive(AsdonMartin.Driving.Observantly);
            },
            do: $location`Barf Mountain`,
            outfit: () => {
              const outfit = new Outfit();
              outfit.equip($item`haiku katana`, $slot`weapon`);
              outfit.equip(
                getKramcoWandererChance() > 0.05
                  ? $item`Kramco Sausage-o-Matic™`
                  : $item`latte lovers member's mug`,
                $slot`off-hand`
              );
              outfit.equip([$item`lucky gold ring`, $item`mafia pointer finger ring`]);
              outfit.equip($familiar`Space Jellyfish`), (outfit.modifier = "meat");
              return outfit;
            },
            effects: $effects`How to Scam Tourists`,
            combat: new CombatStrategy()
              .macro(
                new Macro()
                  .trySkill($skill`Bowl Straight Up`)
                  .skill($skill`Extract Jelly`)
                  .skill($skill`Sing Along`)
                  .trySkill($skill`Summer Siesta`)
                  .skill($skill`Double Nanovision`)
                  .repeat()
              )
              .macro(
                new Macro()
                  .item($item`Time-Spinner`)
                  .skill($skill`Infinite Loop`)
                  .repeat(),
                $monster`sausage goblin`
              ),
            limit: { tries: 150 },
            tracking: "GooFarming",
          },
      {
        name: "Prism",
        completed: () => myClass() !== $class`Grey Goo`,
        do: () => cliExecute("loopgyou class=1"),
        outfit: { familiar: Familiar.none },
        limit: { tries: 1 },
      },
      ...duffo(),
      {
        name: "Workshed",
        completed: () => get("_workshedItemUsed") || getWorkshed() === $item`Asdon Martin keyfob`,
        do: () => use($item`Asdon Martin keyfob`),
        limit: { tries: 1 },
      },
      {
        name: "Level",
        completed: () => myClass() !== $class`Grey Goo` && myLevel() >= 13,
        do: () => cliExecute("loopcasual goal=level"),
        limit: { tries: 1 },
      },
      ...kingFreed(),
      ...breakfast(),
      ...strategy.tasks(true),
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
