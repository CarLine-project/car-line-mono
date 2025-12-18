import { ReactNode } from "react";
import { QueryProvider } from "./query-provider";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return <QueryProvider>{children}</QueryProvider>;
};
