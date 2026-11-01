import React from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, FootprintsIcon, LightbulbIcon, RefreshCwIcon, UserRoundIcon } from "lucide-react";
import { controlDesigns, governanceGaps, nextControls } from "../../data/governance";
import { InfoTip } from "../ui/InfoTip";

/** The proposal shown on the Overview: the top-priority recommended control with a drafted design. */
const control = nextControls.find((c) => controlDesigns.some((d) => d.controlId === c.id)) ?? nextControls[0];
const design = controlDesigns.find((d) => d.controlId === control.id);
const gaps = governanceGaps.filter((g) => control.gaps.includes(g.id));

/** Concise, manager-facing summary of a process improvement proposal. */
export function ProposalCard() {
  const navigate = useNavigate();
  const fields = [{
    icon: RefreshCwIcon,
    label: "Proposed change",
    value: control.description
  }, {
    icon: UserRoundIcon,
    label: "Suggested owner",
    value: control.owner
  }, {
    icon: FootprintsIcon,
    label: "First step",
    value: design ? `Review the design and record whether it's ready for a pilot: ${design.pilotScope.charAt(0).toLowerCase()}${design.pilotScope.slice(1)}.` : "Review the proposed control and confirm the owner."
  }];
  return <Box as="section" id="overview-proposal" aria-labelledby="proposal-title" className="glass rounded-3xl px-5 py-5 lg:px-7">
      <Flex className="flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <Box className="min-w-0">
          <Flex className="flex-wrap items-center gap-2">
            <LightbulbIcon size={17} className="text-violet-300" aria-hidden />
            <Text className="text-[13px] font-medium uppercase tracking-[0.08em] text-violet-300">Data governance proposal</Text>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[13px] font-medium text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
              Awaiting review
            </span>
          </Flex>
          <Flex className="mt-1.5 items-center gap-1.5">
            <Heading as="h2" id="proposal-title" className="!text-[21px] !font-semibold tracking-tight text-white">
              {control.name}
            </Heading>
            <InfoTip label="this proposal">
              <span className="block">{control.id} · {control.priority}</span>
              {gaps.length > 0 && <span className="block">Solves {gaps.map((g) => g.id).join(", ")}</span>}
              {design && <span className="block">{design.version}, drafted {design.drafted}</span>}
              <span className="mt-2 block text-slate-400">Proposal only — not approved or live. Illustrative data.</span>
            </InfoTip>
          </Flex>
        </Box>
        <Button variant="primary" className="shrink-0 md:mt-1" rightIcon={<ArrowRightIcon size={14} />} onClick={() => navigate("/governance", {
        state: {
          focus: "proposed-solution"
        }
      })}>
          View and review proposal
        </Button>
      </Flex>

      <Box as="dl" className="mt-4 grid gap-3 md:grid-cols-3">
        {fields.map(({
        icon: Icon,
        label,
        value
      }) => <Box key={label} className="glass-tile rounded-2xl px-4 py-3">
            <Flex as="dt" className="items-center gap-2 text-[13px] font-medium uppercase tracking-[0.06em] text-slate-400">
              <Icon size={16} aria-hidden />
              {label}
            </Flex>
            <Text as="dd" className="mt-1.5 line-clamp-3 text-[14.5px] leading-relaxed text-slate-200">{value}</Text>
          </Box>)}
      </Box>
    </Box>;
}