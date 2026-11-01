import { useState } from "react";
import { Avatar, Box, Button, Flex, IconButton, InputGroup, InputLeftElement, Menu, MenuButton, MenuDivider, MenuGroup, MenuItem, MenuList, Text, Tooltip } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { BellIcon, Building2Icon, CalendarIcon, ChevronDownIcon, MenuIcon, SearchIcon } from "lucide-react";
import { companyContext, currentUser } from "../../data/currentUser";
import { ThemeMenu } from "./ThemeMenu";
import { DEMO_LABEL, DEMO_MODE } from "../../config/demo";
const notifications = [{
  title: "Decision awaiting you",
  body: "Tier-2 approval threshold redesign",
  to: "/",
  tone: "bg-amber-400"
}, {
  title: "Source delayed",
  body: "CMMS sync is 3h behind schedule",
  to: "/trust",
  tone: "bg-rose-400"
}, {
  title: "Task blocked",
  body: "Confirm ERP data ownership — waiting on Finance",
  to: "/planning",
  tone: "bg-blue-400"
}];
export function TopBar({
  onOpenNav


}: {onOpenNav: () => void;}) {
  const navigate = useNavigate();
  const [unit, setUnit] = useState(companyContext.units[0]);
  const [range, setRange] = useState(companyContext.timeRanges[2]);
  return <Flex as="header" className="h-16 shrink-0 items-center gap-3 glass-strong border-b border-white/[0.08] px-4 md:px-6">
      <IconButton aria-label="Open navigation" icon={<MenuIcon size={18} />} variant="ghost" className="lg:!hidden" onClick={onOpenNav} />

      <Menu>
        <MenuButton as={Button} variant="ghost" className="!px-2" rightIcon={<ChevronDownIcon size={14} />}>
          <Flex className="items-center gap-2">
            <Building2Icon size={15} className="text-slate-400" />
            <Box className="text-left">
              <Text className="text-[13px] font-medium leading-tight text-slate-100">{companyContext.company}</Text>
              <Text className="hidden text-[11px] leading-tight text-slate-500 sm:block">{unit}</Text>
            </Box>
          </Flex>
        </MenuButton>
        <MenuList>
          <MenuGroup title="Business unit">
            {companyContext.units.map((u) => <MenuItem key={u} onClick={() => setUnit(u)} className={u === unit ? "!text-white" : ""}>
                {u}
              </MenuItem>)}
          </MenuGroup>
        </MenuList>
      </Menu>

      <InputGroup size="sm" className="!hidden max-w-sm md:!flex">
        <InputLeftElement pointerEvents="none">
          <SearchIcon size={14} className="text-slate-500" />
        </InputLeftElement>
        
      </InputGroup>

      <Box className="flex-1" />

      <Menu>
        <MenuButton as={Button} leftIcon={<CalendarIcon size={14} />} rightIcon={<ChevronDownIcon size={14} />} className="!hidden sm:!inline-flex">
          {range}
        </MenuButton>
        <MenuList>
          {companyContext.timeRanges.map((r) => <MenuItem key={r} onClick={() => setRange(r)}>
              {r}
            </MenuItem>)}
        </MenuList>
      </Menu>

      {DEMO_MODE ? <Tooltip label="Demo mode: sources, sync status and executions are simulated on sample data." hasArrow maxW="260px">
          <Button variant="ghost" onClick={() => navigate("/trust")} className="!hidden xl:!inline-flex">
            <Flex className="items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
              <Text className="text-[12px] text-amber-300">{DEMO_LABEL}</Text>
            </Flex>
          </Button>
        </Tooltip> : <Tooltip label="ERP, CMMS (3h delayed), Historian, Email, Chat metadata, Documents, HSE, Procurement, Finance" hasArrow maxW="260px">
          <Button variant="ghost" onClick={() => navigate("/trust")} className="!hidden xl:!inline-flex">
            <Flex className="items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
              </span>
              <Text className="text-[12px] text-slate-300">8 of 9 sources live</Text>
              <Text className="text-[12px] text-slate-500">· synced 4m ago</Text>
            </Flex>
          </Button>
        </Tooltip>}

      <ThemeMenu />

      <Menu placement="bottom-end">
        <MenuButton as={IconButton} aria-label="Notifications, 3 unread" variant="ghost" icon={<Box className="relative">
            <BellIcon size={18} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-[#080D18]" />
          </Box>} />
        <MenuList className="!w-80">
          <MenuGroup title="Notifications">
            {notifications.map((n) => <MenuItem key={n.title} onClick={() => navigate(n.to)}>
                <Flex className="gap-2.5">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 z-index-12 rounded-full ${n.tone}`} />
                  <Box>
                    <Text className="text-[13px] font-medium text-slate-100">{n.title}</Text>
                    <Text className="text-[12px] text-slate-400">{n.body}</Text>
                  </Box>
                </Flex>
              </MenuItem>)}
          </MenuGroup>
        </MenuList>
      </Menu>

      <Menu placement="bottom-end">
        <MenuButton aria-label="Account and access context">
          <Flex className="items-center gap-2.5">
            <Avatar size="sm" name={currentUser.name} bg="#3B82F6" color="white" />
            <Box className="hidden text-left 2xl:block">
              <Text className="text-[13px] font-medium leading-tight text-slate-100">{currentUser.name}</Text>
              <Text className="text-[11px] leading-tight text-slate-500">{currentUser.role}</Text>
            </Box>
          </Flex>
        </MenuButton>
        <MenuList>
          <Box className="px-3 py-2">
            <Text className="text-[13px] font-medium text-white">{currentUser.name}</Text>
            <Text className="text-[12px] text-slate-400">{currentUser.role}</Text>
            <Text className="mt-2 inline-block rounded-md bg-teal-400/10 px-2 py-0.5 text-[11px] font-medium text-teal-300">
              {currentUser.access}
            </Text>
          </Box>
          <MenuDivider />
          <MenuItem onClick={() => navigate("/trust")}>My access & permissions</MenuItem>
          <MenuItem onClick={() => navigate("/audit")}>My activity</MenuItem>
        </MenuList>
      </Menu>
    </Flex>;
}