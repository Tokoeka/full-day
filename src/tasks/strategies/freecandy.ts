import { myAdventures, myInebriety, myTurncount } from "kolmafia";
import { $familiar, $item, get, set, withProperty } from "libram";
import { canConsume, cliExecuteThrow, stooperInebrietyLimit } from "../../lib";
import { caldera, stooper } from "./common";
import { Strategy } from "./strategy";

export function freecandy(): Strategy {
  return {
    tasks: (ascend: boolean) => [
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
      ronin: () => {
        set("freecandy_treatOutfit", "Ceramic Suit");
        cliExecuteThrow(`freecandy ${Math.ceil((1000 - myTurncount()) / 5)}`);
      },
      postronin: () => {
        set("freecandy_treatOutfit", "Ceramic Suit");
        cliExecuteThrow(`freecandy ${Math.ceil((myAdventures() - 40) / 5)}`);
      },
    },
  };
}
