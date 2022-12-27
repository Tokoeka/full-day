import { Args } from "grimoire-kolmafia";
import { myAdventures, myInebriety } from "kolmafia";
import { $familiar, get, set, withProperty } from "libram";
import { Task } from "../../engine/task";
import { canConsume, cliExecuteThrow, stooperInebrietyLimit } from "../../lib";
import { args } from "../../main";
import { caldera, stooper } from "./common";

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function getScriptName(command: string): string {
  return capitalize(command.split(" ")[0]);
}

export function createStrategyTasks(
  command: string,
  overdrunk?: boolean
): (ascend: boolean) => Task[] {
  const argsScriptName = Args.getMetadata(args).scriptName;
  const commandScriptName = getScriptName(command);

  return (ascend: boolean) => [
    {
      name: "Garbo",
      completed: () => get(`_${argsScriptName}_completedGarbo`, false) && !canConsume(),
      do: () => cliExecuteThrow(`garbo yachtzeechain nobarf ${ascend ? "ascend" : ""}`),
      post: () => set(`_${argsScriptName}_completedGarbo`, true),
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
