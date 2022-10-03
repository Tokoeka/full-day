import { CombatStrategy } from "grimoire-kolmafia";
import {
  bjornifyFamiliar,
  cliExecute,
  familiarWeight,
  hippyStoneBroken,
  inebrietyLimit,
  itemAmount,
  myAdventures,
  myAscensions,
  myClosetMeat,
  myInebriety,
  myMeat,
  mySign,
  putCloset,
  pvpAttacksLeft,
  runChoice,
  toInt,
  toUrl,
  use,
  userConfirm,
  useSkill,
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
  Clan,
  get,
  have,
  Macro,
  set,
  uneffect,
  withProperty,
} from "libram";
import { args } from "../main";
import { Task } from "../engine/task";
import { canConsume, distillateAdvs, mapMonster, stooperInebrietyLimit } from "../lib";

const astralContainers = $items`astral hot dog dinner, astral six-pack, [10882]carton of astral energy drinks`;

export function kingFreed(): Task[] {
  return [
    {
      name: "Closet Meat",
      completed: () => myMeat() <= args.maxmeat || myClosetMeat() > 0,
      do: () => cliExecute(`closet put ${myMeat() - args.maxmeat} meat`),
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
      completed: () => mySign() === args.tune || get("moonTuned"),
      do: () => cliExecute(`spoon ${args.tune}`),
      limit: { tries: 1 },
    },
    {
      name: "Smash Stone",
      completed: () => hippyStoneBroken(),
      do: () => visitUrl("peevpee.php?action=smashstone&confirm=on"),
      limit: { tries: 1 },
    },
    {
      name: "Pledge Allegiance",
      completed: () => !visitUrl("peevpee.php?place=fight").includes("Pledge allegiance to"),
      do: () => visitUrl("peevpee.php?action=pledge&place=fight&pwd"),
      limit: { tries: 1 },
    },
    {
      name: "Duplicate",
      ready: () => have(args.duplicate) && get("encountersUntilDMTChoice") < 1,
      completed: () => get("lastDMTDuplication") >= myAscensions(),
      prepare: () => set("choiceAdventure1125", `1&iid=${toInt(args.duplicate)}`),
      do: $location`The Deep Machine Tunnels`,
      post: () => putCloset(itemAmount(args.duplicate), args.duplicate),
      acquire: () => [{ item: args.duplicate }],
      choices: { 1119: 4 },
      outfit: { familiar: $familiar`Machine Elf` },
      limit: { tries: 1 },
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
      do: () => cliExecute("Detective Solver"),
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
      prepare: () => {
        if (!userConfirm("Ready to start duffo?")) throw "User requested abort";
      },
      do: () => cliExecute("duffo go"),
      post: () => Clan.join("Margaretting Tye"),
      limit: { tries: 1 },
    },
  ];
}

export function menagerie(): Task[] {
  return [
    {
      name: "Menagerie Key",
      ready: () => get("_monstersMapped") < 3 && !have($effect`Everything Looks Yellow`),
      completed: () => have($item`Cobb's Knob Menagerie key`),
      do: () =>
        mapMonster($location`Cobb's Knob Laboratory`, $monster`Knob Goblin Very Mad Scientist`),
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

export function stooper(): Task {
  return {
    name: "Stooper",
    ready: () => distillateAdvs() >= 10,
    completed: () => myInebriety() >= stooperInebrietyLimit(),
    do: () => cliExecute("drink stillsuit distillate"),
    limit: { tries: 1 },
  };
}

export function garboAscend(): Task[] {
  return [
    {
      name: "Garbo",
      completed: () =>
        (myAdventures() === 0 && !canConsume()) || myInebriety() >= stooperInebrietyLimit(),
      do: () => cliExecute("garbo yachtzeechain ascend"),
      limit: { tries: 1 },
      tracking: "Garbo",
    },
    stooper(),
    {
      name: "Overdrink",
      completed: () => myInebriety() > stooperInebrietyLimit(),
      do: () =>
        withProperty("spiceMelangeUsed", true, () => cliExecute("CONSUME NIGHTCAP VALUE 3500")),
      outfit: { familiar: $familiar`Stooper` },
      limit: { tries: 1 },
    },
    {
      name: "Caldera",
      completed: () =>
        $location`The Bubblin' Caldera`.turnsSpent >= 7 ||
        $location`The Bubblin' Caldera`.noncombatQueue.includes("Lava Dogs"),
      prepare: () => {
        bjornifyFamiliar($familiar`Warbear Drone`);
        useSkill($skill`Cannelloni Cocoon`);
      },
      do: $location`The Bubblin' Caldera`,
      post: () => {
        if (
          $location`The Bubblin' Caldera`.turnsSpent >= 7 ||
          $location`The Bubblin' Caldera`.noncombatQueue.includes("Lava Dogs")
        )
          uneffect($effect`Drenched in Lava`);
      },
      acquire: [{ item: $item`heat-resistant sheet metal`, price: 5000, optional: true }],
      outfit: {
        weapon: $item`June cleaver`,
        offhand: $item`Drunkula's wineglass`,
        back: $item`Buddy Bjorn`,
        acc1: $item`lucky gold ring`,
        acc2: $item`mafia thumb ring`,
        acc3: $item`Mr. Screege's spectacles`,
        familiar: $familiar`Puck Man`,
        famequip: $item`orange boxing gloves`,
        modifier: "mainstat",
      },
      combat: new CombatStrategy().macro(Macro.attack().repeat()),
      limit: { tries: 9 }, // Clear intro adventure
    },
    {
      name: "Drunk Garbo",
      ready: () => myInebriety() > inebrietyLimit(),
      completed: () => myAdventures() === 0,
      do: () => cliExecute("garbo ascend"),
      limit: { tries: 1 },
    },
    {
      name: "PvP",
      completed: () => pvpAttacksLeft() === 0,
      prepare: () => cliExecute("UberPvPOptimizer"),
      do: () => cliExecute("swagger"),
      limit: { tries: 1 },
    },
  ];
}
