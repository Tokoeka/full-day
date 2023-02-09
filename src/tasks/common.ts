import { CombatStrategy } from "grimoire-kolmafia";
import {
  canAdventure,
  canEquip,
  cliExecute,
  familiarWeight,
  getStorage,
  hippyStoneBroken,
  Item,
  itemAmount,
  jumpChance,
  maximize,
  myAscensions,
  myClosetMeat,
  myMeat,
  mySign,
  myStorageMeat,
  numericModifier,
  putCloset,
  pvpAttacksLeft,
  retrieveItem,
  retrievePrice,
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
  haveInCampground,
  Macro,
  set,
} from "libram";
import { args } from "../args";
import { Task } from "./structure";
import { canPickpocket, cliExecuteThrow } from "../lib";

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

export function breakfast(after: string[]): Task[] {
  return [
    {
      name: "Closet Meat",
      after: after,
      completed: () => myMeat() <= args.minor.maxmeat || myClosetMeat() > 0,
      do: () => cliExecute(`closet put ${myMeat() - args.minor.maxmeat} meat`),
      limit: { tries: 1 },
    },
    {
      name: "Rain-Doh",
      after: after,
      completed: () => !have($item`can of Rain-Doh`),
      do: () => use($item`can of Rain-Doh`),
      limit: { tries: 1 },
    },
    {
      name: "Astral Constainer",
      after: after,
      completed: () => astralContainers.every((item) => !have(item)),
      do: () => astralContainers.filter((item) => have(item)).forEach((item) => use(item)),
      limit: { tries: 1 },
    },
    {
      name: "Every Skill",
      after: after,
      completed: () => get("_bookOfEverySkillUsed", false),
      do: () => use($item`The Big Book of Every Skill`),
      limit: { tries: 1 },
    },
    {
      name: "Enable Reverser",
      after: after,
      completed: () => get("backupCameraReverserEnabled"),
      do: () => cliExecute("backupcamera reverser on"),
      limit: { tries: 1 },
    },
    {
      name: "Tune Moon",
      after: after,
      completed: () => mySign() === args.minor.tune || get("moonTuned"),
      do: () => cliExecute(`spoon ${args.minor.tune}`),
      limit: { tries: 1 },
    },
    {
      name: "Duplicate",
      after: after,
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
    {
      name: "Detective Solver",
      after: after,
      completed: () => get("_detectiveCasesCompleted") >= 3,
      do: () => cliExecuteThrow("Detective Solver"),
      limit: { tries: 1 },
    },
    {
      name: "Clan Fortune",
      after: after,
      completed: () => get("_clanFortuneConsultUses") >= 3,
      do: () => Clan.with("Bonus Adventures from Hell", () => cliExecute("fortune 3038166")),
      post: () => wait(10),
      limit: { tries: 5 },
    },
    {
      name: "Breakfast",
      after: after,
      completed: () => get("breakfastCompleted"),
      do: () => cliExecute("breakfast"),
      limit: { tries: 1 },
    },
  ];
}

export function duffo(after: string[]): Task[] {
  return [
    {
      name: "Party Fair",
      after: [...after],
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
      after: [...after, "Party Fair"],
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

function bestPickpocketItem(): Item {
  return have($item`mime army infiltration glove`) && canEquip($item`mime army infiltration glove`)
    ? $item`mime army infiltration glove`
    : $item`tiny black hole`;
}

export function menagerie(after: string[]): Task[] {
  return [
    {
      name: "Menagerie Key",
      after: [...after],
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
      after: [...after, "Menagerie Key"],
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
      name: "Mayfly Runaways",
      after: [...after, "Menagerie Key", "Feed Goose"],
      completed: () => get("_mayflySummons") >= 30,
      prepare: () => {
        if (jumpChance($monster`BASIC Elemental`) < 100) {
          throw `Unable to guarantee winning initiative against BASIC Elemental`;
        }
      },
      do: $location`Cobb's Knob Menagerie, Level 1`,
      acquire: [
        { item: $item`Louder Than Bomb`, price: 10_000 },
        { item: $item`tennis ball`, price: 10_000 },
      ],
      outfit: () => {
        return {
          equip: canPickpocket() ? [] : [bestPickpocketItem()],
          acc1: $item`mayfly bait necklace`,
          familiar: $familiar`Grey Goose`,
          famequip: $item`tiny stillsuit`,
          modifier: "pickpocket chance, init 100max",
        };
      },
      effects: $effects`Cletus's Canticle of Celerity, Nearly Silent Hunting, Springy Fusilli, Suspicious Gaze, Walberg's Dim Bulb`,
      combat: new CombatStrategy()
        .macro(Macro.item($item`Louder Than Bomb`), $monster`Fruit Golem`)
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

export function breakStone(): Task {
  return {
    name: "Break Stone",
    completed: () => hippyStoneBroken(),
    do: () => visitUrl("peevpee.php?action=smashstone&confirm=on"),
    limit: { tries: 1 },
  };
}

export function pvp(after: string[]): Task[] {
  return [
    {
      name: "Pledge Allegiance",
      after: after,
      completed: () => !visitUrl("peevpee.php?place=fight").includes("Pledge allegiance to"),
      do: () => visitUrl("peevpee.php?action=pledge&place=fight&pwd"),
      limit: { tries: 1 },
    },
    {
      name: "Swagger",
      after: [...after, "Pledge Allegiance"],
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

export function endOfDay(after: string[]): Task[] {
  return [
    {
      name: "Raffle",
      after: after,
      completed: () => have($item`raffle ticket`),
      do: () => cliExecute(`raffle ${Math.random() * 10 + 1}`),
      limit: { tries: 1 },
    },
    {
      name: "Clockwork Maid",
      after: after,
      completed: () =>
        haveInCampground($item`clockwork maid`) ||
        numericModifier($item`clockwork maid`, "Adventures") * get("valueOfAdventure") <
          retrievePrice($item`clockwork maid`),
      do: (): void => {
        retrieveItem($item`clockwork maid`);
        use($item`clockwork maid`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Pajamas",
      after: after,
      completed: () =>
        maximize("adv, switch tot, switch left-hand man, switch disembodied hand", true) &&
        numericModifier("Generated:_spec", "Adventures") <= numericModifier("Adventures"),
      prepare: () => cliExecute("refresh all"),
      do: () => maximize("adv, switch tot, switch left-hand man, switch disembodied hand", false),
      limit: { tries: 1 },
    },
  ];
}
