import { $item } from "libram";
import { cliExecuteThrow } from "../lib";
import { Strategy } from "./strategy";
import { createStrategyTasks } from "./util";

export function baggo(): Strategy {
  return {
    tasks: createStrategyTasks("baggo", true),
    gyou: {
      pulls: [$item`mime army infiltration glove`, $item`human musk`, $item`tryptophan dart`],
      ronin: { do: () => cliExecuteThrow("baggo turns=-40") },
    },
  };
}
