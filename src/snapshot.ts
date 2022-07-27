import {
  bufferToFile,
  cliExecute,
  equippedAmount,
  equippedItem,
  Familiar,
  familiarEquippedEquipment,
  fileToBuffer,
  getCampground,
  getCloset,
  getInventory,
  getShop,
  getStorage,
  Item,
  myClosetMeat,
  myFamiliar,
  myMeat,
  myName,
  myStorageMeat,
  Slot,
  todayToString,
  toItem,
} from "kolmafia";
import { $item, $items, getFoldGroup, have, sumNumbers } from "libram";

const worksheds = [
  "warbear LP-ROM burner",
  "warbear jackhammer drill press",
  "warbear induction oven",
  "warbear high-efficiency still",
  "warbear chemistry lab",
  "warbear auto-anvil",
  "spinning wheel",
  "snow machine",
  "Little Geneticist DNA-Splicing Lab",
  "portable Mayo Clinic",
  "Asdon Martin keyfob",
  "diabolic pizza cube",
  "cold medicine cabinet",
];

const gardens = [
  "packet of pumpkin seeds",
  "Peppermint Pip Packet",
  "packet of dragon's teeth",
  "packet of beer seeds",
  "packet of winter seeds",
  "packet of thanksgarden seeds",
  "packet of tall grass seeds",
  "packet of mushroom spores",
];

function getEquipment(): { [item: string]: number } {
  const items = [...new Set(Slot.all().map((slot) => equippedItem(slot)))];
  return items.reduce((obj, item) => {
    if (equippedAmount(item) > 0) obj[item.name] = equippedAmount(item);
    return obj;
  }, {} as { [item: string]: number });
}

function getTerrariumEquipment(): { [item: string]: number } {
  const items = Familiar.all()
    .filter((fam) => have(fam) && myFamiliar() !== fam)
    .map((fam) => familiarEquippedEquipment(fam))
    .filter((item) => item !== $item`none`);
  return items.reduce(
    (obj, item) => ({ ...obj, [item.name]: obj[item.name] ?? 0 + 1 }),
    {} as { [item: string]: number }
  );
}

function getTradeableCampground(): { [item: string]: number } {
  const itemNames = Object.keys(getCampground()).filter((x) =>
    [...worksheds, ...gardens].includes(x)
  );
  return itemNames.reduce((obj, itemName) => ({ ...obj, [itemName]: 1 }), {});
}

function myItems(): Map<Item, number> {
  cliExecute("refresh shop; refresh storage; refresh inv");
  const inv = getInventory();
  const equips = getEquipment();
  const shop = getShop();
  const closet = getCloset();
  const storage = getStorage();
  const camp = getTradeableCampground();
  const terrarium = getTerrariumEquipment();
  const overall = new Map<Item, number>();
  for (const itemName in {
    ...inv,
    ...equips,
    ...shop,
    ...closet,
    ...storage,
    ...camp,
    ...terrarium,
  }) {
    overall.set(
      toItem(itemName),
      [inv, equips, shop, closet, storage, camp, terrarium].reduce(
        (a, b) => a + (b[itemName] ?? 0),
        0
      )
    );
  }
  return overall;
}

/**
 * Return a mapping of the snapshot items, mapping foldable items to a single of their forms
 * @returns the item snapshot results, with foldables mapped to a single of their folding forms
 */
export function myItemsWrapper(): Map<Item, number> {
  const manyToOne = (primary: Item, mapped: Item[]): [Item, Item][] =>
    mapped.map((target: Item) => [target, primary]);

  const foldable = (item: Item): [Item, Item][] => manyToOne(item, getFoldGroup(item));

  const itemMappings = new Map<Item, Item>([
    ...foldable($item`liar's pants`),
    ...foldable($item`ice pick`),
    ...manyToOne($item`Spooky Putty sheet`, [
      $item`Spooky Putty monster`,
      ...getFoldGroup($item`Spooky Putty sheet`),
    ]),
    ...foldable($item`stinky cheese sword`),
    ...foldable($item`naughty paper shuriken`),
    ...foldable($item`Loathing Legion knife`),
    ...foldable($item`deceased crimbo tree`),
    ...foldable($item`makeshift turban`),
    ...foldable($item`turtle wax shield`),
    ...foldable($item`metallic foil bow`),
    ...foldable($item`ironic moustache`),
    ...foldable($item`bugged balaclava`),
    ...foldable($item`toggle switch (Bartend)`),
    ...foldable($item`mushroom cap`),
    ...manyToOne($item`can of Rain-Doh`, $items`empty Rain-Doh can`),
    ...manyToOne(
      $item`meteorite fragment`,
      $items`meteorite earring, meteorite necklace, meteorite ring`
    ),
    ...manyToOne(
      $item`Sneaky Pete's leather jacket`,
      $items`Sneaky Pete's leather jacket (collar popped)`
    ),
    ...manyToOne($item`Boris's Helm`, $items`Boris's Helm (askew)`),
    ...manyToOne($item`Jarlsberg's pan`, $items`Jarlsberg's pan (Cosmic portal mode)`),
    ...manyToOne(
      $item`tiny plastic sword`,
      $items`grogtini, bodyslam, dirty martini, vesper, cherry bomb, sangria del diablo`
    ),
    ...manyToOne(
      $item`earthenware muffin tin`,
      $items`blueberry muffin, bran muffin, chocolate chip muffin`
    ),
  ]);

  const inventory = new Map<Item, number>();
  for (const [item, quantity] of myItems().entries()) {
    const mappedItem = itemMappings.get(item) ?? item;
    inventory.set(mappedItem, quantity + (inventory.get(mappedItem) ?? 0));
  }
  return inventory;
}

/**
 * Perform a binary element-wise operation on two inventories
 * @param a The LHS inventory to perform the operation on
 * @param b The RHS inventory to perform the operation on
 * @param op an operator to compute between the sets
 * @returns a new map representing the combined inventories
 */
function inventoryOperation(
  a: Map<Item, number>,
  b: Map<Item, number>,
  op: (aPart: number, bPart: number) => number
): Map<Item, number> {
  const difference = new Map<Item, number>();

  for (const item of [...a.keys(), ...b.keys()]) {
    const quantity = op(a.get(item) ?? 0, b.get(item) ?? 0);
    difference.set(item, quantity);
  }
  const diffEntries: [Item, number][] = [...difference.entries()];

  return new Map<Item, number>(diffEntries.filter((value) => value[1] !== 0));
}

/**
 * An entry showing the value of each Item in a snapshot
 * @member item the item associated with this detail
 * @member value the numeric value of the full quantity of items (to get value of each item, do value / quantity) (can be negative)
 * @member quantity the number of items for this detail
 */
interface ItemDetail {
  item: Item;
  value: number;
  quantity: number;
}

/**
 * The full value (in meat) results of a snapshot
 * @member meat the value of this snapshot in pure meat
 * @member items the value of the items in this snapshot in meat
 * @member total sum of meat and items
 * @member itemDetails a list of the detailed accounting for each item in this snapshot
 */
interface ItemResult {
  meat: number;
  items: number;
  total: number;
  itemDetails: ItemDetail[];
}

export class Snapshot {
  meat: number;
  items: Map<Item, number>;

  public constructor(meat: number, items: Map<Item, number>) {
    this.meat = meat;
    this.items = items;
  }

  /**
   * Value this snapshot
   * @param itemValue a function that, when given an item, will give a meat value of the item
   * @returns ItemResult with the full value of this snapshot given the input function
   */
  value(itemValue: (item: Item) => number): ItemResult {
    // TODO: add garbo specific pricing (sugar equipment for synth, etc.)

    const meat = Math.floor(this.meat);
    const itemDetails = [...this.items.entries()].map(([item, quantity]) => {
      return { item, quantity, value: itemValue(item) * quantity };
    });
    const items = Math.floor(sumNumbers(itemDetails.map((detail) => detail.value)));

    return { meat, items, total: meat + items, itemDetails };
  }

  /**
   * Subtract the contents of another snapshot from this one, removing any items that have a resulting quantity of 0
   * @param other the snapshot from which to pull values to remove from this snapshot
   * @returns a new snapshot representing the difference between this snapshot and the other snapshot
   */
  diff(other: Snapshot): Snapshot {
    return new Snapshot(
      this.meat - other.meat,
      inventoryOperation(this.items, other.items, (a: number, b: number) => a - b)
    );
  }
  /**
   * Subtract the contents of snasphot b from snapshot a, removing any items that have a resulting quantity of 0
   * @param a the snapshot from which to subtract elements
   * @param b the snapshot from which to add elements
   * @returns a new snapshot representing the difference between a and b
   */
  static diff(a: Snapshot, b: Snapshot): Snapshot {
    return a.diff(b);
  }

  /**
   * Generate a new snapshot combining multiple snapshots together
   * @param other the snapshot from which to add elements to this set
   * @returns a new snapshot representing the addition of other to this
   */
  add(other: Snapshot): Snapshot {
    return new Snapshot(
      this.meat + other.meat,
      inventoryOperation(this.items, other.items, (a: number, b: number) => a + b)
    );
  }

  /**
   * Combine the contents of snapshots
   * @param snapshots the set of snapshots to combine together
   * @returns a new snapshot representing the difference between a and b
   */
  static add(...snapshots: Snapshot[]): Snapshot {
    return snapshots.reduce((previousSnapshot, currentSnapshot) =>
      previousSnapshot.add(currentSnapshot)
    );
  }

  static getFilepath(filename: string): string {
    return filename.endsWith(".json")
      ? filename
      : `snapshots/${myName()}/${todayToString()}_${filename}.json`;
  }

  /**
   * Export this snapshot to a file in the data/ directory. Conventionally this file should end in ".json"
   * @param filename The file into which to export
   */
  toFile(filename: string): void {
    const val = {
      meat: this.meat,
      items: Object.fromEntries(this.items),
    };
    bufferToFile(JSON.stringify(val), Snapshot.getFilepath(filename));
  }

  /**
   * Import a snapshot from a file in the data/ directory. Conventionally the file should end in ".json"
   * @param filename The file from which to import
   * @returns the snapshot represented by the file
   */
  static fromFile(filename: string): Snapshot {
    const fileValue = fileToBuffer(Snapshot.getFilepath(filename));
    // fileToBuffer returns empty string for files that don't exist
    if (fileValue.length > 0) {
      const val: {
        meat: number;
        items: { [item: string]: number };
      } = JSON.parse(fileValue);

      const parsedItems: [Item, number][] = Object.entries(val.items).map(([itemStr, quantity]) => [
        toItem(itemStr),
        quantity,
      ]);
      return new Snapshot(val.meat, new Map<Item, number>(parsedItems));
    } else {
      // if the file does not exist, return an empty snapshot
      return new Snapshot(0, new Map<Item, number>());
    }
  }

  static current(): Snapshot {
    return new Snapshot(myMeat() + myStorageMeat() + myClosetMeat(), myItemsWrapper());
  }

  isEmpty(): boolean {
    return this.meat + this.items.size === 0;
  }

  static createOrImport(filename: string): Snapshot {
    let snapshot = Snapshot.fromFile(filename);
    if (snapshot.isEmpty()) {
      snapshot = Snapshot.current();
      snapshot.toFile(filename);
    }
    return snapshot;
  }
}
