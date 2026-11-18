import type { ReactNode, ComponentProps } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type AppThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

export function AppThemeProvider({
  children,
}: AppThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children as ReactNode}
    </NextThemesProvider>
  );
}