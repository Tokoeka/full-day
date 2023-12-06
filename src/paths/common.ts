import { CombatStrategy } from "grimoire-kolmafia";
import {
  cliExecute,
  drink,
  eat,
  getPlayerId,
  getStorage,
  hippyStoneBroken,
  isOnline,
  itemAmount,
  mallPrice,
  maximize,
  myAscensions,
  myClosetMeat,
  myFullness,
  myInebriety,
  myMeat,
  mySign,
  myStorageMeat,
  numericModifier,
  putCloset,
  pvpAttacksLeft,
  retrieveItem,
  retrievePrice,
  runChoice,
  toInt,
  toUrl,
  use,
  visitUrl,
  wait,
} from "kolmafia";
import {
  $familiar,
  $item,
  $items,
  $location,
  Clan,
  get,
  getRemainingLiver,
  getRemainingStomach,
  have,
  haveInCampground,
  Macro,
  set,
} from "libram";
import { args } from "../args";
import { cliExecuteThrow, withCloseted } from "../lib";
import { LoopTask } from "../engine/engine";

const astralContainers = $items`astral hot dog dinner, astral six-pack, [10882]carton of astral energy drinks`;

export function pullAll(): LoopTask {
  return {
    name: "Pull All",
    completed: () => Object.keys(getStorage()).length === 0 && myStorageMeat() === 0,
    do: () => cliExecute("pull all"),
    post: () => cliExecute("refresh all"),
    limit: { tries: 1 },
  };
}

export function breakfast(after: string[] = []): LoopTask[] {
  return [
    breakStone(),
    {
      name: "Closet Meat",
      after: after,
      completed: () => myMeat() <= args.minor.maxmeat || myClosetMeat() > 0,
      do: () => cliExecute(`closet put ${myMeat() - args.minor.maxmeat} meat`),
      limit: { tries: 1 },
    },
    {
      name: "Rain-Doh",
      after: after,
      completed: () => !have($item`can of Rain-Doh`),
      do: () => use($item`can of Rain-Doh`),
      limit: { tries: 1 },
    },
    {
      name: "Astral Constainer",
      after: after,
      completed: () => astralContainers.every((item) => !have(item)),
      do: () => astralContainers.filter((item) => have(item)).forEach((item) => use(item)),
      limit: { tries: 1 },
    },
    {
      name: "Every Skill",
      after: after,
      completed: () => get("_bookOfEverySkillUsed", false),
      do: () => use($item`The Big Book of Every Skill`),
      limit: { tries: 1 },
    },
    {
      name: "Enable Reverser",
      after: after,
      completed: () => get("backupCameraReverserEnabled"),
      do: () => cliExecute("backupcamera reverser on"),
      limit: { tries: 1 },
    },
    {
      name: "Tune Moon",
      after: after,
      completed: () => mySign() === args.minor.tune || get("moonTuned"),
      do: () => cliExecute(`spoon ${args.minor.tune}`),
      limit: { tries: 1 },
    },
    {
      name: "Duplicate",
      after: after,
      ready: () =>
        have(args.minor.duplicate) &&
        get("encountersUntilDMTChoice") <=
          $familiar`Machine Elf`.fightsLimit - $familiar`Machine Elf`.fightsToday,
      completed: () => get("lastDMTDuplication") >= myAscensions(),
      prepare: () => set("choiceAdventure1125", `1&iid=${toInt(args.minor.duplicate)}`),
      do: $location`The Deep Machine Tunnels`,
      post: () => putCloset(itemAmount(args.minor.duplicate), args.minor.duplicate),
      acquire: () => [{ item: args.minor.duplicate }],
      choices: { 1119: 4 },
      combat: new CombatStrategy().macro(new Macro().attack().repeat()),
      outfit: {
        weapon: $item`Fourth of May Cosplay Saber`,
        familiar: $familiar`Machine Elf`,
        modifier: "muscle, -ml",
      },
      limit: { tries: 6 },
    },
    {
      name: "Detective Solver",
      after: after,
      completed: () => get("_detectiveCasesCompleted") >= 3,
      do: () => cliExecuteThrow("Detective Solver"),
      limit: { tries: 1 },
    },
    {
      name: "Clan Fortune",
      after: after,
      completed: () => get("_clanFortuneConsultUses") >= 3 || !isOnline("CheeseFax"),
      do: () =>
        Clan.with("Bonus Adventures from Hell", () =>
          cliExecute(`fortune ${getPlayerId("CheeseFax")}`)
        ),
      post: () => wait(10),
      limit: { tries: 3 },
    },
    {
      name: "Breakfast",
      after: after,
      completed: () => get("breakfastCompleted"),
      do: () => cliExecute("breakfast"),
      limit: { tries: 1 },
    },
  ];
}

function fullnessToRemove(): number {
  const drinkDocClock =
    !get("_docClocksThymeCocktailDrunk") &&
    have($item`Doc Clock's thyme cocktail`) &&
    getRemainingLiver() >= 4;
  const drinkMadLiquor =
    !get("_madLiquorDrunk") &&
    have($item`The Mad Liquor`) &&
    getRemainingLiver() - (drinkDocClock ? 4 : 0) >= 3;
  return (drinkDocClock ? 2 : 0) + (drinkMadLiquor ? 1 : 0);
}

export function batfellow(): LoopTask[] {
  return [
    {
      name: "Kickstart Liver",
      completed: () => myInebriety() >= 2 || get("_mrBurnsgerEaten"),
      ready: () => args.minor.batfellow && have($item`Mr. Burnsger`) && getRemainingStomach() >= 4,
      do: () => {
        withCloseted($items`mime army shotglass`, () => {
          if (have($item`astral pilsner`, 2)) drink($item`astral pilsner`, 2);
          else if (mallPrice($item`splendid martini`) < 15_000) drink($item`splendid martini`, 2);
          else throw `Unable to find a suitable booze to kickstart our liver with.`;
        });
      },
      limit: { tries: 1 },
    },
    {
      name: "Burnsger",
      completed: () => get("_mrBurnsgerEaten"),
      ready: () =>
        args.minor.batfellow &&
        have($item`Mr. Burnsger`) &&
        getRemainingStomach() >= 4 &&
        myInebriety() >= 2,
      prepare: (): void => {
        if (!get("_milkOfMagnesiumUsed")) {
          retrieveItem($item`milk of magnesium`);
          use($item`milk of magnesium`);
        }
      },
      do: () => eat($item`Mr. Burnsger`),
      limit: { tries: 1 },
    },
    {
      name: "Kickstart Stomach",
      completed: () => myFullness() >= fullnessToRemove(),
      ready: () => args.minor.batfellow,
      prepare: () => {
        if (!get("_milkOfMagnesiumUsed")) {
          retrieveItem($item`milk of magnesium`);
          use($item`milk of magnesium`);
        }
      },
      do: () => {
        if (mallPrice($item`Yeast of Boris`) < 10_000) {
          eat($item`Boris's bread`, fullnessToRemove());
        } else throw `Unable to find a suitable food to kickstart our stomach with.`;
      },
      limit: { tries: 1 },
    },
    {
      name: "Doc Clock",
      completed: () => get("_docClocksThymeCocktailDrunk"),
      ready: () =>
        args.minor.batfellow &&
        have($item`Doc Clock's thyme cocktail`) &&
        getRemainingLiver() >= 4 &&
        myFullness() >= 2,
      do: () => drink($item`Doc Clock's thyme cocktail`),
      limit: { tries: 1 },
    },
    {
      name: "Mad Liquor",
      completed: () => get("_madLiquorDrunk"),
      ready: () =>
        args.minor.batfellow &&
        have($item`The Mad Liquor`) &&
        getRemainingLiver() >= 3 &&
        myFullness() >= 1,
      do: () => drink($item`The Mad Liquor`),
      limit: { tries: 1 },
    },
  ];
}

export function duffo(after: string[] = []): LoopTask[] {
  return [
    {
      name: "Party Fair",
      after: [...after],
      completed: () => get("_questPartyFair") !== "unstarted",
      do: (): void => {
        visitUrl(toUrl($location`The Neverending Party`));
        if (["food", "booze"].includes(get("_questPartyFairQuest"))) {
          runChoice(1); // Accept quest
        } else {
          runChoice(2); // Decline quest
        }
      },
      limit: { tries: 1 },
    },
    {
      name: "Duffo",
      after: [...after, "Party Fair"],
      completed: () =>
        get("_questPartyFairProgress") !== "" ||
        ["", "finished"].includes(get("_questPartyFair")) ||
        !["food", "booze"].includes(get("_questPartyFairQuest")),
      do: () => cliExecuteThrow("duffo go"),
      post: () => Clan.join("Margaretting Tye"),
      limit: { tries: 1 },
    },
  ];
}

export function breakStone(): LoopTask {
  return {
    name: "Break Stone",
    completed: () => hippyStoneBroken(),
    do: () => visitUrl("peevpee.php?action=smashstone&confirm=on"),
    limit: { tries: 1 },
  };
}

export function pvp(after: string[] = []): LoopTask[] {
  return [
    {
      name: "Pledge Allegiance",
      after: after,
      completed: () => !visitUrl("peevpee.php?place=fight").includes("Pledge allegiance to"),
      do: () => visitUrl("peevpee.php?action=pledge&place=fight&pwd"),
      limit: { tries: 1 },
    },
    {
      name: "Swagger",
      after: [...after, "Pledge Allegiance"],
      ready: () => hippyStoneBroken(),
      completed: () => pvpAttacksLeft() === 0,
      do: () => {
        cliExecute("unequip");
        cliExecute("UberPvPOptimizer");
        cliExecute("swagger");
      },
      limit: { tries: 1 },
    },
  ];
}

export function endOfDay(after: string[] = []): LoopTask[] {
  return [
    {
      name: "Raffle",
      after: after,
      completed: () => have($item`raffle ticket`),
      do: () => cliExecute(`raffle ${Math.random() * 10 + 1}`),
      limit: { tries: 1 },
    },
    {
      name: "Pajamas",
      after: after,
      completed: () =>
        maximize("adv, switch tot, switch left-hand man, switch disembodied hand", true) &&
        numericModifier("Generated:_spec", "Adventures") <= numericModifier("Adventures"),
      prepare: () => cliExecute("refresh all"),
      do: () => maximize("adv, switch tot, switch left-hand man, switch disembodied hand", false),
      limit: { tries: 1 },
    },
    {
      name: "Clockwork Maid",
      after: after,
      completed: () =>
        haveInCampground($item`clockwork maid`) ||
        numericModifier($item`clockwork maid`, "Adventures") * get("valueOfAdventure") <
          retrievePrice($item`clockwork maid`),
      do: (): void => {
        retrieveItem($item`clockwork maid`);
        use($item`clockwork maid`);
      },
      limit: { tries: 1 },
    },
  ];
}
