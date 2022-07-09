import { ascensionsToday } from "./lib";
import {
  breakfastTask,
  clockworkMaidTask,
  detectiveSolverTask,
  doghouseVolcoinoTask,
  drunkGarboTask,
  garboAscendTask,
  garboTask,
  overdrinkAscendTask,
  overdrinkTask,
  pajamasTask,
  pvpTask,
  tuneMoonTask,
} from "./tasks/garbo";
import { csAscendTask, csFreeKingTask, uneffectLostTask } from "./tasks/communityservice";
import { casualAscendTask, casualFreeKingTask, cleanInboxTask, workshedTask } from "./tasks/casual";
import { kingFreedTasks } from "./tasks/kingfreed";
import { Quest } from "fizzlib";

export const firstGarboQuest: Quest = {
  name: "First Garbo",
  completed: () => ascensionsToday() > 0,
  tasks: [
    breakfastTask,
    detectiveSolverTask,
    tuneMoonTask,
    garboAscendTask,
    overdrinkAscendTask,
    doghouseVolcoinoTask,
    drunkGarboTask,
    pvpTask,
  ],
};

export const communityServiceQuest: Quest = {
  name: "Community Service",
  completed: () => ascensionsToday() > 1,
  tasks: [csAscendTask, csFreeKingTask, uneffectLostTask],
};

export const secondGarboQuest: Quest = {
  name: "Second Garbo",
  completed: () => ascensionsToday() > 1,
  tasks: [
    ...kingFreedTasks,
    breakfastTask,
    detectiveSolverTask,
    tuneMoonTask,
    garboAscendTask,
    overdrinkAscendTask,
    doghouseVolcoinoTask,
    drunkGarboTask,
    pvpTask,
  ],
};

export const casualQuest: Quest = {
  name: "Casual",
  tasks: [casualAscendTask, casualFreeKingTask, cleanInboxTask, workshedTask],
};

export const thirdGarboQuest: Quest = {
  name: "Third Garbo",
  tasks: [
    ...kingFreedTasks,
    breakfastTask,
    detectiveSolverTask,
    tuneMoonTask,
    garboTask,
    overdrinkTask,
    clockworkMaidTask,
    pajamasTask,
  ],
};

export const quests = [
  firstGarboQuest,
  communityServiceQuest,
  secondGarboQuest,
  casualQuest,
  thirdGarboQuest,
];
