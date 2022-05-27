import {
  inebrietyLimit,
  myAdventures,
  myInebriety,
  mySign,
  numericModifier,
  retrieveItem,
  retrievePrice,
  use,
} from "kolmafia";
import {
  $class,
  $effect,
  $item,
  ascend,
  AsdonMartin,
  get,
  haveInCampground,
  Lifestyle,
  Paths,
  prepareAscension,
  withProperty,
} from "libram";
import { kingFreed } from "./kingfreed";
import {
  ascensionsToday,
  canAscendCasual,
  canAscendNoncasual,
  cliExecuteThrow,
  globalOptions,
  organsFull,
  tryUse,
} from "./lib";

function tuneMoon(moon: string) {
  if (!get("moonTuned") && mySign().toLowerCase() !== moon.toLowerCase()) {
    cliExecuteThrow(`spoon ${moon}`);
  }
}

function considerClockworkMaid(): void {
  if (
    !haveInCampground($item`clockwork maid`) &&
    numericModifier($item`clockwork maid`, "Adventures") * get("valueOfAdventure") >
      retrievePrice($item`clockwork maid`)
  ) {
    retrieveItem($item`clockwork maid`);
    use($item`clockwork maid`);
  }
}

function garbo(ascend: boolean) {
  kingFreed();
  cliExecuteThrow("breakfast");
  cliExecuteThrow("Detective Solver.ash");
  tuneMoon("Platypus");
  if (ascend) {
    cliExecuteThrow("garbo ascend");
    if (myInebriety() <= inebrietyLimit() && myAdventures() > 0)
      throw "Not ready to overdrink; organ space and/or adventures remaining";
    withProperty("spiceMelangeUsed", true, () => cliExecuteThrow("CONSUME NIGHTCAP VALUE 3500"));
    cliExecuteThrow("garbo ascend");
    cliExecuteThrow("swagger");
  } else {
    AsdonMartin.drive($effect`Driving Observantly`, 1000);
    tryUse($item`cold medicine cabinet`);
    cliExecuteThrow("garbo");
    if (myInebriety() <= inebrietyLimit() && myAdventures() > 0)
      throw "Not ready to overdrink; organ space and/or adventures remaining";
    withProperty("spiceMelangeUsed", true, () => cliExecuteThrow("CONSUME NIGHTCAP"));
    cliExecuteThrow("maximize +adv +switch tot");
    considerClockworkMaid();
  }
  cliExecuteThrow("breakfast"); // harvest sea jelly after garbo unlocks the sea
}

export type Task = {
  name: string;
  completed: () => boolean;
  do: () => void;
};

export const tasks: Task[] = [
  {
    name: "First Garbo",
    completed: () => ascensionsToday() > 0 || (organsFull() && myAdventures() === 0),
    do: () => garbo(true),
  },
  {
    name: "Community Service",
    completed: () => ascensionsToday() > 1 || (!canAscendNoncasual() && get("kingLiberated")),
    do: (): void => {
      // if (canAscendNoncasual()) {
      //   prepareAscension({
      //     workshed: "cold medicine cabinet",
      //     garden: "Peppermint Pip Packet",
      //     eudora: "Our Daily Candles™ order form",
      //     chateau: {
      //       desk: "continental juice bar",
      //       nightstand: "foreign language tapes",
      //       ceiling: "ceiling fan",
      //     },
      //   });
      //   ascend(
      //     Paths.CommunityService,
      //     $class`Pastamancer`,
      //     Lifestyle.softcore,
      //     "knoll",
      //     $item`astral six-pack`,
      //     $item`astral chapeau`
      //   );
      // }
      // cliExecuteThrow("loopcs");
      cliExecuteThrow("fizz-sccs.ash");
    },
  },
  {
    name: "Second Garbo",
    completed: () => ascensionsToday() > 1 || (organsFull() && myAdventures() === 0),
    do: () => garbo(true),
  },
  {
    name: "Casual",
    completed: () => globalOptions.noCasual || (!canAscendCasual() && get("kingLiberated")),
    do: (): void => {
      if (canAscendCasual()) {
        prepareAscension({
          workshed: "Asdon Martin keyfob",
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
          $item`astral six-pack`
        );
      }
      cliExecuteThrow("loopcasual");
    },
  },
  {
    name: "Third Garbo",
    completed: () => globalOptions.noCasual || organsFull(),
    do: () => garbo(false),
  },
];
