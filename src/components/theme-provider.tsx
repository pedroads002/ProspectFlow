"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Light/Dark/System, persisted via next-themes (localStorage) and applied as a `.dark` class on `<html>`. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
