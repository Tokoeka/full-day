import { getWorkshed, inebrietyLimit, Item, myAdventures, myInebriety } from "kolmafia";
import { $effect, $familiar, $item, get, have, withProperty } from "libram";
import { canConsume, cliExecuteThrow, stooperInebrietyLimit } from "../lib";
import { caldera, stooper } from "./common";
import { Strategy } from "./strategy";

function chooseWorkshed(): Item {
  if (getWorkshed() !== $item`Asdon Martin keyfob` && !have($effect`Driving Observantly`)) {
    return $item`Asdon Martin keyfob`;
  }
  if (getWorkshed() !== $item`cold medicine cabinet`) {
    return $item`cold medicine cabinet`;
  }
  return $item`model train set`;
}

export function garbo(): Strategy {
  return {
    tasks: (ascend: boolean) => [
      {
        name: "Garbo",
        completed: () =>
          (get("_garboCompleted", "") !== "" && myAdventures() === 0 && !canConsume()) ||
          myInebriety() >= stooperInebrietyLimit(),
        do: () =>
          cliExecuteThrow(
            `garbo yachtzeechain ${ascend ? "ascend" : ""} workshed="${chooseWorkshed()}"`
          ),
        limit: { tries: 1 },
        tracking: "Garbo",
      },
      stooper(),
      {
        name: "Overdrink",
        completed: () => myInebriety() > stooperInebrietyLimit(),
        do: () =>
          withProperty("spiceMelangeUsed", true, () =>
            cliExecuteThrow(`CONSUME NIGHTCAP ${ascend ? "VALUE 3250" : ""}`)
          ),
        outfit: { familiar: $familiar`Stooper` },
        limit: { tries: 1 },
      },
      ...(ascend
        ? [
            caldera(),
            {
              name: "Overdrunk",
              ready: () => myInebriety() > inebrietyLimit(),
              completed: () => myAdventures() === 0,
              do: () => cliExecuteThrow("garbo ascend"),
              limit: { tries: 1 },
              tracking: "Garbo",
            },
          ]
        : []),
    ],
  };
}
