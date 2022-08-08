import { CombatStrategy, Task } from "grimoire-kolmafia";
import {
  bjornifyFamiliar,
  cliExecute,
  getStorage,
  hippyStoneBroken,
  inebrietyLimit,
  itemAmount,
  myAdventures,
  myAscensions,
  myClosetMeat,
  myInebriety,
  myMeat,
  mySign,
  myStorageMeat,
  pvpAttacksLeft,
  toInt,
  use,
  useSkill,
  visitUrl,
  wait,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $skill,
  Clan,
  get,
  have,
  Macro,
  set,
  uneffect,
  withProperty,
} from "libram";
import { shouldOverdrink, tryUse } from "../lib";
import { args } from "../main";

export function kingFreed(): Task[] {
  return [
    {
      name: "Pull All",
      completed: () => Object.keys(getStorage()).length === 0 && myStorageMeat() === 0,
      do: () => {
        cliExecute("pull all");
        cliExecute("refresh all");
      },
      limit: { tries: 1 },
    },
    {
      name: "Closet Meat",
      completed: () => myMeat() <= args.maxmeat || myClosetMeat() > 0,
      do: () => cliExecute(`closet put ${myMeat() - args.maxmeat} meat`),
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
      name: "Enable Reverser",
      completed: () => get("backupCameraReverserEnabled"),
      do: () => cliExecute("backupcamera reverser on"),
      limit: { tries: 1 },
    },
    {
      name: "Rain-Doh",
      completed: () => !have($item`can of Rain-Doh`),
      do: () => use($item`can of Rain-Doh`),
      limit: { tries: 1 },
    },
    {
      name: "Astral Consumable",
      completed: () =>
        $items`astral hot dog dinner, astral six-pack, [10882]carton of astral energy drinks`.every(
          (item) => !have(item)
        ),
      do: () =>
        $items`astral hot dog dinner, astral six-pack, [10882]carton of astral energy drinks`.forEach(
          (item) => tryUse(item)
        ),
      limit: { tries: 1 },
    },
    {
      name: "Every Skill",
      completed: () => get("_bookOfEverySkillUsed", false),
      do: () => use($item`The Big Book of Every Skill`),
    },
    {
      name: "Tune Moon",
      completed: () => mySign() === args.tune || get("moonTuned"),
      do: () => cliExecute(`spoon ${args.tune}`),
      limit: { tries: 1 },
    },
    {
      name: "Duplicate",
      ready: () => itemAmount(args.duplicate) > 0 && get("encountersUntilDMTChoice") < 1,
      completed: () => get("lastDMTDuplication") >= myAscensions(),
      prepare: () => set("choiceAdventure1125", `1&iid=${toInt(args.duplicate)}`),
      do: $location`The Deep Machine Tunnels`,
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
      post: () => {
        if (get("_clanFortuneConsultUses") < 3) wait(10);
      },
      limit: { tries: 3 },
    },
  ];
}

export function garboAscend(): Task[] {
  return [
    {
      name: "Garbo Ascend",
      completed: () => shouldOverdrink() || myInebriety() > inebrietyLimit(),
      do: () => cliExecute("garbo yachtzeechain ascend"),
      limit: { tries: 1 },
    },
    {
      name: "Overdrink Ascend",
      ready: () => shouldOverdrink(),
      completed: () => myInebriety() > inebrietyLimit(),
      do: () =>
        withProperty("spiceMelangeUsed", true, () => cliExecute("CONSUME NIGHTCAP VALUE 3500")),
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
      combat: new CombatStrategy().macro(Macro.attack().repeat()),
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
      effects: [
        $effect`A Few Extra Pounds`,
        $effect`Astral Shell`,
        $effect`Big`,
        $effect`Feeling Excited`,
        $effect`Feeling Peaceful`,
        $effect`Power Ballad of the Arrowsmith`,
        $effect`Rage of the Reindeer`,
        $effect`Song of Bravado`,
        $effect`Stevedave's Shanty of Superiority`,
      ],
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
