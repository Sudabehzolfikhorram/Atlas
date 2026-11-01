import React, { useEffect, useRef } from "react";
import { Box, Drawer, DrawerContent, DrawerOverlay, Flex, useDisclosure } from "@chakra-ui/react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { focusTarget, type FocusRequest } from "../../utils/focusTarget";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
export function AppShell() {
  const nav = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    pathname
  } = location;
  const mainRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    mainRef.current?.scrollTo({
      top: 0
    });
  }, [pathname]);

  // AI Assistant hand-off: after navigating, scroll to and highlight the requested section.
  useEffect(() => {
    const req = location.state as Partial<FocusRequest> | null;
    if (!req?.focus) return;
    void focusTarget({
      focus: req.focus,
      filter: req.filter
    });
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);
  return <Flex className="app-backdrop relative h-screen w-full overflow-hidden font-sans text-slate-200">
      <Box className="pointer-events-none absolute inset-0 bg-[#050912]/50" aria-hidden />
      <Box className="relative z-10 hidden lg:block">
        <Sidebar />
      </Box>
      <Drawer isOpen={nav.isOpen} onClose={nav.onClose} placement="left">
        <DrawerOverlay />
        <DrawerContent maxW="256px" bg="transparent">
          <Sidebar onNavigate={nav.onClose} />
        </DrawerContent>
      </Drawer>
      <Flex className="relative z-10 min-w-0 flex-1 flex-col">
        <TopBar onOpenNav={nav.onOpen} />
        <Box as="main" ref={mainRef} className="flex-1 overflow-y-auto">
          <Box className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 lg:px-8 lg:py-8" style={{
          height: "fit-content"
        }}>
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Flex>;
}