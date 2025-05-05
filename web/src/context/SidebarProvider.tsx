"use client";

import type React from "react";
import useIsMobile from "@/hooks/use-mobile";
import {
  createContext,
  type FC,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { type AnimationControls, useAnimationControls } from "framer-motion";
import {
  type AnimationState,
  type TransitionSettings,
  defaultTransitionSettings,
} from "@/components/Layout/Sidebar/sidebar-animations";

type SidebarState = "EXPANDED" | "COLLAPSED";

interface SidebarContextProps {
  state: SidebarState;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  animationControls: AnimationControls;
  animationState: AnimationState;
  transitionSettings: TransitionSettings;
  animateIcon: (icon: string) => void;
  animatedIcons: Set<string>;
}

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  stiffness?: number;
  damping?: number;
}

const SidebarContext = createContext<SidebarContextProps | null>(null);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
};

const SidebarProvider: FC<SidebarProviderProps> = ({
  children,
  defaultOpen = false,
  stiffness = defaultTransitionSettings.stiffness,
  damping = defaultTransitionSettings.damping,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isMobile = useIsMobile();
  const animationControls = useAnimationControls();
  const [animationState, setAnimationState] = useState<AnimationState>(
    defaultOpen ? "open" : "closed"
  );
  const animatedIcons = useRef(new Set<string>()).current;

  const transitionSettings: TransitionSettings = {
    type: "spring",
    stiffness,
    damping,
  };

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      setAnimationState("closed");
      animationControls.start("closed");
    } else {
      setIsOpen(true);
      setAnimationState("open");
      animationControls.start("open");
    }
  }, [isMobile, animationControls]);

  useEffect(() => {
    setAnimationState(isOpen ? "open" : "closed");
    animationControls.start(isOpen ? "open" : "closed");
  }, [isOpen, animationControls]);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  // Function to track animated icons to prevent duplicate animations
  const animateIcon = (icon: string) => {
    animatedIcons.add(icon);
    setTimeout(() => {
      animatedIcons.delete(icon);
    }, 1000);
  };

  return (
    <SidebarContext.Provider
      value={{
        state: isOpen ? "EXPANDED" : "COLLAPSED",
        isOpen,
        setIsOpen,
        isMobile,
        toggleSidebar,
        animationControls,
        animationState,
        transitionSettings,
        animateIcon,
        animatedIcons,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarProvider;
