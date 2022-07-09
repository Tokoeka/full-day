import {
  cliExecute,
  fullnessLimit,
  inebrietyLimit,
  maximize,
  myAdventures,
  myFullness,
  myInebriety,
  mySign,
  mySpleenUse,
  numericModifier,
  pvpAttacksLeft,
  retrieveItem,
  retrievePrice,
  spleenLimit,
  use,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  get,
  haveInCampground,
  Macro,
  uneffect,
  withProperty,
} from "libram";
import { Task } from "fizzlib";
import { SPOON_SIGN } from "./config";

function shouldOverdrink(): boolean {
  return (
    myFullness() >= fullnessLimit() &&
    myInebriety() === inebrietyLimit() &&
    mySpleenUse() >= spleenLimit() &&
    myAdventures() === 0
  );
}

export const breakfastTask: Task = {
  name: "Breakfast",
  completed: () => get("breakfastCompleted"),
  do: () => cliExecute("breakfast"),
  freeaction: true,
  noadventures: true,
};

export const detectiveSolverTask: Task = {
  name: "Detective Solver",
  completed: () => get("_detectiveCasesCompleted") >= 3,
  do: () => cliExecute("Detective Solver.ash"),
  freeaction: true,
  noadventures: true,
};

export const tuneMoonTask: Task = {
  name: "Tune Moon",
  completed: () => mySign().toLowerCase() === SPOON_SIGN.toLowerCase() || get("moonTuned"),
  do: () => cliExecute(`spoon ${SPOON_SIGN}`),
  freeaction: true,
  noadventures: true,
};

export const garboYachtzeeAscendTask: Task = {
  name: "Garbo Yachtzee Ascend",
  completed: () => shouldOverdrink() || myInebriety() > inebrietyLimit(),
  do: () => cliExecute("garbo yachtzeechain ascend"),
  freeaction: true,
  noadventures: true,
};

export const garboAscendTask: Task = {
  name: "Garbo Ascend",
  completed: () => shouldOverdrink() || myInebriety() > inebrietyLimit(),
  do: () => cliExecute("garbo ascend"),
  freeaction: true,
  noadventures: true,
};

export const garboTask: Task = {
  name: "Garbo",
  completed: () => shouldOverdrink() || myInebriety() > inebrietyLimit(),
  do: () => cliExecute("garbo yachtzeechain"),
  freeaction: true,
  noadventures: true,
};

export const overdrinkAscendTask: Task = {
  name: "Overdrink Ascend",
  ready: () => shouldOverdrink(),
  completed: () => myInebriety() > inebrietyLimit(),
  do: () => withProperty("spiceMelangeUsed", true, () => cliExecute("CONSUME NIGHTCAP VALUE 3500")),
  freeaction: true,
  noadventures: true,
};

export const overdrinkTask: Task = {
  name: "Overdrink",
  ready: () => shouldOverdrink(),
  completed: () => myInebriety() > inebrietyLimit(),
  do: () => withProperty("spiceMelangeUsed", true, () => cliExecute("CONSUME NIGHTCAP")),
  freeaction: true,
  noadventures: true,
};

export const doghouseVolcoinoTask: Task = {
  name: "Doghouse Volcoino",
  completed: () => $location`The Bubblin' Caldera`.noncombatQueue.includes("Lava Dogs"),
  do: $location`The Bubblin' Caldera`,
  post: (): void => {
    if ($location`The Bubblin' Caldera`.noncombatQueue.includes("Lava Dogs"))
      uneffect($effect`Drenched in Lava`);
  },
  combat: Macro.attack().repeat(),
  outfit: {
    familiar: $familiar`Puck Man`,
    equip: {
      weapon: $item`Fourth of May Cosplay Saber`,
      offhand: $item`Drunkula's wineglass`,
      // TODO bjorn, sweaty pants
      acc1: $item`Mr. Screege's spectacles`,
      acc2: $item`mafia thumb ring`,
      acc3: $item`lucky gold ring`,
      familiar: $item`orange boxing gloves`,
    },
    modifier: "mainstat",
  },
  effects: [
    $effect`A Few Extra Pounds`,
    $effect`Big`,
    $effect`Feeling Excited`,
    $effect`Power Ballad of the Arrowsmith`,
    $effect`Rage of the Reindeer`,
    $effect`Song of Bravado`,
    $effect`Stevedave's Shanty of Superiority`,
  ],
  limit: 6,
};

export const drunkGarboTask: Task = {
  name: "Drunk Garbo",
  ready: () => myInebriety() > inebrietyLimit(),
  completed: () => myAdventures() === 0,
  do: () => cliExecute("garbo ascend"),
  freeaction: true,
  noadventures: true,
};

export const pvpTask: Task = {
  name: "PvP",
  completed: () => pvpAttacksLeft() === 0,
  do: () => cliExecute("swagger"),
  freeaction: true,
  noadventures: true,
};

export const clockworkMaidTask: Task = {
  name: "Clockwork Maid",
  completed: () =>
    haveInCampground($item`clockwork maid`) ||
    numericModifier($item`clockwork maid`, "Adventures") * get("valueOfAdventure") <
      retrievePrice($item`clockwork maid`),
  do: (): void => {
    retrieveItem($item`clockwork maid`);
    use($item`clockwork maid`);
  },
  freeaction: true,
  noadventures: true,
};

export const pajamasTask: Task = {
  name: "Pajamas",
  completed: () =>
    maximize("adventures, switch tot, switch left-hand man, switch disembodied hand", true) &&
    numericModifier("Generated:_spec", "Adventures") <= numericModifier("Adventures"),
  do: () =>
    maximize("adventures, switch tot, switch left-hand man, switch disembodied hand", false),
  freeaction: true,
  noadventures: true,
};
