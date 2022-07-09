import { toInt, toItem } from "kolmafia";
import { get } from "libram";

function getConfig(name: string): string {
  const value = get(name);
  if (!value) throw `Preference ${name} is not defined, please set and run again`;
  return value;
}

export const SPOON_SIGN = getConfig("fullday_spoonSign");
export const DUPLICATE_ITEM = toItem(getConfig("fullday_duplicateItem"));
export const MAX_MEAT = toInt(getConfig("fullday_maxMeat"));
