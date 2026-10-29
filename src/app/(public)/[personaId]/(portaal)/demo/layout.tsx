import type { Metadata } from "next";
import type { ReactNode } from "react";

// The demo page is a client component and cannot export metadata itself.
export const metadata: Metadata = { title: "Componenten" };

const DemoLayout = ({ children }: { children: ReactNode }) => children;

export default DemoLayout;
