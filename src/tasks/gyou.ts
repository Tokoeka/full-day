import { CombatStrategy, step } from "grimoire-kolmafia";
import {
  autosell,
  buy,
  buyUsingStorage,
  cliExecute,
  descToItem,
  getFuel,
  getWorkshed,
  Item,
  itemAmount,
  myAdventures,
  myClass,
  myLevel,
  myMaxhp,
  myPath,
  restoreHp,
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
  $items,
  $location,
  $monster,
  $path,
  $skill,
  ascend,
  AsdonMartin,
  get,
  getKramcoWandererChance,
  getModifier,
  have,
  Lifestyle,
  Macro,
  Pantogram,
  prepareAscension,
  RetroCape,
  SongBoom,
} from "libram";
import { ascendedToday, Quest, Task } from "./structure";
import { cliExecuteThrow, createPermOptions } from "../lib";
import { breakfast, breakStone, duffo, endOfDay, pullAll } from "./common";
import { chooseStrategy } from "./strategies/strategy";

function itemsPulled(): Item[] {
  return get("_roninStoragePulls")
    .split(",")
    .map((itemIdString) => Item.get(Number(itemIdString)));
}

function createPulls(items: Item[]): Task {
  return {
    name: "Pulls",
    completed: () => items.every((item) => itemsPulled().includes(item) || have(item)),
    do: () =>
      items
        .filter((item) => !itemsPulled().includes(item) && !have(item))
        .forEach((item) => cliExecute(`pull ${item}`)),
    limit: { tries: 1 },
  };
}

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
];

export function gyouQuest(): Quest {
  const strategy = chooseStrategy();
  return {
    name: "Grey You",
    tasks: [
      {
        name: "Ascend",
        completed: () => ascendedToday(),
        do: (): void => {
          prepareAscension({
            eudora: "Our Daily Candles™ order form",
          });
          visitUrl("council.php"); // Collect thwaitgold
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
      ...(strategy.gyou ? [createPulls(strategy.gyou.pulls)] : gear),
      breakStone(),
      {
        name: "Run",
        ready: () => myPath() === $path`Grey You`,
        completed: () => step("questL13Final") > 11,
        do: () => cliExecute("loopgyou tune=wombat"),
        limit: { tries: 1 },
        tracking: "Run",
      },
      strategy.gyou
        ? {
            name: "In-Run Farm",
            completed: () => myAdventures() <= 40 || myClass() !== $class`Grey Goo`,
            limit: { tries: 1 },
            tracking: "GooFarming",
            ...strategy.gyou.ronin,
          }
        : {
            name: "In-Run Barf",
            completed: () => myAdventures() <= 40 || myClass() !== $class`Grey Goo`,
            do: $location`Barf Mountain`,
            acquire: [{ item: $item`wad of used tape` }],
            prepare: (): void => {
              restoreMp(30);
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
              return {
                back: $item`unwrapped knock-off retro superhero cape`,
                weapon: $item`astral pistol`,
                offhand:
                  getKramcoWandererChance() > 0.05
                    ? $item`Kramco Sausage-o-Matic™`
                    : $item`latte lovers member's mug`,
                acc1: $item`lucky gold ring`,
                acc2: $item`mafia thumb ring`,
                familiar: $familiar`Space Jellyfish`,
                modifier: "meat",
              };
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
      {
        name: "Prism",
        completed: () => myClass() !== $class`Grey Goo`,
        do: () => cliExecute("loopgyou class=1"),
        limit: { tries: 1 },
      },
      pullAll(),
      {
        name: "Fight Glitch",
        ready: () => have($item`[glitch season reward name]`),
        completed: () => get("_glitchMonsterFights") > 0,
        acquire: [
          { item: $item`makeshift garbage shirt` },
          ...$items`gas can, gas balloon, shard of double-ice`.map((item) => ({
            item,
            price: 1000,
          })),
        ],
        prepare: () => restoreHp(myMaxhp()),
        do: () => visitUrl("inv_eat.php?pwd&whichitem=10207"),
        outfit: () => ({
          familiar: $familiar`Shorter-Order Cook`,
          ...(have($item`January's Garbage Tote`) && have($skill`Torso Awareness`)
            ? { shirt: $item`makeshift garbage shirt` }
            : {}),
          modifier: "muscle experience, 5 muscle experience percent, -ml",
          avoid: Item.all().filter((item) => getModifier("Monster Level", item) < 0),
        }),
        combat: new CombatStrategy().macro(() =>
          Macro.tryItem($item`gas balloon`)
            .trySkill($skill`Feel Pride`)
            .tryItem(...$items`shard of double-ice, gas can`)
            .attack()
            .repeat()
        ),
        limit: { tries: 1 },
      },
      ...duffo([]),
      {
        name: "Workshed",
        completed: () => get("_workshedItemUsed") || getWorkshed() === $item`cold medicine cabinet`,
        do: () => use($item`cold medicine cabinet`),
        limit: { tries: 1 },
      },
      {
        name: "Level",
        completed: () => myClass() !== $class`Grey Goo` && myLevel() >= 14,
        do: () => cliExecute("loopcasual goal=level levelto=14"),
        limit: { tries: 1 },
      },
      ...breakfast([]),
      {
        name: "Steel Organ",
        completed: () => have($skill`Liver of Steel`),
        do: () => cliExecuteThrow("loopcasual goal=organ"),
        limit: { tries: 1 },
      },
      ...strategy.tasks(false),
      ...endOfDay([]),
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
