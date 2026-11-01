import React from "react";
import { Button, Flex, Input, InputGroup, InputLeftElement, Select } from "@chakra-ui/react";
import { SearchIcon } from "lucide-react";
import { departments } from "../../data/catalog";
import type { CatalogFilters, DateFilter } from "../../hooks/useCatalog";
import type { AccessLevel, ConnectionStatus } from "../../types/catalog";
import { connectionMeta } from "../../utils/catalog";
interface Props {
  filters: CatalogFilters;
  setFilter: <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => void;
  hasFilters: boolean;
  onClear: () => void;
}

/** Search + filters. Source type is picked with the tabs above, so it isn't repeated here. */
export function CatalogFilterBar({
  filters,
  setFilter,
  hasFilters,
  onClear
}: Props) {
  return;
}