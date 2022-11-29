import { CombatStrategy } from "grimoire-kolmafia";
import { bjornifyFamiliar, cliExecute, myInebriety, useSkill } from "kolmafia";
import { $effect, $familiar, $item, $location, $skill, get, Macro, uneffect } from "libram";
import { Task } from "../../engine/task";
import { canConsume, stooperInebrietyLimit } from "../../lib";

function distillateAdvs(): number {
  return Math.round(get("familiarSweat") ** 0.4);
}

export function stooper(): Task {
  return {
    name: "Stooper",
    ready: () => distillateAdvs() >= 9 && !canConsume(), // Check organs just to be safe
    completed: () => myInebriety() >= stooperInebrietyLimit(),
    do: () => cliExecute("drink stillsuit distillate"),
    limit: { tries: 1 },
  };
}

export function caldera(): Task {
  return {
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
    limit: { tries: 10 }, // Clear intro adventure
  };
}
