import { Quest, Task } from "grimoire-kolmafia";
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
import { ascensionsToday, canAscendNoncasual, getSkillsToPerm } from "../lib";
export const CommunityServiceQuest: Quest<Task> = {
  name: "Community Service",
  completed: () => ascensionsToday() > 1,
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
    },
    {
      name: "Uneffect Lost",
      completed: () => !have($effect`Feeling Lost`),
      do: () => uneffect($effect`Feeling Lost`),
    },
  ],
};
