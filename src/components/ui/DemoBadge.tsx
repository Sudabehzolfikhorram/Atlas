import React from "react";
import { Flex, Text, Tooltip } from "@chakra-ui/react";
import { FlaskConicalIcon } from "lucide-react";
export function DemoBadge({
  label = "Illustrative data"


}: {label?: string;}) {
  return <Tooltip label="Demonstration data. All people, metrics, records and relationships are fictional and do not represent any actual company." hasArrow maxW="260px">
      
    </Tooltip>;
}