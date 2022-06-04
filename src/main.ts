import {
  gametimeToInt,
  historicalPrice,
  print,
  todayToString,
  totalTurnsPlayed,
  userConfirm,
} from "kolmafia";
import { get, Kmail, set } from "libram";
import { convertMilliseconds, formatNumber, globalOptions } from "./lib";
import { Snapshot } from "./snapshot";
import { tasks } from "./tasks";

export function main(argString = ""): void {
  const args = argString.split(" ");
  for (const arg of args) {
    if (arg.match(/confirm/)) {
      globalOptions.confirmTasks = true;
    } else if (arg.match(/details/)) {
      globalOptions.printDetails = true;
    } else if (arg.match(/nocasual/)) {
      globalOptions.noCasual = true;
    }
  }

  const date_property = "fulldayRunDate";
  const turns_property = "fulldayInitialTurns";
  const time_property = "fulldayElapsedTime";

  if (get(date_property) !== todayToString()) {
    set(date_property, todayToString());
    set(turns_property, totalTurnsPlayed());
    set(time_property, gametimeToInt());
  }

  const snapshots = [Snapshot.createOrImport("Start")];
  for (const task of tasks) {
    if (!task.completed()) {
      if (globalOptions.confirmTasks)
        if (!userConfirm(`Executing task ${task.name}. Should we continue?`))
          throw `User rejected execution of task ${task.name}`;
      task.do();
      if (!task.completed()) throw `Failed to completed task ${task.name}`;
    }
    snapshots.push(Snapshot.createOrImport(task.name));
  }

  Kmail.delete(
    Kmail.inbox().filter((k) =>
      ["Lady Spookyraven's Ghost", "The Loathing Postal Service"].includes(k.senderName)
    )
  );

  const fullSnapshot = snapshots[snapshots.length - 1].diff(snapshots[0]);
  const fullResult = fullSnapshot.value(historicalPrice);

  print("Full-day complete!", "purple");
  print(
    `Adventures used: ${formatNumber(
      totalTurnsPlayed() - get(turns_property, totalTurnsPlayed())
    )}`,
    "purple"
  );
  print(
    `Time elapsed: ${convertMilliseconds(gametimeToInt() - get(time_property, gametimeToInt()))}`,
    "purple"
  );
  print(`Profit earned: ${formatNumber(fullResult.total)} meat`, "purple");

  if (globalOptions.printDetails) {
    const message = (head: string, meat: number, items: number, color = "black") =>
      print(
        `${head} ${formatNumber(meat + items)} meat, with ${formatNumber(
          meat
        )} raw meat and ${formatNumber(items)} from items`,
        color
      );

    // summarize task results
    message("You generated a total of", fullResult.meat, fullResult.items, "blue");
    snapshots.slice(1).forEach((snapshot, index) => {
      const taskSnapshot = snapshot.diff(snapshots[index]);
      const taskResult = taskSnapshot.value(historicalPrice);
      message(`* ${tasks[index].name} generated`, taskResult.meat, taskResult.items);
    });

    // list the top 3 gaining and top 3 losing items
    const losers = fullResult.itemDetails.sort((a, b) => a.value - b.value).slice(0, 3);
    const winners = fullResult.itemDetails.sort((a, b) => b.value - a.value).slice(0, 3);
    print("Extreme items:", "blue");
    for (const detail of [...winners, ...losers.reverse()]) {
      print(
        `${formatNumber(detail.quantity)} ${detail.item} worth ${formatNumber(detail.value)} total`
      );
    }
  }
}
