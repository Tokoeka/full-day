import { myAdventures, myInebriety } from "kolmafia";
import { $familiar, get, withProperty } from "libram";
import { canConsume, cliExecuteThrow, stooperInebrietyLimit } from "../lib";
import { caldera, stooper } from "./common";
import { Strategy } from "./strategy";
import { args } from "../args";

export function freecandy(): Strategy {
  return {
    tasks: (ascend: boolean) => [
      {
        name: "CONSUME",
        completed: () => !canConsume(),
        do: () => cliExecuteThrow(`consume ALL VALUE ${args.minor.halloweenvoa} NOMEAT`),
        limit: { tries: 1 },
        tracking: "Garbo",
      },
      {
        name: "Garbo Nobarf",
        completed: () =>
          (get("_garboCompleted", "") !== "" && !canConsume()) ||
          myInebriety() >= stooperInebrietyLimit(),
        do: () => cliExecuteThrow(`garbo nobarf ${ascend ? "ascend" : ""}`),
        limit: { tries: 1 },
        tracking: "Garbo",
      },
      {
        name: "Freecandy",
        completed: () => myAdventures() < 5 || myInebriety() >= stooperInebrietyLimit(),
        do: () => cliExecuteThrow("freecandy"),
        outfit: {
          familiar: $familiar`Reagnimated Gnome`,
        },
        limit: { tries: 1 },
        tracking: "Freecandy",
      },
      stooper(),
      {
        name: "Overdrink",
        completed: () => myInebriety() > stooperInebrietyLimit(),
        do: () =>
          withProperty("spiceMelangeUsed", true, () =>
            cliExecuteThrow(
              `CONSUME VALUE ${args.minor.halloweenvoa} NIGHTCAP ${ascend ? "NOMEAT" : ""}`
            )
          ),
        outfit: { familiar: $familiar`Stooper` },
        limit: { tries: 1 },
      },
      ...(ascend ? [caldera()] : []),
      {
        name: "Overdrunk",
        ready: () => myInebriety() > stooperInebrietyLimit(),
        completed: () => myAdventures() < 5,
        do: () => cliExecuteThrow("freecandy"),
        outfit: {
          familiar: $familiar`Reagnimated Gnome`,
        },
        limit: { tries: 1 },
        tracking: "Freecandy",
      },
      ...(ascend
        ? [
            {
              name: "Combo",
              completed: () => myAdventures() === 0,
              do: () => cliExecuteThrow(`combo ${myAdventures()}`),
              limit: { tries: 1 },
            },
          ]
        : []),
    ],
  };
}
