import { historicalPrice, isTradeable, print, userConfirm } from "kolmafia";
import { formatNumber, globalOptions } from "./lib";
import { Snapshot } from "./snapshot";
import { tasks } from "./tasks";

export function main(argString = ""): void {
  const args = argString.split(" ");
  for (const arg of args) {
    if (arg.match(/confirm/)) {
      globalOptions.confirmTasks = true;
    } else if (arg.match(/nocasual/)) {
      globalOptions.noCasual = true;
    } else if (arg.match(/debug/)) {
      globalOptions.debugSnapshot = true;
    }
  }

  if (globalOptions.debugSnapshot) {
    const firstGarbo = Snapshot.fromFile("First Garbo");
    const CS = Snapshot.fromFile("Community Service");
    const diff = CS.diff(firstGarbo);
    for (const [item, amount] of diff.items) {
      if (isTradeable(item)) print(`${item} (${amount}): ${historicalPrice(item)}`);
    }
    const result = diff.value(historicalPrice);
    print(`meat: ${formatNumber(result.meat)}`);
    print(`items: ${formatNumber(result.items)}`);
    throw "Verify snapshot contents";
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

  const message = (head: string, meat: number, items: number, color = "black") =>
    print(
      `${head} ${formatNumber(meat + items)} meat, with ${formatNumber(
        meat
      )} raw meat and ${formatNumber(items)} from items`,
      color
    );

  print("Full-day complete!", "purple");
  const fullSnapshot = snapshots[snapshots.length - 1].diff(snapshots[0]);
  const fullResult = fullSnapshot.value(historicalPrice);
  message("You generated a total of", fullResult.meat, fullResult.items, "purple");
  snapshots.slice(1).forEach((snapshot, index) => {
    const taskSnapshot = snapshot.diff(snapshots[index]);
    const taskResult = taskSnapshot.value(historicalPrice);
    message(`* ${tasks[index].name} generated`, taskResult.meat, taskResult.items, "gray");
  });

  // list the top 3 gaining and top 3 losing items
  const losers = fullResult.itemDetails.sort((a, b) => a.value - b.value).slice(0, 3);
  const winners = fullResult.itemDetails.sort((a, b) => b.value - a.value).slice(0, 3);
  print("Extreme items:", "purple");
  for (const detail of [...winners, ...losers.reverse()]) {
    print(
      `${formatNumber(detail.quantity)} ${detail.item} worth ${formatNumber(detail.value)} total`,
      "gray"
    );
  }
}
