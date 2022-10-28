import { CombatStrategy } from "grimoire-kolmafia";
import {
  bjornifyFamiliar,
  cliExecute,
  inebrietyLimit,
  myAdventures,
  myInebriety,
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
  set,
  uneffect,
  withProperty,
} from "libram";
import { Task } from "../engine/task";
import { canConsume, cliExecuteThrow, distillateAdvs, stooperInebrietyLimit } from "../lib";
import { args } from "../main";

export function stooper(after: string[]): Task {
  return {
    name: "Stooper",
    after: [...after],
    ready: () => distillateAdvs() >= 9,
    completed: () => myInebriety() >= stooperInebrietyLimit(),
    do: () => cliExecute("drink stillsuit distillate"),
    limit: { tries: 1 },
  };
}

export function caldera(after: string[]): Task {
  return {
    name: "Caldera",
    after: [...after],
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
    limit: { tries: 10 }, // Clear intro adventure
  };
}

export function farmUsingStrategy(ascend: boolean): Task[] {
  switch (args.strategy) {
    case "garbo":
      return garbo(ascend);
    case "baggo":
      return baggo(ascend);
    case "chrono":
      return chrono(ascend);
    default:
      throw `${args.strategy} strategy is not not implemented`;
  }
}

export function garbo(ascend: boolean): Task[] {
  const tasks = [
    {
      name: "Garbo",
      completed: () =>
        (myAdventures() === 0 && !canConsume()) || myInebriety() >= stooperInebrietyLimit(),
      do: () => cliExecuteThrow(`garbo yachtzeechain ${ascend ? "ascend" : ""}`),
      limit: { tries: 1 },
      tracking: "Garbo",
    },
    stooper(["Garbo"]),
    {
      name: "Overdrink",
      after: ["Stooper"],
      completed: () => myInebriety() > stooperInebrietyLimit(),
      do: () =>
        withProperty("spiceMelangeUsed", true, () =>
          cliExecuteThrow(`CONSUME NIGHTCAP ${ascend ? "VALUE 3250" : ""}`)
        ),
      outfit: { familiar: $familiar`Stooper` },
      limit: { tries: 1 },
    },
  ];

  if (ascend) {
    tasks.push(caldera(["Overdrink"]));
    tasks.push({
      name: "Overdrunk",
      after: ["Overdrink"],
      ready: () => myInebriety() > inebrietyLimit(),
      completed: () => myAdventures() === 0,
      do: () => cliExecuteThrow("garbo ascend"),
      limit: { tries: 1 },
      tracking: "Garbo",
    });
  }
  return tasks;
}

export function baggo(ascend: boolean): Task[] {
  const tasks = [
    {
      name: "Garbo",
      completed: () => get("_fullday_completedGarbo", false),
      do: (): void => {
        cliExecuteThrow(`garbo yachtzeechain nobarf ${ascend ? "ascend" : ""}`);
        set("_fullday_completedGarbo", true);
      },
      limit: { tries: 1 },
      tracking: "Garbo",
    },
    {
      name: "Baggo",
      after: ["Garbo"],
      completed: () =>
        (myAdventures() === 0 && !canConsume()) || myInebriety() >= stooperInebrietyLimit(),
      do: () => cliExecuteThrow("baggo"),
      limit: { tries: 1 },
      tracking: "Baggo",
    },
    stooper(["Garbo", "Baggo"]),
    {
      name: "Overdrink",
      after: ["Stooper"],
      completed: () => myInebriety() > stooperInebrietyLimit(),
      do: () =>
        withProperty("spiceMelangeUsed", true, () =>
          cliExecuteThrow(`CONSUME NIGHTCAP ${ascend ? "NOMEAT" : ""}`)
        ),
      outfit: { familiar: $familiar`Stooper` },
      limit: { tries: 1 },
    },
  ];

  if (ascend) {
    tasks.push(caldera(["Overdrink"]));
    tasks.push({
      name: "Overdrunk",
      after: ["Overdrink"],
      ready: () => myInebriety() > stooperInebrietyLimit(),
      completed: () => myAdventures() === 0,
      do: () => cliExecuteThrow("garbo"),
      limit: { tries: 1 },
      tracking: "Garbo",
    });
  }
  return tasks;
}

export function chrono(ascend: boolean): Task[] {
  const tasks = [
    {
      name: "Garbo",
      completed: () => get("_fullday_completedGarbo", false),
      do: (): void => {
        cliExecuteThrow(`garbo yachtzeechain nobarf ${ascend ? "ascend" : ""}`);
        set("_fullday_completedGarbo", true);
      },
      limit: { tries: 1 },
      tracking: "Garbo",
    },
    {
      name: "Chrono",
      after: ["Garbo"],
      completed: () =>
        (myAdventures() === 0 && !canConsume()) || myInebriety() >= stooperInebrietyLimit(),
      do: () => cliExecuteThrow("chrono"),
      limit: { tries: 1 },
      tracking: "Chrono",
    },
    stooper(["Garbo", "Chrono"]),
    {
      name: "Overdrink",
      after: ["Stooper"],
      completed: () => myInebriety() > stooperInebrietyLimit(),
      do: () =>
        withProperty("spiceMelangeUsed", true, () =>
          cliExecuteThrow(`CONSUME NIGHTCAP ${ascend ? "NOMEAT" : ""}`)
        ),
      outfit: { familiar: $familiar`Stooper` },
      limit: { tries: 1 },
    },
  ];

  if (ascend) {
    tasks.push(caldera(["Overdrink"]));
    tasks.push({
      name: "Overdrunk",
      after: ["Overdrink"],
      ready: () => myInebriety() > stooperInebrietyLimit(),
      completed: () => myAdventures() === 0,
      do: () => cliExecuteThrow("chrono"),
      limit: { tries: 1 },
      tracking: "Chrono",
    });
  }

  return tasks;
}
