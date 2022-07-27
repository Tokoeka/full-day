import { CombatStrategy, Task } from "grimoire-kolmafia";
import {
  bjornifyFamiliar,
  cliExecute,
  inebrietyLimit,
  myAdventures,
  myInebriety,
  pvpAttacksLeft,
  useSkill,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $skill,
  get,
  Macro,
  uneffect,
  withProperty,
} from "libram";
import { shouldOverdrink } from "../lib";

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
      name: "Doghouse Volcoino",
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
      combat: new CombatStrategy().macro(Macro.attack().repeat()),
      outfit: {
        familiar: $familiar`Puck Man`,
        equip: [
          $item`Fourth of May Cosplay Saber`,
          $item`Drunkula's wineglass`,
          $item`Buddy Bjorn`,
          $item`lucky gold ring`,
          $item`mafia thumb ring`,
          $item`Mr. Screege's spectacles`,
          $item`orange boxing gloves`,
        ],
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
      limit: { tries: 8 }, // Clear intro adventure
    },
    {
      name: "Drunk Garbo",
      ready: () => myInebriety() > inebrietyLimit(),
      completed: () => myAdventures() === 0,
      do: () => cliExecute("garbo ascend"),
      limit: { tries: 1 },
    },
  ];
}

export const breakfastTask: Task = {
  name: "Breakfast",
  completed: () => get("breakfastCompleted"),
  do: () => cliExecute("breakfast"),
  limit: { tries: 1 },
};

export const detectiveSolverTask: Task = {
  name: "Detective Solver",
  completed: () => get("_detectiveCasesCompleted") >= 3,
  do: () => cliExecute("Detective Solver"),
  limit: { tries: 1 },
};

export const garboAscendTask: Task = {
  name: "Garbo Ascend",
  completed: () => shouldOverdrink() || myInebriety() > inebrietyLimit(),
  do: () => cliExecute("garbo yachtzeechain ascend"),
  limit: { tries: 1 },
};

export const garboTask: Task = {
  name: "Garbo",
  completed: () => shouldOverdrink() || myInebriety() > inebrietyLimit(),
  do: () => cliExecute("garbo"),
  limit: { tries: 1 },
};

export const overdrinkAscendTask: Task = {
  name: "Overdrink Ascend",
  ready: () => shouldOverdrink(),
  completed: () => myInebriety() > inebrietyLimit(),
  do: () => withProperty("spiceMelangeUsed", true, () => cliExecute("CONSUME NIGHTCAP VALUE 3500")),
  limit: { tries: 1 },
};

export const overdrinkTask: Task = {
  name: "Overdrink",
  ready: () => shouldOverdrink(),
  completed: () => myInebriety() > inebrietyLimit(),
  do: () => withProperty("spiceMelangeUsed", true, () => cliExecute("CONSUME NIGHTCAP")),
  limit: { tries: 1 },
};

export const drunkGarboTask: Task = {
  name: "Drunk Garbo",
  ready: () => myInebriety() > inebrietyLimit(),
  completed: () => myAdventures() === 0,
  do: () => cliExecute("garbo ascend"),
  limit: { tries: 1 },
};

export const doghouseVolcoinoTask: Task = {
  name: "Doghouse Volcoino",
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
  combat: new CombatStrategy().macro(Macro.attack().repeat()),
  outfit: {
    familiar: $familiar`Puck Man`,
    equip: [
      $item`Fourth of May Cosplay Saber`,
      $item`Drunkula's wineglass`,
      $item`Buddy Bjorn`,
      $item`lucky gold ring`,
      $item`mafia thumb ring`,
      $item`Mr. Screege's spectacles`,
      $item`orange boxing gloves`,
    ],
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
  limit: { tries: 8 }, // Clear intro adventure
};

export const pvpTask: Task = {
  name: "PvP",
  completed: () => pvpAttacksLeft() === 0,
  prepare: () => cliExecute("UberPvPOptimizer"),
  do: () => cliExecute("swagger"),
  limit: { tries: 1 },
};
