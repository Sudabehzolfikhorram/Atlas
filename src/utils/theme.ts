import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

/**
 * Component colors resolve through CSS custom properties defined in index.css
 * (`:root` = dark, `.theme-light` = light), so one theme serves both modes.
 */
const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false
};

const fieldStyle = {
  bg: "var(--c-field-bg)",
  border: "1px solid",
  borderColor: "var(--c-field-border)",
  color: "var(--c-field-text)",
  _placeholder: { color: "var(--c-placeholder)" },
  _hover: { bg: "var(--c-field-bg-hover)" },
  _focusVisible: { borderColor: "#3B82F6", bg: "var(--c-field-bg-focus)", boxShadow: "none" }
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace"
  },
  styles: {
    global: {
      body: { bg: "var(--c-body-bg)", color: "var(--c-body-text)" }
    }
  },
  components: {
    Button: {
      baseStyle: { fontWeight: 500, borderRadius: "10px" },
      sizes: {
        xs: { fontSize: "12px", h: 7, px: 2.5 },
        sm: { fontSize: "13px", h: 8, px: 3 }
      },
      variants: {
        primary: {
          bg: "#3B82F6",
          color: "white",
          _hover: { bg: "#2563EB", _disabled: { bg: "#3B82F6" } },
          _active: { bg: "#1D4ED8" }
        },
        approve: {
          bg: "var(--c-approve-bg)",
          color: "var(--c-approve-text)",
          _hover: { bg: "var(--c-approve-hover)", _disabled: { bg: "var(--c-approve-bg)" } }
        },
        glass: {
          bg: "var(--c-glass-btn-bg)",
          color: "var(--c-glass-btn-text)",
          border: "1px solid",
          borderColor: "var(--c-glass-btn-border)",
          backdropFilter: "blur(12px)",
          boxShadow: "var(--c-glass-btn-shadow)",
          _hover: { bg: "var(--c-glass-btn-hover)" },
          _active: { bg: "var(--c-glass-btn-hover)" }
        },
        outline: {
          bg: "transparent",
          color: "var(--c-outline-text)",
          border: "1px solid",
          borderColor: "var(--c-outline-border)",
          _hover: { bg: "var(--c-outline-hover-bg)", borderColor: "var(--c-outline-border-hover)" },
          _active: { bg: "var(--c-glass-btn-hover)" }
        },
        suggestion: {
          bg: "var(--c-suggest-bg)",
          color: "var(--c-suggest-text)",
          border: "1px solid",
          borderColor: "var(--c-suggest-border)",
          borderRadius: "full",
          fontWeight: 400,
          _hover: { bg: "rgba(96,165,250,0.08)", borderColor: "rgba(96,165,250,0.45)", color: "var(--c-suggest-hover-text)", _disabled: { bg: "var(--c-suggest-bg)" } },
          _active: { bg: "rgba(96,165,250,0.14)" }
        },
        pill: {
          bg: "var(--c-pill-bg)",
          color: "var(--c-pill-text)",
          borderRadius: "full",
          _hover: { bg: "var(--c-pill-hover)" }
        },
        ghost: {
          color: "var(--c-ghost-text)",
          _hover: { bg: "var(--c-ghost-hover-bg)", color: "var(--c-ghost-hover-text)" },
          _active: { bg: "var(--c-ghost-active-bg)" }
        }
      },
      defaultProps: { variant: "glass", size: "sm" }
    },
    Menu: {
      baseStyle: {
        list: {
          bg: "var(--c-menu-bg)",
          backdropFilter: "blur(24px) saturate(150%)",
          borderColor: "var(--c-menu-border)",
          boxShadow: "var(--c-menu-shadow)",
          py: 1.5,
          minW: "220px"
        },
        item: {
          bg: "transparent",
          fontSize: "13px",
          color: "var(--c-menu-item-text)",
          _hover: { bg: "var(--c-menu-item-hover)" },
          _focus: { bg: "var(--c-menu-item-hover)" }
        },
        groupTitle: { fontSize: "11px", color: "var(--c-menu-group-title)", textTransform: "uppercase", letterSpacing: "0.06em" },
        divider: { borderColor: "var(--c-menu-divider)" }
      }
    },
    Tooltip: {
      baseStyle: {
        bg: "var(--c-tooltip-bg)",
        backdropFilter: "blur(12px)",
        color: "var(--c-tooltip-text)",
        fontSize: "12px",
        borderRadius: "8px",
        px: 2.5,
        py: 1.5,
        boxShadow: "var(--c-tooltip-shadow)",
        "--popper-arrow-bg": "var(--c-tooltip-arrow)"
      }
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: "var(--c-modal-bg)",
          color: "var(--c-body-text)",
          backdropFilter: "blur(28px) saturate(150%)",
          border: "1px solid var(--c-modal-border)",
          borderRadius: "20px",
          boxShadow: "var(--c-modal-shadow)"
        },
        overlay: { bg: "var(--c-overlay)", backdropFilter: "blur(6px)" }
      }
    },
    Drawer: {
      baseStyle: {
        dialog: { bg: "var(--c-drawer-bg)", color: "var(--c-body-text)", backdropFilter: "blur(30px) saturate(150%)" },
        overlay: { bg: "var(--c-overlay)", backdropFilter: "blur(4px)" }
      }
    },
    Popover: {
      baseStyle: {
        content: {
          bg: "var(--c-menu-bg)",
          color: "var(--c-body-text)",
          backdropFilter: "blur(24px) saturate(150%)",
          borderColor: "var(--c-menu-border)",
          boxShadow: "var(--c-menu-shadow)"
        }
      }
    },
    Input: {
      variants: { filled: { field: fieldStyle } },
      defaultProps: { variant: "filled", size: "sm" }
    },
    Select: {
      variants: { filled: { field: fieldStyle } },
      defaultProps: { variant: "filled", size: "sm" }
    },
    Textarea: {
      variants: { filled: fieldStyle },
      defaultProps: { variant: "filled", size: "sm" }
    },
    Tabs: {
      defaultProps: { colorScheme: "blue", size: "sm" }
    },
    Checkbox: { defaultProps: { colorScheme: "blue" } },
    Switch: { defaultProps: { colorScheme: "blue" } }
  }
});