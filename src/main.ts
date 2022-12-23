import { Args, getTasks } from "grimoire-kolmafia";
import { gametimeToInt, Item, print } from "kolmafia";
import { $item, get, Kmail, set } from "libram";
import { Engine } from "./engine/engine";
import { garboValue } from "./engine/profits";
import { debug, numberWithCommas } from "./lib";
import { Snapshot } from "./snapshot";
import { aftercoreQuest } from "./tasks/aftercore";
import { casualQuest } from "./tasks/casual";
import { csQuest } from "./tasks/cs";
import { gyouQuest } from "./tasks/gyou";

/** TODOs
 * improve goto pickpocketing task: banishes, init equipment
 */

const snapshotStart = Snapshot.importOrCreate("Start");

export const args = Args.create("fullday", "A full-day wrapper script.", {
  major: Args.group("Major Options", {
    path: Args.string({
      help: "Non-casual path to ascend into.",
      options: [
        ["cs", "Community Service"],
        ["gyou", "Grey You"],
      ],
      default: "gyou",
    }),
    strategy: Args.string({
      help: "Farming strategy to use. The currently implemented strategies are garbo, freecandy, and baggo.",
      default: "garbo",
    }),
    roninfarm: Args.string({
      help: "Command to be run at the start of gyou ronin farming. For best effect, make sure that it stops when your turncount reaches 1000.",
    }),
    postroninfarm: Args.string({
      help: "Command to be run at the start of post-gyou ronin farming. For best effect, make sure that it stops when your remaining adventures are 40.",
    }),
  }),
  minor: Args.group("Minor Options", {
    tune: Args.string({
      help: "Which moon sign to tune using the hewn moon-rune spoon.",
      options: [
        ["Mongoose", "friendly Degrassi Knoll | Muscle | +20% Physical Damage"],
        ["Wallaby", "friendly Degrassi Knoll | Mysticality | +20% Spell Damage"],
        ["Vole", "friendly Degrassi Knoll | Moxie | +20% Combat Initiative and +20 Maximum HP/MP"],
        ["Platypus", "Little Canadia | Muscle | Familiar Weight +5 lbs."],
        ["Opossum", "Little Canadia | Mysticality | +5 Adventures per day from Food "],
        ["Marmot", "Little Canadia 	Moxie | Slight Resistance to All Elements (+1)"],
        ["Wombat", "The Gnomish Gnomad Camp | Muscle | +20% Meat from Monsters"],
        ["Blender", "The Gnomish Gnomad Camp | Mysticality | +5 Adventures per day from Booze"],
        ["Packrat", "The Gnomish Gnomad Camp | Moxie | +10% Items from Monsters"],
      ],
      default: "Platypus",
    }),
    duplicate: Args.custom(
      {
        help: "Item to duplicate in the Deep Machine Tunnels.",
        default: $item`Daily Affirmation: Always be Collecting`,
      },
      Item.get,
      "ITEM"
    ),
    maxmeat: Args.number({
      help: "Maximum amount of meat to keep in inventory after breaking the prism.",
      default: 2_000_000,
    }),
  }),
  debug: Args.group("Debug Options", {
    confirm: Args.flag({
      help: "Require the user to confirm execution of each task.",
      default: false,
    }),
    abort: Args.string({
      help: "If given, abort during the prepare() step for the task with matching name.",
    }),
    list: Args.flag({
      help: "Show the status of all tasks and exit.",
      setting: "",
    }),
  }),
});

const scriptName = Args.getMetadata(args).scriptName;
const timeProperty = `${scriptName}_firstStart`;
export const completedProperty = `${scriptName}_lastCompleted`;

export function main(command?: string): void {
  Args.fill(args, command);
  if (args.help) {
    Args.showHelp(args);
    return;
  }

  if (get(timeProperty, -1) === -1) {
    set(timeProperty, gametimeToInt());
    set(completedProperty, "");
  }

  const noncasualQuest =
    (args.major.path === "gyou" && get(completedProperty).split("/")[0] !== "Community Service") ||
    get(completedProperty).split("/")[0] === "Grey You"
      ? gyouQuest
      : csQuest;
  const quests = [aftercoreQuest(), noncasualQuest(), casualQuest()];
  const tasks = getTasks(quests);

  // Abort during the prepare() step of the specified task
  if (args.debug.abort) {
    const to_abort = tasks.find((task) => task.name === args.debug.abort);
    if (!to_abort) throw `Unable to identify task ${args.debug.abort}`;
    to_abort.prepare = (): void => {
      throw "Abort requested";
    };
  }

  const engine = new Engine(tasks, "fullday");
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

function cleanInbox(): void {
  Kmail.delete(
    Kmail.inbox().filter((k) =>
      ["Lady Spookyraven's Ghost", "The Loathing Postal Service", "CheeseFax"].includes(
        k.senderName
      )
    )
  );
}

function printFulldaySnapshot() {
  const { meat, items, itemDetails } = Snapshot.current().diff(snapshotStart).value(garboValue);
  const winners = itemDetails.sort((a, b) => b.value - a.value).slice(0, 10);
  const losers = itemDetails.sort((a, b) => b.value - a.value).slice(-10);

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
