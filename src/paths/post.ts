import { getWorkshed, use } from "kolmafia";
import { $effect, $item, AsdonMartin, get } from "libram";
import { LoopQuest } from "../engine/engine";
import { getStrategy } from "../strategies/strategy";
import { batfellow, breakfast, duffo, endOfDay, pullAll } from "./common";

export function postQuest(): LoopQuest {
  return {
    name: "Post",
    tasks: [
      pullAll(),
      {
        name: "Workshed",
        completed: () => getWorkshed() === $item`cold medicine cabinet` || get("_workshedItemUsed"),
        do: (): void => {
          AsdonMartin.drive($effect`Driving Observantly`, 900);
          use($item`cold medicine cabinet`);
        },
        limit: { tries: 1 },
      },
      ...breakfast(),
      ...duffo(),
      ...batfellow(),
      ...getStrategy().tasks(false),
      ...endOfDay(),
    ],
  };
}
