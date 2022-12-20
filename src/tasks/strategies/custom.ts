import { myAdventures, myInebriety } from "kolmafia";
import { $familiar, get, set, withProperty } from "libram";
import { Task } from "../../engine/task";
import { canConsume, cliExecuteThrow, stooperInebrietyLimit } from "../../lib";
import { args } from "../../main";
import { caldera, stooper } from "./common";

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function custom(ascend: boolean): Task[] {
  const scriptName = capitalize(args.major.strategy.split(" ")[0]);
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
      name: scriptName,
      completed: () => myAdventures() === 0 || myInebriety() >= stooperInebrietyLimit(),
      do: () => cliExecuteThrow(args.major.strategy),
      limit: { tries: 1 },
      tracking: scriptName,
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
    ...(ascend
      ? [
          caldera(),
          {
            name: "Overdrunk",
            ready: () => myInebriety() > stooperInebrietyLimit(),
            completed: () => myAdventures() === 0,
            do: () => cliExecuteThrow(args.major.strategy),
            limit: { tries: 1 },
            tracking: scriptName,
          },
        ]
      : []),
  ];
}
