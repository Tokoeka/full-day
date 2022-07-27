import { Quest, Task } from "grimoire-kolmafia";
import { cliExecute, myPathId } from "kolmafia";
import {
  $class,
  $effect,
  $item,
  ascend,
  get,
  Lifestyle,
  Paths,
  prepareAscension,
  uneffect,
} from "libram";
import { ascensionsToday, canAscendNoncasual } from "../lib";

export const CommunityServiceQuest: Quest<Task> = {
  name: "Community Service",
  completed: () => ascensionsToday() > 1,
  tasks: [
    {
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
    },
    {
      name: "Run",
      ready: () => myPathId() === Paths.CommunityService.id,
      completed: () => get("kingLiberated"),
      do: () => cliExecute("fizz-sccs"),
      post: () => uneffect($effect`Feeling Lost`),
    },
  ],
};