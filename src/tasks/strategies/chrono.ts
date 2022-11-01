import { myAdventures, myInebriety } from "kolmafia";
import { $familiar, get, set, withProperty } from "libram";
import { Task } from "../../engine/task";
import { canConsume, cliExecuteThrow, stooperInebrietyLimit } from "../../lib";
import { caldera, stooper } from "./common";

export function chrono(ascend: boolean): Task[] {
  const tasks: Task[] = [
    {
      name: "Garbo",
      completed: () => get("_fullday_completedGarbo", false) && !canConsume(),
      do: () => cliExecuteThrow(`garbo yachtzeechain nobarf ${ascend ? "ascend" : ""}`),
      post: () => set("_fullday_completedGarbo", true),
      limit: { tries: 1 },
      tracking: "Garbo",
    },
    {
      name: "Chrono",
      completed: () => myAdventures() === 0 || myInebriety() >= stooperInebrietyLimit(),
      do: () => cliExecuteThrow("chrono"),
      limit: { tries: 1 },
      tracking: "Chrono",
    },
    stooper(),
    {
      name: "Overdrink",
      completed: () => myInebriety() > stooperInebrietyLimit(),
      do: () =>
        withProperty("spiceMelangeUsed", true, () =>
          cliExecuteThrow(`CONSUME NIGHTCAP ${ascend ? "NOMEAT" : ""}`)
        ),
      outfit: { familiar: $familiar`Stooper` },
      limit: { tries: 1 },
    },
  ];

  if (ascend) {
    tasks.push(caldera());
    tasks.push({
      name: "Overdrunk",
      ready: () => myInebriety() > stooperInebrietyLimit(),
      completed: () => myAdventures() === 0,
      do: () => cliExecuteThrow("chrono"),
      limit: { tries: 1 },
      tracking: "Chrono",
    });
  }

  return tasks;
}
