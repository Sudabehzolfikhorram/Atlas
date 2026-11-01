import { createContext, useContext } from "react";

/** View state shared with custom graph nodes (avoids re-mapping node objects on every change). */
export interface SupplyGraphView {
  editing: boolean;
  showWeight: boolean;
  selectedId: string | null;
  relatedIds: Set<string>;
  query: string;
  matches: Set<string>;
}

export const SupplyGraphViewContext = createContext<SupplyGraphView>({
  editing: false,
  showWeight: true,
  selectedId: null,
  relatedIds: new Set(),
  query: "",
  matches: new Set()
});

export const useSupplyGraphView = () => useContext(SupplyGraphViewContext);