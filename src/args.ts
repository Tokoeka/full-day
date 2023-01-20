import { Args } from "grimoire-kolmafia";
import { $item } from "libram";
import { csQuestName } from "./tasks/cs";
import { gyouQuestName } from "./tasks/gyou";

export const pathAliases = [
  { path: gyouQuestName, alias: "gyou" },
  { path: csQuestName, alias: "cs" },
];

export const args = Args.create("fullday", "A full-day wrapper script.", {
  major: Args.group("Major Options", {
    path: Args.string({
      help: "Non-casual path to ascend into.",
      options: pathAliases.map(({ path, alias }) => [alias, path]),
      default: pathAliases[0].alias,
    }),
    strategy: Args.string({
      help: "Farming strategy to use.",
      options: [
        ["garbo", "Farm meat using garbage-collector"],
        ["freecandy", "Farm Halloween candy using freecandy"],
        ["baggo", "Farm duffel bags and van keys using bag-collector"],
      ],
      default: "garbo",
    }),
  }),
  minor: Args.group("Minor Options", {
    voa: Args.number({
      help: "Value of an adventure in meat.",
      default: 6500,
    }),
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
    duplicate: Args.item({
      help: "Item to duplicate in the Deep Machine Tunnels.",
      default: $item`Daily Affirmation: Always be Collecting`,
    }),
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
    completedtasks: Args.string({
      help: "A comma-separated list of task names the should be treated as completed. Can be used as a workaround for script bugs.",
    }),
    list: Args.flag({
      help: "Show the status of all tasks and exit.",
      setting: "",
    }),
  }),
});

export const metadata = Args.getMetadata(args);
