import { SideNavItem, SideNavLink, SideNavList } from "@/components/rhc";
import { PackagesIcon } from "@/components/icons/packagesIcon";
import { PuzzleIcon } from "@/components/icons/puzzleIcon";

type MenuItem = { id: string; name: string };

/** The menu on the demo pages; the layout passes the items in. */
export type DemoMenu = {
  components: MenuItem[];
  lists: MenuItem[];
  patterns: MenuItem[];
};

const PATTERNS_PATH = "/demo/ontwerppatronen";

/**
 * Side navigation on the demo pages. On /demo: to each component. On the
 * design patterns: to each pattern.
 */
const DemoNavigation = ({
  pathname,
  menu,
}: {
  pathname: string;
  menu: DemoMenu;
}) => {
  const onPatterns =
    pathname === PATTERNS_PATH || pathname.startsWith(`${PATTERNS_PATH}/`);
  return (
    <>
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/" icon="home">
            Home
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      {onPatterns ? (
        <>
          <SideNavList>
            <SideNavItem>
              <SideNavLink href="/demo">
                <PuzzleIcon />
                Componenten
              </SideNavLink>
            </SideNavItem>
            <SideNavItem>
              <SideNavLink
                current={pathname === PATTERNS_PATH}
                href={PATTERNS_PATH}
              >
                <PackagesIcon />
                Ontwerppatronen
              </SideNavLink>
            </SideNavItem>
          </SideNavList>
          <SideNavList>
            {menu.patterns.map(({ id, name }) => (
              <SideNavItem key={id}>
                <SideNavLink
                  current={pathname === `${PATTERNS_PATH}/${id}`}
                  href={`${PATTERNS_PATH}/${id}`}
                >
                  <PackagesIcon />
                  {name}
                </SideNavLink>
              </SideNavItem>
            ))}
          </SideNavList>
        </>
      ) : (
        <>
          <SideNavList>
            <SideNavItem>
              <SideNavLink href={PATTERNS_PATH}>
                <PackagesIcon />
                Ontwerppatronen
              </SideNavLink>
            </SideNavItem>
          </SideNavList>
          <SideNavList>
            {menu.components.map(({ id, name }) => (
              <SideNavItem key={id}>
                <SideNavLink href={`/demo#${id}`}>
                  <PuzzleIcon />
                  {name}
                </SideNavLink>
              </SideNavItem>
            ))}
          </SideNavList>
          <SideNavList>
            {menu.lists.map(({ id, name }) => (
              <SideNavItem key={id}>
                <SideNavLink href={`/demo#${id}`} icon="menu">
                  {name}
                </SideNavLink>
              </SideNavItem>
            ))}
          </SideNavList>
        </>
      )}
    </>
  );
};

export default DemoNavigation;
