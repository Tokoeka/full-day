import { myTurncount } from "kolmafia";
import { $item } from "libram";
import { cliExecuteThrow } from "../../lib";
import { Strategy } from "./strategy";
import { createStrategyTasks } from "./templates";

export const railo: Strategy = {
  tasks: createStrategyTasks("railo car=passenger"),
  gyou: {
    // eslint-disable-next-line libram/verify-constants
    pulls: [$item`Trainbot radar monocle`],
    ronin: () => cliExecuteThrow(`railo turns=${1000 - myTurncount()} car=caboose`),
    postronin: () => cliExecuteThrow("railo turns=-40 car=caboose"),
  },
};
