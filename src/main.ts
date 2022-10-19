import { Args } from "grimoire-kolmafia";
import { Item, print } from "kolmafia";
import { $item } from "libram";
import { ProfitTrackingEngine } from "./engine/engine";
import { garboValue } from "./engine/profits";
import { Task } from "./engine/task";
import { cleanInbox, numberWithCommas } from "./lib";
import { Snapshot } from "./snapshot";
import { aftercore_tasks, all_tasks, casual_tasks, communityservice_tasks } from "./tasks/all";

export const args = Args.create("fullday", "A full-day wrapper script.", {
  goal: Args.string({
    help: "Which tasks to perform.",
    options: [
      ["all", "Complete all tasks."],
      ["aftercore", "Complete the current aftercore."],
      ["communityservice", "Complete a community service ascension."],
      ["casual", "Complete a casual ascension."],
    ],
    default: "all",
  }),
  strategy: Args.string({
    help: "",
    options: [
      ["garbo", "Farm meat."],
      ["baggo", "Farm duffel bags and van keys."],
      ["chrono", "Farm chroners."],
    ],
    default: "garbo",
  }),
  confirm: Args.flag({
    help: "Require the user to confirm execution of each task.",
    default: false,
  }),
  abort: Args.string({
    help: "If given, abort during the prepare() step for the task with matching name.",
  }),
  maxmeat: Args.number({
    help: "Maximum amount of meat to keep in inventory after breaking the prism.",
    default: 2_000_000,
  }),
  duplicate: Args.custom(
    {
      help: "Item to duplicate in the Deep Machine Tunnels.",
      default: $item`bottle of Greedy Dog`,
    },
    Item.get,
    "ITEM"
  ),
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
});

export function main(command?: string): void {
  Args.fill(args, command);
  if (args.help) {
    Args.showHelp(args);
    return;
  }

  // Select which tasks to perform
  let tasks: Task[] = [];
  switch (args.goal) {
    case "all":
      tasks = all_tasks();
      break;
    case "aftercore":
      tasks = aftercore_tasks();
      break;
    case "communityservice":
      tasks = communityservice_tasks();
      break;
    case "casual":
      tasks = casual_tasks();
      break;
  }

  // Abort during the prepare() step of the specified task
  if (args.abort) {
    const to_abort = tasks.find((task) => task.name === args.abort);
    if (!to_abort) throw `Unable to identify task ${args.abort}`;
    to_abort.prepare = (): void => {
      throw "Abort requested";
    };
  }

  const snapshotStart = Snapshot.importOrCreate("Start");
  const engine = new ProfitTrackingEngine(tasks, "fullday_profit_tracker");
  try {
    engine.run(undefined, args.confirm);
  } finally {
    engine.destruct();
    cleanInbox();
  }

  const { meat, items, itemDetails } = Snapshot.current().diff(snapshotStart).value(garboValue);

  // list the top 3 gaining and top 3 losing items
  const losers = itemDetails.sort((a, b) => a.value - b.value).slice(0, 3);
  const winners = itemDetails.sort((a, b) => b.value - a.value).slice(0, 3);
  print("Extreme Items:");
  for (const detail of [...winners, ...losers]) {
    print(`${detail.quantity} ${detail.item} worth ${detail.value.toFixed(0)} total`);
  }

  print(
    `So far today, you have generated ${numberWithCommas(
      meat + items
    )} meat, with ${numberWithCommas(meat)} raw meat and ${numberWithCommas(items)} from items`
  );
}
