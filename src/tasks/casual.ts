import { Task } from "fizzlib";
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
  Kmail,
  Lifestyle,
  Paths,
  prepareAscension,
} from "libram";
import { canAscendCasual } from "../lib";

export const casualAscendTask: Task = {
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
  freeaction: true,
  noadventures: true,
};

export const casualFreeKingTask: Task = {
  name: "Free King",
  ready: () => myPathId() === Paths.Unrestricted.id,
  completed: () => get("kingLiberated") && have($skill`Liver of Steel`),
  do: () => cliExecute("loopcasual"),
  freeaction: true,
  noadventures: true,
};

export const cleanInboxTask: Task = {
  name: "Clean Inbox",
  completed: () =>
    Kmail.inbox().filter((k) =>
      ["Lady Spookyraven's Ghost", "The Loathing Postal Service"].includes(k.senderName)
    ).length === 0,
  do: () =>
    Kmail.delete(
      Kmail.inbox().filter((k) =>
        ["Lady Spookyraven's Ghost", "The Loathing Postal Service"].includes(k.senderName)
      )
    ),
  freeaction: true,
  noadventures: true,
};

export const workshedTask: Task = {
  name: "Workshed",
  completed: () => get("_workshedItemUsed") || getWorkshed() === $item`cold medicine cabinet`,
  do: (): void => {
    AsdonMartin.drive($effect`Driving Observantly`, 1000);
    use($item`cold medicine cabinet`);
  },
  freeaction: true,
  noadventures: true,
};
