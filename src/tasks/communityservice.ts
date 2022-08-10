import { cliExecute, getStorage, myPathId, myStorageMeat } from "kolmafia";
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
import { getCurrentLeg, Leg, Quest } from "../engine/task";
import { canAscendNoncasual, getSkillsToPerm } from "../lib";
import { breakfast, duffo, garboAscend, kingFreed } from "./common";

export const CommunityServiceQuest: Quest = {
  name: "Community Service",
  completed: () => getCurrentLeg() > Leg.CommunityService,
  tasks: [
    {
      name: "Ascend",
      completed: () => !canAscendNoncasual(),
      do: (): void => {
        prepareAscension({
          garden: "Peppermint Pip Packet",
          eudora: "Our Daily Candles™ order form",
          chateau: {
            desk: "continental juice bar",
            nightstand: "foreign language tapes",
            ceiling: "ceiling fan",
          },
        });
        ascend(
          Paths.CommunityService,
          $class`Pastamancer`,
          Lifestyle.softcore,
          "knoll",
          $item`astral six-pack`,
          $item`astral chapeau`,
          getSkillsToPerm()
        );
      },
      limit: { tries: 1 },
    },
    {
      name: "Run",
      ready: () => myPathId() === Paths.CommunityService.id,
      completed: () => get("kingLiberated"),
      do: () => cliExecute("loopcs"),
      limit: { tries: 1 },
      tracking: "Run",
    },
    {
      name: "Pull All",
      completed: () => Object.keys(getStorage()).length === 0 && myStorageMeat() === 0,
      do: () => cliExecute("pull all"),
      post: () => cliExecute("refresh all"),
      limit: { tries: 1 },
    },
    {
      name: "Uneffect Lost",
      completed: () => !have($effect`Feeling Lost`),
      do: () => uneffect($effect`Feeling Lost`),
      limit: { tries: 1 },
    },
    ...kingFreed(),
    ...breakfast(),
    duffo(),
    ...garboAscend(),
  ],
};
