import { CombatStrategy } from "grimoire-kolmafia";
import {
  canAdventure,
  cliExecute,
  familiarWeight,
  getStorage,
  hippyStoneBroken,
  itemAmount,
  myAscensions,
  myClosetMeat,
  myMeat,
  mySign,
  myStorageMeat,
  putCloset,
  pvpAttacksLeft,
  runChoice,
  toInt,
  toUrl,
  use,
  visitUrl,
  wait,
} from "kolmafia";
import {
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  Cartography,
  Clan,
  get,
  have,
  Macro,
  set,
  uneffect,
} from "libram";
import { args } from "../args";
import { Task } from "../engine/task";
import { cliExecuteThrow } from "../lib";

const astralContainers = $items`astral hot dog dinner, astral six-pack, [10882]carton of astral energy drinks`;

export function pullAll(): Task {
  return {
    name: "Pull All",
    completed: () => Object.keys(getStorage()).length === 0 && myStorageMeat() === 0,
    do: () => cliExecute("pull all"),
    post: () => cliExecute("refresh all"),
    limit: { tries: 1 },
  };
}

export function kingFreed(): Task[] {
  return [
    {
      name: "Closet Meat",
      completed: () => myMeat() <= args.minor.maxmeat || myClosetMeat() > 0,
      do: () => cliExecute(`closet put ${myMeat() - args.minor.maxmeat} meat`),
      limit: { tries: 1 },
    },
    {
      name: "Rain-Doh",
      completed: () => !have($item`can of Rain-Doh`),
      do: () => use($item`can of Rain-Doh`),
      limit: { tries: 1 },
    },
    {
      name: "Astral Constainer",
      completed: () => astralContainers.every((item) => !have(item)),
      do: () =>
        astralContainers.forEach((item) => {
          if (have(item)) use(item);
        }),
      limit: { tries: 1 },
    },
    {
      name: "Every Skill",
      completed: () => get("_bookOfEverySkillUsed", false),
      do: () => use($item`The Big Book of Every Skill`),
      limit: { tries: 1 },
    },
    {
      name: "Enable Reverser",
      completed: () => get("backupCameraReverserEnabled"),
      do: () => cliExecute("backupcamera reverser on"),
      limit: { tries: 1 },
    },
    {
      name: "Tune Moon",
      completed: () => mySign() === args.minor.tune || get("moonTuned"),
      do: () => cliExecute(`spoon ${args.minor.tune}`),
      limit: { tries: 1 },
    },
    {
      name: "Duplicate",
      ready: () =>
        have(args.minor.duplicate) &&
        get("encountersUntilDMTChoice") <=
          $familiar`Machine Elf`.fightsLimit - $familiar`Machine Elf`.fightsToday,
      completed: () => get("lastDMTDuplication") >= myAscensions(),
      prepare: () => set("choiceAdventure1125", `1&iid=${toInt(args.minor.duplicate)}`),
      do: $location`The Deep Machine Tunnels`,
      post: () => putCloset(itemAmount(args.minor.duplicate), args.minor.duplicate),
      acquire: () => [{ item: args.minor.duplicate }],
      choices: { 1119: 4 },
      combat: new CombatStrategy().macro(new Macro().attack().repeat()),
      outfit: {
        weapon: $item`Fourth of May Cosplay Saber`,
        familiar: $familiar`Machine Elf`,
        modifier: "muscle, -ml",
      },
      limit: { tries: 6 },
    },
  ];
}

export function breakfast(): Task[] {
  return [
    {
      name: "Breakfast",
      completed: () => get("breakfastCompleted"),
      do: () => cliExecute("breakfast"),
      limit: { tries: 1 },
    },
    {
      name: "Detective Solver",
      completed: () => get("_detectiveCasesCompleted") >= 3,
      do: () => cliExecuteThrow("Detective Solver"),
      limit: { tries: 1 },
    },
    {
      name: "Clan Fortune",
      completed: () => get("_clanFortuneConsultUses") >= 3,
      do: () => Clan.with("Bonus Adventures from Hell", () => cliExecute("fortune 3038166")),
      post: () => wait(10),
      limit: { tries: 5 },
    },
  ];
}

export function duffo(): Task[] {
  return [
    {
      name: "Party Fair",
      completed: () => get("_questPartyFair") !== "unstarted",
      do: (): void => {
        visitUrl(toUrl($location`The Neverending Party`));
        if (["food", "booze"].includes(get("_questPartyFairQuest"))) {
          runChoice(1); // Accept quest
        } else {
          runChoice(2); // Decline quest
        }
      },
      limit: { tries: 1 },
    },
    {
      name: "Duffo",
      completed: () =>
        get("_questPartyFairProgress") !== "" ||
        ["", "finished"].includes(get("_questPartyFair")) ||
        !["food", "booze"].includes(get("_questPartyFairQuest")),
      do: () => cliExecuteThrow("duffo go"),
      post: () => Clan.join("Margaretting Tye"),
      limit: { tries: 1 },
    },
  ];
}

export function menagerie(): Task[] {
  return [
    {
      name: "Menagerie Key",
      ready: () =>
        canAdventure($location`Cobb's Knob Laboratory`) &&
        get("_monstersMapped") < 3 &&
        !have($effect`Everything Looks Yellow`),
      completed: () => have($item`Cobb's Knob Menagerie key`),
      do: () =>
        Cartography.mapMonster(
          $location`Cobb's Knob Laboratory`,
          $monster`Knob Goblin Very Mad Scientist`
        ),
      acquire: [{ item: $item`yellow rocket`, price: 250 }],
      combat: new CombatStrategy().macro(
        Macro.item($item`yellow rocket`),
        $monster`Knob Goblin Very Mad Scientist`
      ),
      limit: { tries: 1 },
    },
    {
      name: "Feed Goose",
      completed: () =>
        get("_mayflySummons") >= 30 ||
        get("gooseDronesRemaining") > 0 ||
        familiarWeight($familiar`Grey Goose`) > 5,
      do: () => use($item`Ghost Dog Chow`),
      acquire: [{ item: $item`Ghost Dog Chow`, price: 5000 }],
      outfit: { familiar: $familiar`Grey Goose` },
      limit: { tries: 1 },
    },
    {
      name: "Mayfly BASICs",
      completed: () => get("_mayflySummons") >= 30,
      prepare: () => cliExecute("backupcamera init"),
      do: $location`Cobb's Knob Menagerie, Level 1`,
      post: () => {
        if (get("_mayflySummons") >= 30) uneffect($effect`Beaten Up`);
      },
      acquire: [
        { item: $item`Sneaky Pete's leather jacket` },
        { item: $item`crystal skull`, price: 10_000 },
        { item: $item`tennis ball`, price: 10_000 },
      ],
      outfit: {
        hat: $item`biker's hat`,
        back: $item`Duke Vampire's regal cloak`,
        weapon: $item`June cleaver`,
        offhand: $item`tiny black hole`,
        shirt: $item`Sneaky Pete's leather jacket`,
        pants: $item`designer sweatpants`,
        acc1: $item`mayfly bait necklace`,
        acc2: $item`Lord Soggyraven's Slippers`,
        acc3: $item`backup camera`,
        familiar: $familiar`Grey Goose`,
        famequip: $item`tiny stillsuit`,
      },
      effects: $effects`Springy Fusilli, Cletus's Canticle of Celerity`,
      combat: new CombatStrategy()
        .macro(Macro.item($item`crystal skull`), $monster`Fruit Golem`)
        .macro(Macro.item($item`tennis ball`), $monster`Knob Goblin Mutant`)
        .macro(
          Macro.step("pickpocket")
            .trySkill($skill`Emit Matter Duplicating Drones`)
            .skill($skill`Summon Mayfly Swarm`),
          $monster`BASIC Elemental`
        ),
      limit: { tries: 40 },
    },
  ];
}

export function breakStone(): Task[] {
  return [
    {
      name: "Break Stone",
      completed: () => hippyStoneBroken(),
      do: () => visitUrl("peevpee.php?action=smashstone&confirm=on"),
      limit: { tries: 1 },
    },
  ];
}

export function pvp(after: string[]): Task[] {
  return [
    {
      name: "Pledge Allegiance",
      completed: () => !visitUrl("peevpee.php?place=fight").includes("Pledge allegiance to"),
      do: () => visitUrl("peevpee.php?action=pledge&place=fight&pwd"),
      limit: { tries: 1 },
    },
    {
      name: "Swagger",
      after: [...after],
      ready: () => hippyStoneBroken(),
      completed: () => pvpAttacksLeft() === 0,
      do: () => {
        cliExecute("unequip");
        cliExecute("UberPvPOptimizer");
        cliExecute("swagger");
      },
      limit: { tries: 1 },
    },
  ];
}
