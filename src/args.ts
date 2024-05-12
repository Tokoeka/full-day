import { Args } from "grimoire-kolmafia";
import { $class, $item } from "libram";

export const args = Args.create("fullday", "A full-day wrapper script.", {
  major: Args.group("Major Options", {
    strategy: Args.string({
      help: "Farming strategy to use.",
      options: [
        ["auto", "Automatically choose based on game state"],
        ["garbo", "Farm meat using garbage-collector"],
        ["freecandy", "Farm Halloween candy using freecandy"],
        ["chrono", "Farm the TTT using chrono-collector"],
      ],
      default: "auto",
    }),
    path: Args.string({
      help: "Path to ascend into.",
      options: [
        ["cs", "Community Service"],
        ["casual", "Casual"],
        ["smol", "A Shrunken Adventurer am I"],
        ["custom", "Jump the gash manually"],
        ["none", "Stay in aftercore"],
      ],
      default: "smol",
    }),
    class: Args.class({ help: "Class to ascend as.", default: $class`Seal Clubber` }),
  }),
  minor: Args.group("Minor Options", {
    voa: Args.number({
      help: "Value of an adventure in meat to use for garbo.",
      default: 6500,
    }),
    halloweenvoa: Args.number({
      help: "Value of an adventure in meat to use for halloween.",
      default: 15000,
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
    batfellow: Args.boolean({ help: "Whether to consider batfellow consumables.", default: true }),
    skipholiday: Args.flag({
      help: "If given, ignore the fact that today is a holiday.",
      default: false,
    }),
  }),
  debug: Args.group("Debug Options", {
    abort: Args.string({
      help: "If given, abort during the prepare() step for the task with matching name.",
    }),
    confirm: Args.flag({
      help: "Whether the user must confirm execution of each unique task.",
      default: false,
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
