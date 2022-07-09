import { Task } from "fizzlib";
import { cliExecute, myPathId } from "kolmafia";
import {
  $class,
  $effect,
  $item,
  ascend,
  get,
  have,
  Lifestyle,
  Paths,
  prepareAscension,
  uneffect,
} from "libram";
import { canAscendNoncasual } from "../lib";

export const csAscendTask: Task = {
  name: "Ascend",
  completed: () => !canAscendNoncasual(),
  do: (): void => {
    prepareAscension({
      workshed: "Little Geneticist DNA-Splicing Lab",
      garden: "Peppermint Pip Packet",
      eudora: "New-You Club Membership Form",
      chateau: {
        desk: "Swiss piggy bank",
        nightstand: "foreign language tapes",
        ceiling: "ceiling fan",
      },
    });
    ascend(
      Paths.CommunityService,
      $class`Sauceror`,
      Lifestyle.softcore,
      "knoll",
      $item`astral six-pack`,
      $item`astral chapeau`
    );
  },
  freeaction: true,
  noadventures: true,
};

export const csFreeKingTask: Task = {
  name: "Free King",
  ready: () => myPathId() === Paths.CommunityService.id,
  completed: () => get("kingLiberated"),
  do: () => cliExecute("fizz-sccs.ash"),
  freeaction: true,
  noadventures: true,
};

export const uneffectLostTask: Task = {
  name: "Uneffect Lost",
  completed: () => !have($effect`Feeling Lost`),
  do: () => uneffect($effect`Feeling Lost`),
  freeaction: true,
  noadventures: true,
};
