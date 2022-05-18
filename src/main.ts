import { historicalPrice, print, userConfirm } from "kolmafia";
import { globalOptions } from "./lib";
import { Snapshot } from "./snapshot";
import { tasks } from "./tasks";

function numberWithCommas(x: number): string {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function main(argString = ""): void {
  const args = argString.split(" ");
  for (const arg of args) {
    if (arg.match(/confirm/)) {
      globalOptions.confirmTasks = true;
    }
  }

  const initialSnapshot = Snapshot.createOrImport("Start");
  for (const task of tasks) {
    if (!task.completed()) {
      if (globalOptions.confirmTasks)
        if (!userConfirm(`Executing task ${task.name}. Should we continue?`))
          throw `User rejected execution of task ${task.name}`;
      task.do();
      if (!task.completed()) throw `Failed to completed task ${task.name}`;
      Snapshot.current().toFile(task.name);
    }
  }
  const finalSnapshot = Snapshot.createOrImport("Finish");

  // summarize profit, this could be better
  let prevSnapshot = initialSnapshot;
  tasks.forEach((task) => {
    print(`${task.name} Results:`);
    const snapshot = Snapshot.fromFile(task.name);
    const result = snapshot.diff(prevSnapshot).value(historicalPrice);
    print(`* Meat: ${numberWithCommas(result.meat)}`);
    print(`* Items: ${numberWithCommas(result.items)}`);
    print(`* Total: ${numberWithCommas(result.total)}`);
    prevSnapshot = snapshot;
  });

  const fullSnapshot = finalSnapshot.diff(initialSnapshot);
  const fullResult = fullSnapshot.value(historicalPrice);

  print("Full Results:");
  print(`* Meat: ${numberWithCommas(fullResult.meat)}`);
  print(`* Items: ${numberWithCommas(fullResult.items)}`);
  print(`* Total: ${numberWithCommas(fullResult.total)}`);
}
