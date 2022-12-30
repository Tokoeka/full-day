import { inebrietyLimit, myAdventures, myInebriety } from "kolmafia";
import { $familiar, withProperty } from "libram";
import { canConsume, cliExecuteThrow, stooperInebrietyLimit } from "../../lib";
import { caldera, stooper } from "./common";
import { Strategy } from "./strategy";

export function garbo(): Strategy {
  return {
    tasks: (ascend: boolean) => [
      {
        name: "Garbo",
        completed: () =>
          (myAdventures() === 0 && !canConsume()) || myInebriety() >= stooperInebrietyLimit(),
        do: () => cliExecuteThrow(`garbo yachtzeechain ${ascend ? "ascend" : ""}`),
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
