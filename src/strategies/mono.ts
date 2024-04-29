// import { getWorkshed, Item, myAdventures, myInebriety, visitUrl } from "kolmafia";
// import { $effect, $familiar, $item, get, have, set, withProperty } from "libram";
// import { canConsume, cliExecuteThrow, isHalloween, stooperInebrietyLimit } from "../lib";
// import { LoopTask } from "../engine/engine";
// import { caldera, stooper } from "./common";
// import { args } from "../args";

// const garboweenCompletedPref = "_fullday_garboweenCompleted"; // Unlike garbo, garboween doesn't currently track completion

// function chooseWorkshed(): Item {
//   if (getWorkshed() !== $item`Asdon Martin keyfob` && !have($effect`Driving Observantly`)) {
//     return $item`Asdon Martin keyfob`;
//   }
//   if (getWorkshed() !== $item`cold medicine cabinet`) {
//     return $item`cold medicine cabinet`;
//   }
//   return $item`model train set`;
// }

// export enum Strat {
//   Garbo,
//   Freecandy,
//   Chrono,
// }

// export function chooseStrat(): Strat {
//   switch (args.major.strategy) {
//     case "auto":
//       visitUrl("town.php");
//       if (get("timeTowerAvailable")) return Strat.Chrono;
//       if (isHalloween()) return Strat.Freecandy;
//       return Strat.Garbo;
//     case "garbo":
//       return Strat.Garbo;
//     case "freecandy":
//       return Strat.Freecandy;
//     case "chrono":
//       return Strat.Chrono;
//     default:
//       throw `Unknown strategy name ${args.major.strategy}`;
//   }
// }

// export function mono(ascend: boolean): LoopTask[] {
//   const commandScriptName = "";
//   const command = "";
//   const overdrunk = false;
//   const strategy = chooseStrat();
//   // const strategyName = Strat[strategy];

//   return [
//     ...(strategy === Strat.Freecandy
//       ? [
//           {
//             name: "Garboween",
//             completed: () => get(garboweenCompletedPref, false) && !canConsume(),
//             prepare: () => set("valueOfAdventure", args.minor.halloweenvoa),
//             do: () => cliExecuteThrow(`garboween yachtzeechain ${ascend ? "ascend" : ""}`),
//             post: () => {
//               set(garboweenCompletedPref, true);
//               set("valueOfAdventure", args.minor.voa);
//             },
//             limit: { tries: 1 },
//             tracking: "Garbo",
//           },
//         ]
//       : []),
//     {
//       name: "Garbo Nobarf",
//       completed: () =>
//         (get("_garboCompleted", "") !== "" && !canConsume()) ||
//         myInebriety() >= stooperInebrietyLimit(),
//       do: () => cliExecuteThrow(`garbo nobarf ${ascend ? "ascend" : ""}`),
//       limit: { tries: 1 },
//       tracking: "Garbo",
//     },
//     {
//       name: "Garbo",
//       completed: () =>
//         (get("_garboCompleted", "") !== "" && myAdventures() === 0 && !canConsume()) ||
//         myInebriety() >= stooperInebrietyLimit(),
//       do: () => cliExecuteThrow(`garbo ${ascend ? "ascend" : ""} workshed="${chooseWorkshed()}"`),
//       limit: { tries: 1 },
//       tracking: "Garbo",
//     },

//     {
//       name: commandScriptName,
//       completed: () => myAdventures() === 0 || myInebriety() >= stooperInebrietyLimit(),
//       do: () => cliExecuteThrow(command),
//       limit: { tries: 1 },
//       tracking: commandScriptName,
//     },
//     stooper(),
//     {
//       name: "Overdrink",
//       completed: () => myInebriety() > stooperInebrietyLimit(),
//       do: () =>
//         withProperty("spiceMelangeUsed", true, () =>
//           cliExecuteThrow(`CONSUME NIGHTCAP ${ascend ? "NOMEAT" : ""}`)
//         ),
//       outfit: { familiar: $familiar`Stooper` },
//       limit: { tries: 1 },
//     },
//     ...(ascend
//       ? [
//           caldera(),
//           {
//             name: "Overdrunk",
//             ready: () => myInebriety() > stooperInebrietyLimit(),
//             completed: () => myAdventures() === 0,
//             do: () => cliExecuteThrow(overdrunk ? command : "garbo ascend"),
//             limit: { tries: 1 },
//             tracking: commandScriptName,
//           },
//         ]
//       : []),
//   ];
// }
