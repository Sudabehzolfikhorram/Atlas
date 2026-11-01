import React from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { HeroHealth } from '../components/overview/HeroHealth';
import { AiAssistantSection } from '../components/overview/AiAssistantSection';
import { DataGovernanceSection } from '../components/overview/DataGovernanceSection';
import { GapsRedFlagsSection } from '../components/overview/GapsRedFlagsSection';
import { AnalyzeProcessesButton } from '../components/analysis/AnalyzeProcessesButton';
import { DemoBadge } from '../components/ui/DemoBadge';
import { currentUser } from '../data/currentUser';
export function Overview() {
  const firstName = currentUser.name.split(' ')[0];
  return <Box className="mx-auto max-w-[1200px] space-y-5" style={{
    width: "1400px"
  }}>
      <Flex className="flex-wrap items-center gap-3">
        <Heading as="h1" className="!text-[22px] !font-semibold tracking-tight text-white">{greeting()}, {firstName}</Heading>
        <DemoBadge />
        <Box className="ml-auto"><AnalyzeProcessesButton /></Box>
      </Flex>
      <AiAssistantSection />
      <HeroHealth />
      <DataGovernanceSection />
      <GapsRedFlagsSection />
    </Box>;
}
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}