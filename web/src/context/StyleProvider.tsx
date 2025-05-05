"use client";

import { HeroUIProvider } from "@heroui/react";
import NextTopLoader from "nextjs-toploader";
import React from "react";
import { Toaster } from "sonner";

interface StyleProviderProps {
  children: React.ReactNode;
}

const StyleProvider: React.FC<StyleProviderProps> = ({ children }) => {
  return (
    <>
      <HeroUIProvider>
        <NextTopLoader showSpinner={false} color="#006bff" />
        {children}
        <Toaster position="bottom-right" richColors />
      </HeroUIProvider>
    </>
  );
};

export default StyleProvider;
