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
    <div className="fixed inset-x-0 top-0 z-50 border-b border-indigo-300/15 bg-gradient-to-b from-[#121534]/92 via-[#0b0d25]/88 to-[#070a1c]/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_50px_-28px_rgba(1,3,12,0.95)] backdrop-blur-xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-400/[0.12] via-violet-500/[0.04] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"
      />
      <HeroUINavbar
        isMenuOpen={isMenuOpen}
        height="3.5rem"
        maxWidth="full"
        position="static"
        onMenuOpenChange={setIsMenuOpen}
        className="relative bg-transparent border-none"
        classNames={{
          wrapper:
            "bg-transparent px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden",
          menu: "bg-[#0a0c24]/97 backdrop-blur-xl",
          menuItem: "bg-transparent",
          toggle: "text-indigo-100",
        }}
      >
        <NavbarContent
          className="hidden basis-1/5 overflow-hidden lg:flex lg:basis-full"
          justify="start"
        >
          <ul className="flex flex-nowrap justify-start gap-1 overflow-x-hidden sm:gap-2">
            {siteConfig.navItems.map((item) => {
              const targetId = item.href.replace("#", "");
              const isActive = activeSection === targetId;

              return (
                <NavbarItem key={item.href} className="flex-shrink-0">
                  <a
                    aria-current={isActive ? "location" : undefined}
                    className={clsx(
                      "relative inline-flex items-center rounded-full px-3 py-1 text-sm whitespace-nowrap transition-colors duration-200 sm:text-base",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070a1c]",
                      isActive
                        ? "bg-indigo-400/15 font-medium text-white ring-1 ring-inset ring-indigo-300/20"
                        : "text-zinc-200/90 hover:bg-white/[0.06] hover:text-white",
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
              <GithubIcon className="text-indigo-200/75 transition-colors group-hover:text-white" />
            </Link>
            <Link
              isExternal
              aria-label="LinkedIn"
              className="group"
              href={siteConfig.links.linkedin}
            >
              <LinkedInIcon className="text-indigo-200/75 transition-colors group-hover:text-white" />
            </Link>
            <Link
              aria-label="Email"
              className="group"
              href={siteConfig.links.email}
            >
              <MailIcon className="text-indigo-200/75 transition-colors group-hover:text-white" />
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
              <GithubIcon className="text-indigo-200/75 transition-colors group-hover:text-white" />
            </Link>
            <Link
              aria-label="Email"
              className="group"
              href={siteConfig.links.email}
            >
              <MailIcon className="text-indigo-200/75 transition-colors group-hover:text-white" />
            </Link>
            <Link
              isExternal
              aria-label="LinkedIn"
              className="group"
              href={siteConfig.links.linkedin}
            >
              <LinkedInIcon className="text-indigo-200/75 transition-colors group-hover:text-white" />
            </Link>
            <NavbarMenuToggle
              aria-label={
                isMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              className="ml-1 text-indigo-100 touch-manipulation"
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
                        ? "bg-indigo-400/15 font-medium text-white ring-1 ring-inset ring-indigo-300/20"
                        : "text-zinc-200/90 hover:bg-white/[0.06] hover:text-white",
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
