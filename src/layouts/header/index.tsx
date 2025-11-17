"use client";

import { Button, Icon, PageHeader } from "@/components/nl-design-system";
import ProfileSelect from "@/components/profileSelect";
import { SignOutAction } from "@/utils/auth/signOutAction";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Navigation from "../navigation";
import ChevronIcon from "@/components/icons/chevronIcon";
import { components } from "@/network/kvk/generated";

const Header = ({
  kvk,
  kvkOpties,
}: {
  kvk: string;
  kvkOpties: components["schemas"]["MijnOverheidOrganisatiesResponse"];
}) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const mobileMenuRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (menuOpened && mobileMenuRef.current) mobileMenuRef.current.showModal();
    if (menuOpened === false && mobileMenuRef.current)
      mobileMenuRef.current.close();
  }, [menuOpened]);

  return (
    <>
      <PageHeader className="border-primary mb-3 border-b-2 bg-white shadow">
        <div className="container mx-auto grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] grid-rows-1 gap-x-2 px-2 md:grid-rows-[auto_minmax(0,1fr)] md:gap-x-4">
          <button
            type="button"
            onClick={() => setMenuOpened(true)}
            className="col-1 row-1 flex items-center gap-2 md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16"
              viewBox="0 0 16 16"
              width="16"
            >
              <path
                d="M2.5 12h11a1 1 0 0 1 0 2h-11a1 1 0 0 1 0-2zm11-5a1 1 0 0 1 0 2h-11a1 1 0 1 1 0-2zm0-5a1 1 0 0 1 0 2h-11a1 1 0 1 1 0-2z"
                fill="#007bc7"
                fillRule="evenodd"
              />
            </svg>
            <span className="font-bold">menu</span>
          </button>
          <Image
            src="/logo.png"
            alt="Logo"
            width={44}
            height={78}
            className="col-2 row-1 w-[32px] pb-2 md:w-[44px]"
          />
          <div className="col-3 row-1 flex items-center justify-between md:col-start-1 md:col-end-4 md:row-2 md:pb-2.5">
            <span role="banner" className="text-h4 md:text-h1">
              MijnOverheidZakelijk
            </span>
            <div className="hidden gap-4 md:flex">
              <ProfileSelect selectedKvK={kvk} kvkOpties={kvkOpties} />
              <Button
                appearance="subtle-button"
                onClick={() => {
                  SignOutAction();
                }}
              >
                <Icon icon="uitloggen" />
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </PageHeader>
      <dialog
        ref={mobileMenuRef}
        className={`fixed inset-0 z-1 w-[288px] backdrop:bg-black/50 md:hidden`}
        onClick={() => setMenuOpened(false)}
      >
        <div
          className="flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setMenuOpened(false)}
            className="flex gap-2 p-4"
          >
            <ChevronIcon className="stroke-primary w-4 rotate-180" />
            <span className="font-bold">menu</span>
          </button>

          <Navigation />
          <div className="px-2">
            <ProfileSelect selectedKvK={kvk} kvkOpties={kvkOpties} />
          </div>
          <Button
            appearance="subtle-button"
            onClick={() => {
              SignOutAction();
            }}
          >
            <Icon icon="uitloggen" />
            Uitloggen
          </Button>
        </div>
      </dialog>
    </>
  );
};

export default Header;
