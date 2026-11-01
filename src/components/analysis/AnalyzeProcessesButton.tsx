import React from "react";
import { Button, useDisclosure } from "@chakra-ui/react";
import { Loader2Icon, ScanSearchIcon } from "lucide-react";
import { useAnalysis } from "../../contexts/AnalysisContext";
import { AnalysisInputModal } from "./AnalysisInputModal";

/** Opens the input picker for a (simulated) process analysis run. */
export function AnalyzeProcessesButton() {
  const {
    isRunning
  } = useAnalysis();
  const picker = useDisclosure();
  return <>
      <Button variant="primary" className="shrink-0" leftIcon={isRunning ? <Loader2Icon size={14} className="animate-spin" /> : <ScanSearchIcon size={14} />} onClick={picker.onOpen} isDisabled={isRunning} style={{
      alignItems: "center",
      justifyContent: "center"
    }}>
        {isRunning ? "Analysis running…" : "Analyze processes"}
      </Button>
      <AnalysisInputModal isOpen={picker.isOpen} onClose={picker.onClose} />
    </>;
}