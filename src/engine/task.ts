import { Quest as BaseQuest, Task as BaseTask, Limit } from "grimoire-kolmafia";
import { Lifestyle } from "libram";
import { ascensionsToday } from "../lib";

export type Task = BaseTask & {
  tracking?: string;
  limit: Limit;
};
export type Quest = BaseQuest<Task>;

export enum Leg {
  Aftercore = 0,
  NonCasual = 1,
  Casual = 2,
}

export function getCurrentLeg(): number {
  const mostRecent = ascensionsToday().pop();
  switch (mostRecent) {
    case undefined:
      return Leg.Aftercore;
    case Lifestyle.casual:
      return Leg.Casual;
    case Lifestyle.normal:
    case Lifestyle.hardcore:
      return Leg.NonCasual;
  }
}
