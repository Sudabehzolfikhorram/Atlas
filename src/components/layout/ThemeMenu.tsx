import React from "react";
import { IconButton, Menu, MenuButton, MenuItemOption, MenuList, MenuOptionGroup, Tooltip } from "@chakra-ui/react";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme, type ThemePreference } from "../../contexts/ThemeContext";
const options: {
  value: ThemePreference;
  label: string;
  icon: typeof SunIcon;
}[] = [{
  value: "light",
  label: "Light mode",
  icon: SunIcon
}, {
  value: "dark",
  label: "Dark mode",
  icon: MoonIcon
}, {
  value: "system",
  label: "System",
  icon: MonitorIcon
}];

/** Header theme switcher: Light, Dark, or follow the operating system. */
export function ThemeMenu() {
  const {
    preference,
    resolved,
    setPreference
  } = useTheme();
  const CurrentIcon = resolved === "light" ? SunIcon : MoonIcon;
  const currentLabel = options.find((o) => o.value === preference)?.label ?? "Theme";
  return <Menu placement="bottom-end">
      <Tooltip label="Theme" hasArrow openDelay={300}>
        <MenuButton as={IconButton} aria-label={`Theme: ${currentLabel}`} variant="ghost" icon={<CurrentIcon size={18} />} />
      </Tooltip>
      <MenuList minW="200px">
        <MenuOptionGroup title="Appearance" type="radio" value={preference} onChange={(v) => setPreference(v as ThemePreference)}>
          {options.map(({
          value,
          label,
          icon: Icon
        }) => <MenuItemOption key={value} value={value}>
              <span className="flex items-center gap-2.5">
                <Icon size={15} aria-hidden className="text-slate-400" />
                <span>{label}</span>
                {value === "system" && <span className="ml-auto text-[11px] text-slate-500">{resolved === "light" ? "Light" : "Dark"}</span>}
              </span>
            </MenuItemOption>)}
        </MenuOptionGroup>
      </MenuList>
    </Menu>;
}