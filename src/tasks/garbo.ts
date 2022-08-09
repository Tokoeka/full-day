import { Quest, Task } from "grimoire-kolmafia";
import {
  cliExecute,
  inebrietyLimit,
  maximize,
  myInebriety,
  numericModifier,
  random,
  retrieveItem,
  retrievePrice,
  use,
} from "kolmafia";
import { $item, get, have, haveInCampground, Kmail, withProperty } from "libram";
import { ascensionsToday, shouldOverdrink } from "../lib";
import { breakfast, garboAscend, kingFreed } from "./common";

export const FirstGarboQuest: Quest<Task> = {
  name: "First Garbo",
  completed: () => ascensionsToday() > 0,
  tasks: [...breakfast(), ...garboAscend()],
};

export const SecondGarboQuest: Quest<Task> = {
  name: "Second Garbo",
  completed: () => ascensionsToday() > 1,
  tasks: [...kingFreed(), ...breakfast(), ...garboAscend()],
};

export const ThirdGarboQuest: Quest<Task> = {
  name: "Third Garbo",
  tasks: [
    ...kingFreed(),
    ...breakfast(),
    {
      name: "Garbo",
      completed: () => shouldOverdrink() || myInebriety() > inebrietyLimit(),
      do: () => cliExecute("garbo"),
      limit: { tries: 1 },
    },
    {
      name: "Overdrink",
      ready: () => shouldOverdrink(),
      completed: () => myInebriety() > inebrietyLimit(),
      do: () => withProperty("spiceMelangeUsed", true, () => cliExecute("CONSUME NIGHTCAP")),
      limit: { tries: 1 },
    },
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
      limit: { tries: 1 },
    },
    {
      name: "Pajamas",
      completed: () =>
        maximize("adv, switch tot, switch left-hand man, switch disembodied hand", true) &&
        numericModifier("Generated:_spec", "Adventures") <= numericModifier("Adventures"),
      do: () => maximize("adv, switch tot, switch left-hand man, switch disembodied hand", false),
      limit: { tries: 1 },
    },
    {
      name: "Clean Inbox",
      completed: () =>
        Kmail.inbox().filter((k) =>
          ["Lady Spookyraven's Ghost", "The Loathing Postal Service", "CheeseFax"].includes(
            k.senderName
          )
        ).length === 0,
      do: () =>
        Kmail.delete(
          Kmail.inbox().filter((k) =>
            ["Lady Spookyraven's Ghost", "The Loathing Postal Service", "CheeseFax"].includes(
              k.senderName
            )
          )
        ),
      limit: { tries: 1 },
    },
    {
      name: "Raffle",
      completed: () => have($item`raffle ticket`),
      do: () => cliExecute(`raffle ${random(9) + 1}`),
      limit: { tries: 1 },
    },
  ],
};
