import { Quest, Task } from "grimoire-kolmafia";
import { cliExecute, getWorkshed, myPathId, use } from "kolmafia";
import {
  $class,
  $effect,
  $item,
  $skill,
  ascend,
  AsdonMartin,
  get,
  have,
  Lifestyle,
  Paths,
  prepareAscension,
} from "libram";
import { canAscendCasual } from "../lib";

export const CasualQuest: Quest<Task> = {
  name: "Casual",
  tasks: [
    {
      name: "Ascend",
      completed: () => !canAscendCasual(),
      do: (): void => {
        prepareAscension({
          workshed: "Asdon Martin keyfob",
          chateau: {
            desk: "Swiss piggy bank",
            nightstand: "electric muscle stimulator",
            ceiling: "ceiling fan",
          },
        });
        ascend(
          Paths.Unrestricted,
          $class`Seal Clubber`,
          Lifestyle.casual,
          "knoll",
          $item`astral six-pack`
        );
      },
    },
    {
      name: "Run",
      ready: () => myPathId() === Paths.Unrestricted.id,
      completed: () => get("kingLiberated") && have($skill`Liver of Steel`),
      do: () => cliExecute("loopcasual"),
    },
    {
      name: "Workshed",
      completed: () => get("_workshedItemUsed") || getWorkshed() === $item`cold medicine cabinet`,
      do: (): void => {
        AsdonMartin.drive($effect`Driving Observantly`, 1000);
        use($item`cold medicine cabinet`);
      },
    },
  ],
};
