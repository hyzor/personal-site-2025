"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { useState, useEffect } from "react";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { GithubIcon, LinkedInIcon, MailIcon } from "@/components/icons";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const handleSmoothScroll = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      targetElement.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection((prev) =>
            entry.target.id === prev ? prev : entry.target.id,
          );
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    siteConfig.navItems.forEach((item) => {
      const targetId = item.href.replace("#", "");
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        observer.observe(targetElement);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const handleDesktopChange = () => {
      if (desktopQuery.matches) {
        setIsMenuOpen(false);
      }
    };

    desktopQuery.addEventListener("change", handleDesktopChange);

    return () => {
      desktopQuery.removeEventListener("change", handleDesktopChange);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-gradient-to-b from-[#30303a]/80 via-[#27272f]/76 to-[#202026]/81 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_18px_45px_-26px_rgba(0,0,0,0.85)] backdrop-blur-2xl backdrop-saturate-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
      <HeroUINavbar
        isMenuOpen={isMenuOpen}
        height="3rem"
        maxWidth="full"
        position="static"
        onMenuOpenChange={setIsMenuOpen}
        className="relative bg-transparent border-none"
        classNames={{
          wrapper:
            "bg-transparent px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden",
          menu: "bg-[#202026]/90 backdrop-blur-2xl backdrop-saturate-50",
          menuItem: "bg-transparent",
          toggle: "text-zinc-200",
        }}
      >
        <NavbarContent
          className="hidden basis-1/5 overflow-hidden lg:flex lg:basis-full"
          justify="start"
        >
          <ul className="flex h-full flex-nowrap items-stretch justify-start overflow-x-hidden">
            {siteConfig.navItems.map((item) => {
              const targetId = item.href.replace("#", "");
              const isActive = activeSection === targetId;

              return (
                <NavbarItem key={item.href} className="h-full flex-shrink-0">
                  <a
                    aria-current={isActive ? "location" : undefined}
                    className={clsx(
                      "relative inline-flex h-full items-center px-3 text-sm whitespace-nowrap transition-colors duration-200 sm:px-4 sm:text-base",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101013]",
                      isActive
                        ? "bg-white/[0.08] font-medium text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-white/70"
                        : "text-zinc-300/85 hover:bg-white/[0.05] hover:text-white",
                    )}
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                  >
                    {item.label}
                  </a>
                </NavbarItem>
              );
            })}
          </ul>
        </NavbarContent>

        <NavbarContent
          className="hidden basis-1/5 overflow-hidden lg:flex lg:basis-full"
          justify="end"
        >
          <NavbarItem className="flex flex-shrink-0 gap-2 sm:gap-4">
            <Link
              isExternal
              aria-label="Github"
              className="group"
              href={siteConfig.links.github}
            >
              <GithubIcon className="text-zinc-300/75 transition-colors group-hover:text-white" />
            </Link>
            <Link
              isExternal
              aria-label="LinkedIn"
              className="group"
              href={siteConfig.links.linkedin}
            >
              <LinkedInIcon className="text-zinc-300/75 transition-colors group-hover:text-white" />
            </Link>
            <Link
              aria-label="Email"
              className="group"
              href={siteConfig.links.email}
            >
              <MailIcon className="text-zinc-300/75 transition-colors group-hover:text-white" />
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent
          className="flex basis-1 pl-2 pr-2 lg:hidden"
          justify="end"
        >
          <NavbarItem className="flex flex-shrink-0 items-center gap-3">
            <Link
              isExternal
              aria-label="Github"
              className="group"
              href={siteConfig.links.github}
            >
              <GithubIcon className="text-zinc-300/75 transition-colors group-hover:text-white" />
            </Link>
            <Link
              aria-label="Email"
              className="group"
              href={siteConfig.links.email}
            >
              <MailIcon className="text-zinc-300/75 transition-colors group-hover:text-white" />
            </Link>
            <Link
              isExternal
              aria-label="LinkedIn"
              className="group"
              href={siteConfig.links.linkedin}
            >
              <LinkedInIcon className="text-zinc-300/75 transition-colors group-hover:text-white" />
            </Link>
            <NavbarMenuToggle
              aria-label={
                isMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              className="ml-1 text-zinc-200 touch-manipulation"
            />
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu>
          <div className="mx-4 mt-2 flex flex-col gap-2">
            {siteConfig.navItems.map((item) => {
              const targetId = item.href.replace("#", "");
              const isActive = activeSection === targetId;

              return (
                <NavbarMenuItem key={item.href}>
                  <a
                    aria-current={isActive ? "location" : undefined}
                    className={clsx(
                      "block rounded-xl px-3 py-2 text-lg transition-colors",
                      isActive
                        ? "bg-white/[0.08] font-medium text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-white/70"
                        : "text-zinc-300/85 hover:bg-white/[0.05] hover:text-white",
                    )}
                    href={item.href}
                    onClick={(e) => {
                      handleSmoothScroll(e, item.href);
                      setIsMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </a>
                </NavbarMenuItem>
              );
            })}
          </div>
        </NavbarMenu>
      </HeroUINavbar>
    </div>
  );
};
