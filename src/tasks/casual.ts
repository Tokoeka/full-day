import { Quest } from "../engine/task";
import {
  cliExecute,
  getWorkshed,
  inebrietyLimit,
  maximize,
  myInebriety,
  myPathId,
  numericModifier,
  retrieveItem,
  retrievePrice,
  use,
} from "kolmafia";
import {
  $class,
  $effect,
  $item,
  $skill,
  ascend,
  AsdonMartin,
  get,
  have,
  haveInCampground,
  Kmail,
  Lifestyle,
  Paths,
  prepareAscension,
  withProperty,
} from "libram";
import { canAscendCasual, getSkillsToPerm, shouldOverdrink } from "../lib";
import { breakfast, duffo, kingFreed } from "./common";

export const CasualQuest: Quest = {
  name: "Casual",
  tasks: [
    {
      name: "Ascend",
      completed: () => !canAscendCasual(),
      do: (): void => {
        prepareAscension({
          workshed: "Asdon Martin keyfob",
          garden: "packet of thanksgarden seeds",
          eudora: "New-You Club Membership Form",
          chateau: {
            desk: "Swiss piggy bank",
            nightstand: "electric muscle stimulator",
            ceiling: "ceiling fan",
          },
        });
        ascend(
          Paths.Unrestricted,
          $class`Seal Clubber`,
          Lifestyle.casual,
          "knoll",
          $item`astral six-pack`,
          undefined,
          getSkillsToPerm()
        );
      },
      limit: { tries: 1 },
    },
    duffo(),
    {
      name: "Run",
      ready: () => myPathId() === Paths.Unrestricted.id,
      completed: () => get("kingLiberated") && have($skill`Liver of Steel`),
      do: () => cliExecute("loopcasual"),
      limit: { tries: 1 },
      tracking: "Run",
    },
    {
      name: "Workshed",
      completed: () => get("_workshedItemUsed") || getWorkshed() === $item`cold medicine cabinet`,
      do: (): void => {
        AsdonMartin.drive($effect`Driving Observantly`, 1000);
        use($item`cold medicine cabinet`);
      },
      limit: { tries: 1 },
    },
    ...kingFreed(),
    ...breakfast(),
    {
      name: "Garbo",
      completed: () => shouldOverdrink() || myInebriety() > inebrietyLimit(),
      do: () => cliExecute("garbo"),
      limit: { tries: 1 },
      tracking: "Garbo",
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
      name: "Inbox",
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
      do: () => cliExecute(`raffle ${Math.random() * 10 + 1}`),
      limit: { tries: 1 },
    },
  ],
};
