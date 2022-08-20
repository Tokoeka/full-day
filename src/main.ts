import { Args, getTasks } from "grimoire-kolmafia";
import { Item } from "kolmafia";
import { $item } from "libram";
import { ProfitTrackingEngine } from "./engine/engine";
import { AftercoreQuest } from "./tasks/aftercore";
import { CasualQuest } from "./tasks/casual";
import { CommunityServiceQuest } from "./tasks/communityservice";

export const args = Args.create("fullday", "A full-day wrapper script.", {
  confirm: Args.boolean({
    help: "If the user must confirm execution of each task.",
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
  duffo: Args.string({
    help: "Food and booze items to target for the Neverending Party quest (comma-delimited).",
    default: "",
  }),
});

export function main(command?: string): void {
  Args.fill(args, command);
  if (args.help) {
    Args.showHelp(args);
    return;
  }

  const tasks = getTasks([AftercoreQuest, CommunityServiceQuest, CasualQuest]);

  // Abort during the prepare() step of the specified task
  if (args.abort) {
    const to_abort = tasks.find((task) => task.name === args.abort);
    if (!to_abort) throw `Unable to identify task ${args.abort}`;
    to_abort.prepare = (): void => {
      throw `Abort requested`;
    };
  }

  const engine = new ProfitTrackingEngine(tasks, "fullday_profit_tracker");
  try {
    engine.run(undefined, args.confirm);
  } finally {
    engine.destruct();
  }
}
