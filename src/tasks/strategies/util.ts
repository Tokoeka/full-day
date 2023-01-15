import { myAdventures, myInebriety } from "kolmafia";
import { $familiar, get, withProperty } from "libram";
import { Task } from "../../engine/task";
import { canConsume, cliExecuteThrow, stooperInebrietyLimit } from "../../lib";
import { caldera, stooper } from "./common";

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function getScriptName(command: string): string {
  return capitalize(command.split(" ")[0]);
}

export function createStrategyTasks(
  command: string,
  overdrunk = false
): (ascend: boolean) => Task[] {
  const commandScriptName = getScriptName(command);

  return (ascend: boolean) => [
    {
      name: "Garbo Nobarf",
      completed: () =>
        (get("_garboCompleted", "") !== "" && !canConsume()) ||
        myInebriety() >= stooperInebrietyLimit(),
      do: () => cliExecuteThrow(`garbo yachtzeechain nobarf ${ascend ? "ascend" : ""}`),
      limit: { tries: 1 },
      tracking: "Garbo",
    },
    {
      name: commandScriptName,
      completed: () => myAdventures() === 0 || myInebriety() >= stooperInebrietyLimit(),
      do: () => cliExecuteThrow(command),
      limit: { tries: 1 },
      tracking: commandScriptName,
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
            do: () => cliExecuteThrow(overdrunk ? command : "garbo ascend"),
            limit: { tries: 1 },
            tracking: commandScriptName,
          },
        ]
      : []),
  ];
}
