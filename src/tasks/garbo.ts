import { Quest, Task } from "grimoire-kolmafia";
import { maximize, numericModifier, retrieveItem, retrievePrice, use } from "kolmafia";
import { $item, get, haveInCampground, Kmail } from "libram";
import { ascensionsToday } from "../lib";
import {
  breakfastTask,
  detectiveSolverTask,
  doghouseVolcoinoTask,
  drunkGarboTask,
  garboAscendTask,
  garboTask,
  overdrinkAscendTask,
  overdrinkTask,
  pvpTask,
} from "./common";
import { kingFreed } from "./kingfreed";

export const FirstGarboQuest: Quest<Task> = {
  name: "First Garbo",
  completed: () => ascensionsToday() > 0,
  tasks: [
    breakfastTask,
    detectiveSolverTask,
    garboAscendTask,
    overdrinkAscendTask,
    doghouseVolcoinoTask,
    drunkGarboTask,
    pvpTask,
  ],
};

export const SecondGarboQuest: Quest<Task> = {
  name: "Second Garbo",
  completed: () => ascensionsToday() > 1,
  tasks: [
    ...kingFreed(),
    breakfastTask,
    detectiveSolverTask,
    garboAscendTask,
    overdrinkAscendTask,
    doghouseVolcoinoTask,
    drunkGarboTask,
    pvpTask,
  ],
};

export const ThirdGarboQuest: Quest<Task> = {
  name: "Third Garbo",
  tasks: [
    ...kingFreed(),
    breakfastTask,
    detectiveSolverTask,
    garboTask,
    overdrinkTask,
    {
      name: "Clockwork Maid",
      completed: () =>
        haveInCampground($item`clockwork maid`) ||
        numericModifier($item`clockwork maid`, "Adventures") * get("valueOfAdventure") <
          retrievePrice($item`clockwork maid`),
      do: (): void => {
        retrieveItem($item`clockwork maid`);
        use($item`clockwork maid`);
      },
    },
    {
      name: "Pajamas",
      completed: () =>
        maximize("adv, switch tot, switch left-hand man, switch disembodied hand", true) &&
        numericModifier("Generated:_spec", "Adventures") <= numericModifier("Adventures"),
      do: () => maximize("adv, switch tot, switch left-hand man, switch disembodied hand", false),
    },
    {
      name: "Clean Inbox",
      completed: () =>
        Kmail.inbox().filter((k) =>
          ["Lady Spookyraven's Ghost", "The Loathing Postal Service"].includes(k.senderName)
        ).length === 0,
      do: () =>
        Kmail.delete(
          Kmail.inbox().filter((k) =>
            ["Lady Spookyraven's Ghost", "The Loathing Postal Service"].includes(k.senderName)
          )
        ),
    },
  ],
};
