import { myAdventures, myInebriety } from "kolmafia";
import { $familiar, get, set, withProperty } from "libram";
import { Task } from "../../engine/task";
import { canConsume, cliExecuteThrow, stooperInebrietyLimit } from "../../lib";
import { caldera, stooper } from "./common";

export function baggo(ascend: boolean): Task[] {
  return [
    {
      name: "Garbo",
      completed: () => get("_fullday_completedGarbo", false) && !canConsume(),
      do: () => cliExecuteThrow(`garbo yachtzeechain nobarf ${ascend ? "ascend" : ""}`),
      post: () => set("_fullday_completedGarbo", true),
      limit: { tries: 1 },
      tracking: "Garbo",
    },
    {
      name: "Baggo",
      completed: () => myAdventures() === 0 || myInebriety() >= stooperInebrietyLimit(),
      do: () => cliExecuteThrow("baggo"),
      limit: { tries: 1 },
      tracking: "Baggo",
    },
    stooper(),
    {
      name: "Overdrink",
      completed: () => myInebriety() > stooperInebrietyLimit(),
      do: () =>
        withProperty("spiceMelangeUsed", true, () =>
          cliExecuteThrow(`CONSUME NIGHTCAP ${ascend ? "NOMEAT VALUE 3250" : ""}`)
        ),
      outfit: { familiar: $familiar`Stooper` },
      limit: { tries: 1 },
    },
    ...(ascend
      ? [
          caldera(),
          {
            name: "Overdrunk",
            ready: () => myInebriety() > stooperInebrietyLimit(),
            completed: () => myAdventures() === 0,
            do: () => cliExecuteThrow("garbo"),
            limit: { tries: 1 },
            tracking: "Garbo",
          },
        ]
      : []),
  ];
}
