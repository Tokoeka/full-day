import {
  bufferToFile,
  fileToBuffer,
  gametimeToInt,
  Item,
  myAscensions,
  myName,
  myTurncount,
  print,
  todayToString,
} from "kolmafia";
import { $item, get, Session } from "libram";
import { numberWithCommas } from "../lib";
import { makeValue, ValueFunctions } from "garbo-lib";

// Sourced from garbo
let _valueFunctions: ValueFunctions | undefined = undefined;
function garboValueFunctions(): ValueFunctions {
  if (!_valueFunctions) {
    _valueFunctions = makeValue({
      itemValues: new Map([[$item`fake hand`, 50000]]),
    });
  }
  return _valueFunctions;
}

export function garboValue(item: Item): number {
  return garboValueFunctions().value(item);
}

class DailySetting<T> {
  key: string;

  constructor(key: string) {
    this.key = key;
  }

  get(def: T): T {
    const saved = fileToBuffer(`profit/${myName()}/${this.key}.json`);
    if (saved === "") return def;
    const json = JSON.parse(saved);
    if ("day" in json && "value" in json && json["day"] === todayToString()) return json["value"];
    else return def;
  }

  set(value: T) {
    bufferToFile(
      JSON.stringify({
        day: todayToString(),
        value: value,
      }),
      `profit/${myName()}/${this.key}.json`
    );
  }
}

export type ProfitRecord = {
  gametime: number;
  meat: number;
  items: number;
  turns: number;
  hours: number;
};
export type Records = {
  [name: string]: ProfitRecord;
};

export class ProfitTracker {
  setting: DailySetting<Records>;
  records: Records;
  session: Session;
  turns: number;
  hours: number;
  pulled: Set<Item>;
  ascensions: number;

  constructor(key: string) {
    this.setting = new DailySetting<Records>(key);

    this.records = this.setting.get({});
    this.session = Session.current();
    this.turns = myTurncount();
    this.hours = gametimeToInt() / (1000 * 60 * 60);
    this.ascensions = myAscensions();
    this.pulled = new Set<Item>(
      get("_roninStoragePulls")
        .split(",")
        .map((id) => parseInt(id))
        .filter((id) => id > 0)
        .map((id) => Item.get(id))
    );
  }

  reset(): void {
    this.session = Session.current();
    this.turns = myTurncount();
    this.hours = gametimeToInt() / (1000 * 60 * 60);
    this.ascensions = myAscensions();
    this.pulled = new Set<Item>(
      get("_roninStoragePulls")
        .split(",")
        .map((id) => parseInt(id))
        .filter((id) => id > 0)
        .map((id) => Item.get(id))
    );
  }

  record(tag: string): void {
    if (this.ascensions < myAscensions()) {
      // Session tracking is not accurate across ascensions
      this.reset();
      return;
    }

    // Pulled items are tracked oddly in the Session
    // (they are included in the Session diff by default)
    const newPulls = new Set<Item>(
      get("_roninStoragePulls")
        .split(",")
        .map((id) => parseInt(id))
        .filter((id) => id > 0)
        .map((id) => Item.get(id))
    );
    for (const item of newPulls) {
      if (this.pulled.has(item)) continue;
      this.session.items.set(item, 1 + (this.session.items.get(item) ?? 0));
    }

    const diff = Session.current().diff(this.session);
    if (!(tag in this.records)) {
      this.records[tag] = { gametime: gametimeToInt(), meat: 0, items: 0, turns: 0, hours: 0 };
    }

    const value = diff.value(garboValue);
    this.records[tag].meat += value.meat;
    this.records[tag].items += value.items;
    this.records[tag].turns += myTurncount() - this.turns;
    this.records[tag].hours += gametimeToInt() / (1000 * 60 * 60) - this.hours;
    print(
      `Profit: ${value.meat}, ${value.items}, ${myTurncount() - this.turns}, ${
        gametimeToInt() / (1000 * 60 * 60) - this.hours
      }`
    );
    this.reset();
  }

  all(): Records {
    return this.records;
  }

  save(): void {
    this.setting.set(this.records);
  }
}

function sum(record: Records, where: (key: string) => boolean): ProfitRecord {
  const included: ProfitRecord[] = [];
  for (const key in record) {
    if (where(key)) included.push(record[key]);
  }
  return {
    gametime: included.reduce((v, p) => Math.min(v, p.gametime), 0),
    meat: included.reduce((v, p) => v + p.meat, 0),
    items: included.reduce((v, p) => v + p.items, 0),
    turns: included.reduce((v, p) => v + p.turns, 0),
    hours: included.reduce((v, p) => v + p.hours, 0),
  };
}

function printProfitSegment(key: string, record: ProfitRecord, color: string) {
  if (record === undefined) return;
  print(
    `${key}: ${numberWithCommas(record.meat)} meat + ${numberWithCommas(record.items)} items (${
      record.turns
    } turns + ${numberWithCommas(record.hours)} hours)`,
    color
  );
}

export function printProfits(records: Records): void {
  print("");
  print("== Daily Loop Profit ==");

  const sortedKeys = Object.entries(records)
    .sort((a, b) => a[1].gametime - b[1].gametime)
    .map(([key]) => key);
  const groups = new Set(sortedKeys.map((x) => x.split("@")[0]));

  for (const group of groups) {
    printProfitSegment(
      group,
      sum(records, (key) => key.startsWith(group)),
      "blue"
    );

    const groupKeys = sortedKeys.filter((key) => key.startsWith(group));
    const indexOfOther = groupKeys.findIndex((key) => key.endsWith("Other"));
    groupKeys.push(groupKeys.splice(indexOfOther, 1)[0]);

    for (const key of groupKeys) {
      printProfitSegment(`* ${key.split("@")[1]}`, records[key], "green");
    }
  }

  printProfitSegment(
    "Total",
    sum(records, () => true),
    "black"
  );
}
