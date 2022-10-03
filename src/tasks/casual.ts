import { Quest } from "../engine/task";
import {
  cliExecute,
  getWorkshed,
  maximize,
  myAdventures,
  myInebriety,
  myPath,
  numericModifier,
  retrieveItem,
  retrievePrice,
  use,
} from "kolmafia";
import {
  $class,
  $effect,
  $familiar,
  $item,
  $path,
  $skill,
  ascend,
  AsdonMartin,
  get,
  have,
  haveInCampground,
  Kmail,
  Lifestyle,
  prepareAscension,
  withProperty,
} from "libram";
import { canAscendCasual, canConsume, getSkillsToPerm, stooperInebrietyLimit } from "../lib";
import { breakfast, duffo, kingFreed, menagerie, stooper } from "./common";

const kmailSendersToDelete = [
  "Lady Spookyraven's Ghost",
  "The Loathing Postal Service",
  "CheeseFax",
];

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
          $path`none`,
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
    ...duffo(),
    {
      name: "Run",
      ready: () => myPath() === $path`none`,
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
    ...menagerie(),
    {
      name: "Garbo",
      completed: () =>
        (myAdventures() === 0 && !canConsume()) || myInebriety() >= stooperInebrietyLimit(),
      do: () => cliExecute("garbo"),
      limit: { tries: 1 },
      tracking: "Garbo",
    },
    stooper(),
    {
      name: "Overdrink",
      completed: () => myInebriety() > stooperInebrietyLimit(),
      do: () => withProperty("spiceMelangeUsed", true, () => cliExecute("CONSUME NIGHTCAP")),
      outfit: { familiar: $familiar`Stooper` },
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
      name: "Inbox",
      completed: () =>
        Kmail.inbox().filter((k) => kmailSendersToDelete.includes(k.senderName)).length === 0,
      do: () =>
        Kmail.delete(Kmail.inbox().filter((k) => kmailSendersToDelete.includes(k.senderName))),
      limit: { tries: 1 },
    },
    {
      name: "Raffle",
      completed: () => have($item`raffle ticket`),
      do: () => cliExecute(`raffle ${Math.random() * 10 + 1}`),
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
  ],
};
