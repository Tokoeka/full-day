import { inebrietyLimit, myAdventures, myInebriety } from "kolmafia";
import { $familiar, get, withProperty } from "libram";
import { canConsume, cliExecuteThrow, stooperInebrietyLimit } from "../lib";
import { caldera, stooper } from "./common";
import { Strategy } from "./strategy";
import { args } from "../args";

export function crimbo(): Strategy {
  return {
    tasks: (ascend: boolean) => [
      {
        name: "Garbo Nobarf",
        completed: () =>
          (get("_garboCompleted", "") !== "" && !canConsume()) ||
          myInebriety() >= stooperInebrietyLimit(),
        do: () =>
          withProperty("_shrubDecorated", true, () =>
            cliExecuteThrow(`garbo nobarf ${ascend ? "ascend" : ""}`)
          ),
        limit: { tries: 1 },
        tracking: "Garbo",
      },
      {
        name: "Crimbo",
        completed: () => myAdventures() === 0 || myInebriety() >= stooperInebrietyLimit(),
        do: () => cliExecuteThrow(args.minor.crimbostring),
        limit: { tries: 1 },
        tracking: "Crimbo",
      },
      stooper(),
      {
        name: "Overdrink",
        completed: () => myInebriety() > stooperInebrietyLimit(),
        do: () => withProperty("spiceMelangeUsed", true, () => cliExecuteThrow("CONSUME NIGHTCAP")),
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
              do: () => cliExecuteThrow(args.minor.crimbostring),
              limit: { tries: 1 },
              tracking: "Crimbo",
            },
          ]
        : []),
    ],
  };
}
