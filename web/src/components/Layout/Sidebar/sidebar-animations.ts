"use client";

// Types
export type AnimationState = "open" | "closed";

export interface TransitionSettings {
  type: string;
  stiffness: number;
  damping: number;
}

// Default transition settings
export const defaultTransitionSettings: TransitionSettings = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

// Sidebar animations
export const sidebarVariants = (
  isMobile: boolean,
  settings: TransitionSettings = defaultTransitionSettings
) => ({
  open: {
    width: isMobile ? "100%" : "290px",
    transition: {
      ...settings,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  closed: {
    width: 0,
    transition: {
      ...settings,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
});

// Content animations
export const contentVariants = (
  settings: TransitionSettings = defaultTransitionSettings
) => ({
  open: {
    opacity: 1,
    x: 0,
    transition: {
      ...settings,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  closed: {
    opacity: 0,
    x: -20,
    transition: {
      ...settings,
    },
  },
});

// Section animations
export const sectionVariants = (
  settings: TransitionSettings = defaultTransitionSettings
) => ({
  open: {
    opacity: 1,
    y: 0,
    transition: {
      ...settings,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  closed: {
    opacity: 0,
    y: 20,
    transition: {
      ...settings,
    },
  },
});

// Dropdown animations
export const dropdownVariants = (
  settings: TransitionSettings = defaultTransitionSettings
) => ({
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      ...settings,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      ...settings,
      when: "afterChildren",
    },
  },
});

// Overlay animations
export const overlayVariants = {
  open: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Item animations
export const itemVariants = (
  settings: TransitionSettings = defaultTransitionSettings
) => ({
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: settings,
  },
  hover: {
    scale: 1.02,
    transition: settings,
  },
  tap: {
    scale: 0.98,
  },
});

// Chevron animations
export const chevronVariants = (
  settings: TransitionSettings = defaultTransitionSettings
) => ({
  open: {
    rotate: 0,
    transition: settings,
  },
  closed: {
    rotate: 180,
    transition: settings,
  },
});

// Logo animations
export const logoVariants = (
  settings: TransitionSettings = defaultTransitionSettings
) => ({
  hover: {
    scale: 1.05,
    transition: settings,
  },
  tap: {
    scale: 0.95,
    transition: settings,
  },
});

// Helper function to create staggered delay based on index
export const getStaggeredDelay = (index: number, baseDelay = 0.05) => {
  return baseDelay * index;
};

// Helper function to create nested staggered delay
export const getNestedStaggeredDelay = (
  parentIndex: number,
  childIndex: number,
  parentDelay = 0.1,
  childDelay = 0.05
) => {
  return childDelay * childIndex + parentDelay * parentIndex;
};
