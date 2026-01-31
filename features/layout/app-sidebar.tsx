"use client";

import {
  DashboardSquare01Icon,
  Menu02Icon,
  Note01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";

interface NavItem {
  href: string;
  label: string;
  icon: typeof DashboardSquare01Icon;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "대시보드",
    icon: DashboardSquare01Icon,
  },
  {
    href: "/trades",
    label: "매매 목록",
    icon: Note01Icon,
  },
];

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="메인 네비게이션">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2",
                  "text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  "focus-visible:outline-none",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={18}
                  strokeWidth={2}
                  aria-hidden
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarHeader() {
  return (
    <div className="flex h-14 items-center px-4">
      <Link
        href="/"
        className="text-base font-semibold tracking-tight text-foreground"
      >
        Trade Log
      </Link>
    </div>
  );
}

function DesktopSidebar({ pathname }: { pathname: string }) {
  return (
    <aside
      className={cn(
        "hidden md:flex md:flex-col",
        "w-56 shrink-0 border-r bg-background",
        "h-dvh sticky top-0",
      )}
    >
      <SidebarHeader />
      <Separator />
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <NavLinks pathname={pathname} />
      </div>
    </aside>
  );
}

function MobileHeader({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "flex md:hidden items-center h-14",
        "border-b bg-background px-4 sticky top-0 z-40",
      )}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="메뉴 열기" />
          }
        >
          <HugeiconsIcon
            icon={Menu02Icon}
            size={20}
            strokeWidth={2}
            aria-hidden
          />
        </SheetTrigger>
        <SheetContent side="left" className="w-56 p-0">
          <SheetTitle className="sr-only">네비게이션 메뉴</SheetTitle>
          <SidebarHeader />
          <Separator />
          {/* biome-ignore lint/a11y/noStaticElementInteractions: click handler closes sheet on nav */}
          <div
            className="px-3 py-3"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setOpen(false);
              }
            }}
          >
            <NavLinks pathname={pathname} />
          </div>
        </SheetContent>
      </Sheet>
      <span className="ml-3 text-sm font-semibold">Trade Log</span>
    </header>
  );
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh">
      <DesktopSidebar pathname={pathname} />
      <div className="flex flex-1 flex-col">
        <MobileHeader pathname={pathname} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
