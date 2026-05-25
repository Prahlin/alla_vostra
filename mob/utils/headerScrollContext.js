import { createContext, useContext } from "react";

const HeaderScrollContext = createContext(null);

export function HeaderScrollProvider({ children, scrollY }) {
  return (
    <HeaderScrollContext.Provider value={scrollY}>
      {children}
    </HeaderScrollContext.Provider>
  );
}

export function useHeaderScrollY() {
  return useContext(HeaderScrollContext);
}