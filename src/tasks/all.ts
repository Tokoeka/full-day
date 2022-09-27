import { getTasks } from "grimoire-kolmafia";
import { Task } from "../engine/task";
import { AftercoreQuest } from "./aftercore";
import { CasualQuest } from "./casual";
import { CommunityServiceQuest } from "./communityservice";

export function all_tasks(): Task[] {
  const quests = [AftercoreQuest, CommunityServiceQuest, CasualQuest];
  return getTasks(quests);
}

export function aftercore_tasks(): Task[] {
  return getTasks([AftercoreQuest]);
}

export function communityservice_tasks(): Task[] {
  return getTasks([CommunityServiceQuest]);
}

export function casual_tasks(): Task[] {
  return getTasks([CasualQuest]);
}
