import { Args, Engine, getTasks } from "grimoire-kolmafia";
import {
  cliExecute,
  gametimeToInt,
  historicalPrice,
  Item,
  print,
  setAutoAttack,
  todayToString,
  totalTurnsPlayed,
  userConfirm,
} from "kolmafia";
import { $item, get, set } from "libram";
import { commafy, convertMilliseconds, formatNumber } from "./lib";
import { Snapshot } from "./snapshot";
import { CasualQuest } from "./tasks/casual";
import { CommunityServiceQuest } from "./tasks/communityservice";
import { FirstGarboQuest, SecondGarboQuest, ThirdGarboQuest } from "./tasks/garbo";

const dateProperty = "fullday_runDate";
const turnsProperty = "fullday_initialTurns";
const timeProperty = "fullday_elapsedTime";

export const args = Args.create("fullday", "A full-day wrapper script.", {
  confirm: Args.boolean({
    help: "If the user must confirm execution of each task.",
    default: false,
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
  spoonsign: Args.string({
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

  if (get(dateProperty) !== todayToString()) {
    set(dateProperty, todayToString());
    set(turnsProperty, totalTurnsPlayed());
    set(timeProperty, gametimeToInt());
  }

  const tasks = getTasks([
    FirstGarboQuest,
    CommunityServiceQuest,
    SecondGarboQuest,
    CasualQuest,
    ThirdGarboQuest,
  ]);
  const engine = new Engine(tasks);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const task = engine.tasks.find((t) => !t.completed());
    if (task === undefined) break;
    if (args.confirm && !userConfirm(`Executing task ${task.name}, should we continue?`)) {
      throw `User rejected execution of task ${task.name}`;
    }
    if (task.ready !== undefined && !task.ready()) throw `Task ${task.name} is not ready`;

    const snapshot = Snapshot.current();
    const questName = task.name.split("/")[0];
    setAutoAttack(0);
    cliExecute("ccs fullday");
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

  // List the top gaining and losing items
  const losers = fullResult.itemDetails.sort((a, b) => a.value - b.value).slice(0, 3);
  const winners = fullResult.itemDetails.sort((a, b) => b.value - a.value).slice(0, 3);
  print("Extreme items:", "blue");
  for (const detail of [...winners, ...losers.reverse()]) {
    print(
      `${formatNumber(detail.quantity)} ${detail.item} worth ${formatNumber(detail.value)} total`
    );
  }
}
