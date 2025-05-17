"use client";

import { Contest } from "@/app/api/contests/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ContestContextType = {
  contest?: Contest;
  isLoading?: boolean;
  isLoadError?: boolean;
};

const ContestContext = createContext<ContestContextType>({
  contest: undefined,
  isLoading: true,
  isLoadError: false,
});

export function ContestProvider({ children }: { children: React.ReactNode }) {
  const [contest, setContest] = useState<Contest>();
  const [isLoadError, setIsLoadError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const contestRes = await fetch(`/api/contests/active`);
      const contestData: Contest = await contestRes.json();
      setContest(contestData);
    } catch (error) {
      console.error(error);
      setIsLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ContestContext.Provider value={{ contest, isLoading, isLoadError }}>
      {children}
    </ContestContext.Provider>
  );
}

export function useContest() {
  return useContext(ContestContext);
}
