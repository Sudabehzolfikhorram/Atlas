import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { theme } from "./utils/theme";
import { AuditProvider } from "./contexts/AuditContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AnalysisProvider } from "./contexts/AnalysisContext";
import { AssistantProvider } from "./contexts/AssistantContext";
import { AppShell } from "./components/layout/AppShell";
import { Overview } from "./pages/Overview";
import { ProcessIntelligence } from "./pages/ProcessIntelligence";
import { Assistant } from "./pages/Assistant";
import { Planning } from "./pages/Planning";
import { GovernanceLineage } from "./pages/GovernanceLineage";
import { ExecutiveReport } from "./pages/ExecutiveReport";
import { AuditActivity } from "./pages/AuditActivity";
import { TrustCenter } from "./pages/TrustCenter";
import { OrganizationCatalog } from "./pages/OrganizationCatalog";
import { ProcessMapping } from "./pages/ProcessMapping";
import { ProcessMappingGraph } from "./pages/ProcessMappingGraph";
import { Qan } from "./pages/Qan";
import { Diligence } from "./pages/Diligence";
import { BestPracticeProcess } from "./pages/BestPracticeProcess";
import { BestPracticeData } from "./pages/BestPracticeData";
import { DiligenceProvider } from "./contexts/DiligenceContext";
export function App() {
  return <ChakraProvider theme={theme}>
      <ThemeProvider>
      <AuditProvider>
        <AssistantProvider>
        <AnalysisProvider>
        <DiligenceProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Overview />} />
              <Route path="process" element={<ProcessIntelligence />} />
              <Route path="process-mapping" element={<ProcessMapping />} />
              <Route path="process-mapping-graph" element={<ProcessMappingGraph />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="planning" element={<Planning />} />
              <Route path="best-practice/process" element={<BestPracticeProcess />} />
              <Route path="best-practice/data" element={<BestPracticeData />} />
              <Route path="governance" element={<GovernanceLineage />} />
              <Route path="reports" element={<ExecutiveReport />} />
              <Route path="audit" element={<AuditActivity />} />
              <Route path="trust" element={<TrustCenter />} />
              <Route path="catalog" element={<OrganizationCatalog />} />
              <Route path="qan" element={<Navigate to="/qan/data" replace />} />
              <Route path="qan/:area" element={<Qan />} />
              <Route path="diligence" element={<Navigate to="/diligence/data" replace />} />
              <Route path="diligence/:area" element={<Diligence />} />
              <Route path="*" element={<Overview />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </DiligenceProvider>
        </AnalysisProvider>
        </AssistantProvider>
      </AuditProvider>
      </ThemeProvider>
    </ChakraProvider>;
}