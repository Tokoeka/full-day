import {
  adv1,
  fullnessLimit,
  handlingChoice,
  inebrietyLimit,
  itemAmount,
  lastChoice,
  myAdventures,
  myAscensions,
  myFullness,
  myInebriety,
  mySign,
  mySpleenUse,
  spleenLimit,
  toInt,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  ascend,
  ensureEffect,
  get,
  have,
  Lifestyle,
  Macro,
  Paths,
  prepareAscension,
  Requirement,
  withProperty,
} from "libram";
import { canAscendNoncasual, cliExecuteThrow, isDMTDuplicable } from "./lib";

const DUPLICATE_ITEM = $item`very fancy whiskey`;
if (!isDMTDuplicable(DUPLICATE_ITEM))
  throw `Cannot duplicate ${DUPLICATE_ITEM} in the DMT choice adventure`;

export type Quest = {
  name: string;
  tasks: Task[];
};

export type Task = {
  name: string;
  ready?: () => boolean;
  completed: () => boolean;
  do: () => void;
};

function tuneMoon(moon: string) {
  if (!get("moonTuned") && mySign().toLowerCase() !== moon.toLowerCase()) {
    cliExecuteThrow(`spoon ${moon}`);
  }
}

const garboAscendTask: Task = {
  name: "Garbo",
  completed: () =>
    myFullness() >= fullnessLimit() &&
    myInebriety() >= inebrietyLimit() &&
    mySpleenUse() >= spleenLimit() &&
    myAdventures() === 0,
  do: (): void => {
    cliExecuteThrow("Detective Solver.ash");
    tuneMoon("Platypus");
    cliExecuteThrow("garbo ascend");
  },
};

const overdrinkAscendTask: Task = {
  name: "Overdrink",
  completed: () => myInebriety() > inebrietyLimit() && myAdventures() === 0,
  do: (): void => {
    withProperty("spiceMelangeUsed", true, () => cliExecuteThrow("CONSUME NIGHTCAP VALUE 3500"));
    cliExecuteThrow("garbo ascend");
    cliExecuteThrow("breakfast"); // harvest sea jelly after garbo unlocks the sea
    cliExecuteThrow("swagger");
  },
};

const duplicateTask: Task = {
  name: "Duplicate",
  ready: () =>
    myAdventures() > 0 && itemAmount(DUPLICATE_ITEM) > 0 && get("encountersUntilDMTChoice") < 1,
  completed: () => get("lastDMTDuplication") >= myAscensions(),
  do: () => {
    useFamiliar($familiar`Machine Elf`);
    visitUrl("adventure.php?snarfblat=458");
    if (!handlingChoice() || lastChoice() !== 1119) {
      visitUrl("choice.php?pwd&whichchoice=1119&option=4");
      visitUrl(`choice.php?whichchoice=1125&pwd&option=1&iid=${toInt(DUPLICATE_ITEM)}`);
    }
  },
};

const doghouseVolcoinoTask: Task = {
  name: "Doghouse Volcoino",
  ready: () => myAdventures() > 0,
  completed: () =>
    $location`The Bubblin' Caldera`.noncombatQueue.includes("Lava Dogs") ||
    $location`The Bubblin' Caldera`.turnsSpent > 5,
  do: () => {
    ensureEffect($effect`A Few Extra Pounds`);
    new Requirement(["mainstat"], {
      forceEquip: $items`Fourth of May Cosplay Saber, Mr. Screege's spectacles, mafia thumb ring, lucky gold ring`,
    }).maximize();
    adv1($location`The Bubblin' Caldera`, -1, Macro.attack().repeat().toString());
    if (have($effect`Beaten Up`)) throw "Fight was lost; stop.";
  },
};

export const FirstGarboQuest: Quest = {
  name: "First Garbo",
  tasks: [garboAscendTask, overdrinkAscendTask],
};

export const CommunityServiceQuest: Quest = {
  name: "Community Service",
  tasks: [
    {
      name: "Ascend",
      completed: () => !canAscendNoncasual(),
      do: (): void => {
        prepareAscension({
          workshed: "Little Geneticist DNA-Splicing Lab",
          garden: "Peppermint Pip Packet",
          eudora: "New-You Club Membership Form",
          chateau: {
            desk: "Swiss piggy bank",
            nightstand: "foreign language tapes",
            ceiling: "ceiling fan",
          },
        });
        ascend(
          Paths.CommunityService,
          $class`Sauceror`,
          Lifestyle.softcore,
          "knoll",
          $item`astral six-pack`,
          $item`astral chapeau`
        );
      },
    },
    {
      name: "Free King",
      completed: () => get("kingLiberated"),
      do: () => cliExecuteThrow("fizz-sccs.ash"),
    },
  ],
};

export const SecondGarboQuest: Quest = {
  name: "Second Garbo",
  tasks: [duplicateTask, doghouseVolcoinoTask, garboAscendTask, overdrinkAscendTask],
};
