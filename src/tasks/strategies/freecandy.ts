import { myAdventures, myInebriety } from "kolmafia";
import { $familiar, $item, get, set, withProperty } from "libram";
import { Task } from "../../engine/task";
import { canConsume, cliExecuteThrow, stooperInebrietyLimit } from "../../lib";
import { caldera, stooper } from "./common";

export function freecandy(ascend: boolean): Task[] {
  return [
    {
      name: "Garboween",
      completed: () => get("_fullday_completedGarboween", false) && !canConsume(),
      do: () => cliExecuteThrow(`garboween yachtzeechain ${ascend ? "ascend" : ""}`),
      post: () => set("_fullday_completedGarboween", true),
      limit: { tries: 1 },
      tracking: "Garbo",
    },
    {
      name: "Treat Outfit",
      completed: () => get("freecandy_treatOutfit") === "Ceramic Suit",
      do: () => set("freecandy_treatOutfit", "Ceramic Suit"),
      limit: { tries: 1 },
    },
    {
      name: "Freecandy",
      completed: () => myAdventures() < 5 || myInebriety() >= stooperInebrietyLimit(),
      do: () => cliExecuteThrow("freecandy"),
      outfit: {
        familiar: $familiar`Reagnimated Gnome`,
        famequip: $item`gnomish housemaid's kgnee`,
      },
      limit: { tries: 1 },
      tracking: "Freecandy",
    },
    stooper(),
    {
      name: "Overdrink",
      completed: () => myInebriety() > stooperInebrietyLimit(),
      do: () =>
        withProperty("spiceMelangeUsed", true, () =>
          cliExecuteThrow(`CONSUME NIGHTCAP ${ascend ? "NOMEAT" : ""}`)
        ),
      outfit: { familiar: $familiar`Stooper` },
      limit: { tries: 1 },
    },
    ...(ascend ? [caldera()] : []),
    {
      name: "Overdrunk",
      ready: () => myInebriety() > stooperInebrietyLimit(),
      completed: () => myAdventures() < 5,
      do: () => cliExecuteThrow("freecandy"),
      outfit: {
        familiar: $familiar`Reagnimated Gnome`,
        famequip: $item`gnomish housemaid's kgnee`,
      },
      limit: { tries: 1 },
      tracking: "Freecandy",
    },
    {
      name: "Combo",
      completed: () => myAdventures() === 0,
      do: () => cliExecuteThrow(`combo ${myAdventures()}`),
      limit: { tries: 1 },
    },
  ];
}
