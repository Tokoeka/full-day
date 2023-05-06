import { myAdventures, myInebriety } from "kolmafia";
import { $familiar, $item, get, set, withProperty } from "libram";
import { canConsume, cliExecuteThrow, stooperInebrietyLimit } from "../../lib";
import { caldera, stooper } from "./common";
import { Strategy } from "./strategy";

export function freecandy(): Strategy {
  return {
    tasks: (ascend: boolean) => [
      {
        name: "Garboween",
        completed: () => get("_garboweenCompleted", false) && !canConsume(),
        do: () => cliExecuteThrow(`garboween yachtzeechain ${ascend ? "ascend" : ""}`),
        post: () => set("_garboweenCompleted", true), // Unlike garbo, garboween doesn't currently track completion
        limit: { tries: 1 },
        tracking: "Garbo",
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
      ...(ascend
        ? [
            {
              name: "Combo",
              completed: () => myAdventures() === 0,
              do: () => cliExecuteThrow(`combo ${myAdventures()}`),
              limit: { tries: 1 },
            },
          ]
        : []),
    ],
    gyou: {
      pulls: [
        $item`porcelain porkpie`,
        $item`porcelain pelerine`,
        $item`porcelain police baton`,
        $item`porcelain pepper mill`,
        $item`porcelain plus-fours`,
        $item`porcelain phantom mask`,
        $item`beholed bedsheet`,
      ],
      ronin: {
        do: () => cliExecuteThrow(`freecandy ${Math.ceil((myAdventures() - 40) / 5)}`),
        outfit: {
          familiar: $familiar`Reagnimated Gnome`,
          famequip: $item`gnomish housemaid's kgnee`,
        },
      },
    },
  };
}
