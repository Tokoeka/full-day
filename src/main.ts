import { Args, getTasks } from "grimoire-kolmafia";
import { print } from "kolmafia";
import { args } from "./args";
import { Engine } from "./engine/engine";
import { garboValue } from "./engine/profits";
import { cleanInbox, debug, numberWithCommas } from "./lib";
import { Snapshot } from "./snapshot";
import { aftercoreQuest } from "./tasks/aftercore";
import { casualQuest } from "./tasks/casual";
import { csQuest } from "./tasks/cs";
import { reposQuest } from "./tasks/repos";

const snapshotStart = Snapshot.importOrCreate("Start");

export function main(command?: string): void {
  Args.fill(args, command);
  if (args.help) {
    Args.showHelp(args);
    return;
  }

  if (args.major.strategy === "freecandy") {
    args.minor.voa = 15000;
  }

  const quests = [reposQuest, ...getQuests(args.major.path)];
  const tasks = getTasks(quests);

  // Abort during the prepare() step of the specified task
  if (args.debug.abort) {
    const to_abort = tasks.find((task) => task.name === args.debug.abort);
    if (!to_abort) throw `Unable to identify task ${args.debug.abort}`;
    to_abort.prepare = (): void => {
      throw `Abort requested on task ${to_abort.name}`;
    };
  }

  const engine = new Engine(tasks, args.debug.completedtasks?.split(",") ?? [], "fullday");
  try {
    if (args.debug.list) {
      listTasks(engine);
      return;
    }

    engine.run();
  } finally {
    engine.destruct();
    cleanInbox();
  }

  printFulldaySnapshot();
}

function getQuests(path: string) {
  switch (path) {
    case "cs":
      return [aftercoreQuest(true), csQuest()];
    case "casual":
      return [aftercoreQuest(true), casualQuest()];
    case "custom":
      return [aftercoreQuest(true)];
    case "none":
      return [aftercoreQuest(false)];
    default:
      throw `Unknown path type ${path}`;
  }
}

function listTasks(engine: Engine): void {
  for (const task of engine.tasks) {
    if (task.completed()) {
      debug(`${task.name}: Done`, "blue");
    } else if (engine.available(task)) {
      debug(`${task.name}: Available`);
    } else {
      debug(`${task.name}: Not Available`, "red");
    }
  }
}

function printFulldaySnapshot() {
  const { meat, items, itemDetails } = Snapshot.current().diff(snapshotStart).value(garboValue);
  const winners = itemDetails.sort((a, b) => b.value - a.value).slice(0, 5);
  const losers = itemDetails.sort((a, b) => b.value - a.value).slice(-5);

  print("");
  print(
    `So far today, you have generated ${numberWithCommas(
      meat + items
    )} meat, with ${numberWithCommas(meat)} raw meat and ${numberWithCommas(items)} from items`
  );
  print("Extreme Items:");
  for (const detail of [...winners, ...losers]) {
    print(
      `${numberWithCommas(detail.quantity)} ${detail.item} worth ${numberWithCommas(
        Math.round(detail.value)
      )} total`
    );
  }
}
