import { myTurncount } from "kolmafia";
import { $item } from "libram";
import { cliExecuteThrow } from "../../lib";
import { Strategy } from "./strategy";
import { createStrategyTasks } from "./util";

export function baggo(): Strategy {
  return {
    tasks: createStrategyTasks("baggo", true),
    gyou: {
      pulls: [$item`human musk`],
      ronin: () => cliExecuteThrow(`baggo turns=${1000 - myTurncount()}`),
      postronin: () => cliExecuteThrow("baggo turns=-40"),
    },
  };
}
