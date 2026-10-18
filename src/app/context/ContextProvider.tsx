import React, { ReactNode, useEffect, useState } from "react";
import { Member } from "../../lib/types/member";
import { ACCESS_TOKEN_KEY, MEMBER_DATA_KEY, readStoredMember } from "../../lib/authSession";
import { GlobalContext } from "../hooks/useGlobals";

const ContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authMember, setAuthMember] = useState<Member | null>(readStoredMember);
  const [orderBuilder, setOrderBuilder] = useState<Date>(new Date());

  /** Keep every open tab in sync when another tab signs in or out. */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === MEMBER_DATA_KEY || e.key === ACCESS_TOKEN_KEY || e.key === null) {
        setAuthMember(readStoredMember());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
     <GlobalContext.Provider
      value={{ authMember, setAuthMember, orderBuilder, setOrderBuilder }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default ContextProvider;
