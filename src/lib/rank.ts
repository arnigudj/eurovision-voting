import { Contestant } from "@/app/api/contestants/types";

/**
 * Assigns a selected country to a position in the top 10 ranking.
 * Shifts existing countries down the list starting from the target index.
 *
 * @param top10 - current top 10 state (array of country IDs or nulls)
 * @param selected - the country ID being assigned
 * @param targetIndex - position (0–9) where the selected country should be placed
 * @returns a new array representing the updated top 10
 */
export function assignRank(
  top10: (string | null)[],
  selected: Contestant,
  targetIndex: number
): (string | null)[] {
  if (!selected) return top10;

  // Remove the selected country from its current position if it’s already in top10
  const oldIndex = top10.findIndex((id) => id === selected.id);
  const updated = [...top10];
  if (oldIndex !== -1) {
    updated[oldIndex] = null;
  }

  const out = [...updated];
  let moving: string | null = selected.id;

  // Shift existing entries down from the target index
  for (let i = targetIndex; i < 10; i++) {
    const current = out[i]; // save what's at this position
    out[i] = moving; // place the new item
    moving = current; // now move what was there further down
    if (moving === null) break; // stop early if we hit an empty spot
  }

  return out;
}
