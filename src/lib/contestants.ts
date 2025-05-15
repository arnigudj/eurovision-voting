import { Contestant } from "@/app/api/contestants/types";
import { Contest } from "@/app/api/contests/types";
import { AUTO_FINALISTS } from "./countries";

// filter out contestants that are not in the final in_final=false and include the auto finalists and host
export function finalContestants(
  contestants?: Contestant[],
  contest?: Contest
): Contestant[] {
  return (
    contestants?.filter(
      (contestant) =>
        contestant.is_final === true ||
        (contest?.host && contestant.country === contest.host) ||
        AUTO_FINALISTS.includes(contestant.country)
    ) || []
  );
}

export function sortContestants(contestants?: Contestant[]): Contestant[] {
  return contestants?.slice().sort((a, b) => a.country.localeCompare(b.country)) || [];
}
