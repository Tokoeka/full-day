import {
  cliExecute,
  myAdventures,
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
  globalOptions,
  organsFull,
  tryUse,
} from "./lib";

function tuneMoon(moon: string) {
  if (!get("moonTuned") && mySign().toLowerCase() !== moon.toLowerCase()) {
    cliExecute(`spoon ${moon}`);
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
  cliExecute("breakfast");
  cliExecute("Detective Solver.ash");
  if (ascend) {
    tuneMoon("Platypus");
    cliExecute("garbo ascend");
    withProperty("spiceMelangeUsed", true, () => cliExecute("CONSUME NIGHTCAP VALUE 3500"));
    cliExecute("garbo ascend");
    cliExecute("swagger");
  } else {
    AsdonMartin.drive($effect`Driving Observantly`, 1000);
    tryUse($item`cold medicine cabinet`);
    cliExecute("garbo");
    withProperty("spiceMelangeUsed", true, () => cliExecute("CONSUME NIGHTCAP"));
    cliExecute("maximize +adv +switch tot");
    considerClockworkMaid();
  }
  cliExecute("breakfast"); // harvest sea jelly after garbo unlocks the sea
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
      //     workshed: "Little Geneticist DNA-Splicing Lab",
      //     garden: "Peppermint Pip Packet",
      //     eudora: "New-You Club Membership Form",
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
      // cliExecute("loopcs");
      cliExecute("fizz-sccs.ash");
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
      cliExecute("loopcasual");
    },
  },
  {
    name: "Third Garbo",
    completed: () => globalOptions.noCasual || organsFull(),
    do: () => garbo(false),
  },
];
