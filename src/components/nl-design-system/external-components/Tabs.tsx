"use client";

import "@amsterdam/design-system-assets/font/index.css";
import "@amsterdam/design-system-css/dist/index.css";
import "@amsterdam/design-system-tokens/dist/index.css";
import { Tabs as AmsTabs } from "@amsterdam/design-system-react";

export const Tabs = (props: React.ComponentProps<typeof AmsTabs>) => {
  return <AmsTabs {...props} />;
};

export const TabsList = AmsTabs.List;
export const TabsButton = AmsTabs.Button;
export const TabsPanel = AmsTabs.Panel;
