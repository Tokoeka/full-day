import { Quest as BaseQuest, Task as BaseTask, Limit } from "grimoire-kolmafia";
import { myDaycount } from "kolmafia";

export type Task = BaseTask & {
  limit: Limit;
  tracking?: string;
};
export type Quest = BaseQuest<Task>;

export function ascendedToday(): boolean {
  return myDaycount() === 1;
}
