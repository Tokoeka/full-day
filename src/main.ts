/* eslint-disable @typescript-eslint/no-unused-vars */
import { buildTaskList, Engine } from "fizzlib";
import {
  gametimeToInt,
  historicalPrice,
  myHp,
  myMaxhp,
  print,
  todayToString,
  totalTurnsPlayed,
  userConfirm,
  useSkill,
} from "kolmafia";
import { $skill, get, set } from "libram";
import { commafy, convertMilliseconds, formatNumber, globalOptions } from "./lib";
import { Snapshot } from "./snapshot";
import { quests } from "./quests";

export function main(argString = ""): void {
  const args = argString.split(" ");
  for (const arg of args) {
    if (arg.match(/confirm/)) {
      globalOptions.confirmTasks = true;
    } else if (arg.match(/details/)) {
      globalOptions.printDetails = true;
    }
  }

  const dateProperty = "fullday_runDate";
  const turnsProperty = "fullday_initialTurns";
  const timeProperty = "fullday_elapsedTime";

  if (get(dateProperty) !== todayToString()) {
    set(dateProperty, todayToString());
    set(turnsProperty, totalTurnsPlayed());
    set(timeProperty, gametimeToInt());
  }

  const tasks = buildTaskList(quests);
  const engine = new Engine(tasks, {
    ignoredNoncombats: ["Caldera Air", "Aaaaah! Aaaaaaaah!"],
    recoveryCallback: () => {
      if (myHp() < myMaxhp() * 0.9) useSkill($skill`Cannelloni Cocoon`);
    },
    defaultOutfit: {},
  });

  let task;
  while ((task = engine.getNextTask()) !== undefined) {
    if (
      !task.completed() &&
      globalOptions.confirmTasks &&
      !userConfirm(`Executing task ${task.name}. Should we continue?`)
    )
      throw `User rejected execution of task ${task.name}`;

    const snapshot = Snapshot.current();
    const questName = task.name.split("/")[0];
    try {
      engine.execute(task);
    } finally {
      Snapshot.fromFile(questName).add(Snapshot.current().diff(snapshot)).toFile(questName);
    }
  }

  const questNames = new Set(engine.tasks.map((task) => task.name.split("/")[0]));
  const questSnapshots = new Map([...questNames].map((name) => [name, Snapshot.fromFile(name)]));
  const fullSnapshot = [...questSnapshots.values()].reduce((acc, val) => acc.add(val));
  const fullResult = fullSnapshot.value(historicalPrice);

  print("Full-day complete!", "purple");
  print(
    `Adventures used: ${commafy(totalTurnsPlayed() - get(turnsProperty, totalTurnsPlayed()))}`,
    "purple"
  );
  print(
    `Time elapsed: ${convertMilliseconds(gametimeToInt() - get(timeProperty, gametimeToInt()))}`,
    "purple"
  );
  print(`Profit earned: ${commafy(fullResult.total)} meat`, "purple");

  const message = (head: string, meat: number, items: number, color = "") =>
    print(
      `${head} ${commafy(meat + items)} meat, with ${commafy(meat)} raw meat and ${commafy(
        items
      )} from items`,
      color
    );

  // Summarize quest results
  message("You generated a total of", fullResult.meat, fullResult.items, "blue");
  for (const [name, snapshot] of questSnapshots) {
    const result = snapshot.value(historicalPrice);
    message(`* ${name} generated`, result.meat, result.items);
  }

  // // List the top gaining and losing items
  // const losers = fullResult.itemDetails.sort((a, b) => a.value - b.value).slice(0, 3);
  // const winners = fullResult.itemDetails.sort((a, b) => b.value - a.value).slice(0, 3);
  // print("Extreme items:", "blue");
  // for (const detail of [...winners, ...losers.reverse()]) {
  //   print(
  //     `${formatNumber(detail.quantity)} ${detail.item} worth ${formatNumber(detail.value)} total`
  //   );
  // }
}
