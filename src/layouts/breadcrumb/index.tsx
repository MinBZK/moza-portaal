"use client";

import React from "react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import ChevronIcon from "@/components/icons/chevronIcon";

const Breadcrumb = () => {
  const paths = usePathname();
  const pathNames = paths.split("/").filter((path) => path);

  // Geen breadcrumbs op home page
  if (pathNames.length == 0) {
    return;
  }
  const separator = <ChevronIcon className="h-[12px] w-[12px]" />;
  return (
    <>
      <Link
        href={"/"}
        className="text-blue-text text-sub flex items-center gap-2 px-1 pt-1.5 hover:underline sm:hidden"
      >
        <ChevronIcon className="w-[10px] rotate-180" />
        Home
      </Link>
      <ul className="m-0 hidden items-center gap-[7px] sm:flex">
        <li>
          <Link href={"/"} className="text-blue-text text-sub hover:underline">
            Home
          </Link>
        </li>
        {pathNames.length > 0 && separator}
        {pathNames.map((link, index) => {
          const href = `/${pathNames.slice(0, index + 1).join("/")}`;
          const itemLink = link[0].toUpperCase() + link.slice(1, link.length);
          return (
            <React.Fragment key={index}>
              <li className={""}>
                <Link
                  href={href}
                  className={`text-sub ${href == paths ? "text-black" : "text-blue-text hover:underline"}`}
                >
                  {itemLink}
                </Link>
              </li>
              {pathNames.length !== index + 1 && separator}
            </React.Fragment>
          );
        })}
      </ul>
    </>
  );
};

export default Breadcrumb;
