import { Strategy } from "./strategy";
import { createStrategyTasks } from "./util";

export function chrono(): Strategy {
  return { tasks: createStrategyTasks("chrono mode=future", true) };
}
