"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/navbar";
import clsx from "clsx";

import { GithubIcon, LinkedInIcon, MailIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";

// The glide runs even when the OS asks for reduced motion — it is part of the
// site's feel — but wheel/touch/key input cancels it. See AGENTS.md before
// adding a `prefers-reduced-motion` short-circuit.
// NAVBAR_OFFSET matches the 3rem app bar height and `scroll-margin-top`.
const NAVBAR_OFFSET = 48;
const MIN_SCROLL_DURATION = 400;
const MAX_SCROLL_DURATION = 900;

const easeInOutCubic = (progress: number) =>
  progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const scrollFrameRef = useRef<number | null>(null);
  const scrollCleanupRef = useRef<(() => void) | null>(null);

  const stopScroll = () => {
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }

    scrollCleanupRef.current?.();
    scrollCleanupRef.current = null;
  };

  const handleSmoothScroll = (event: MouseEvent, href: string) => {
    // Let the browser handle new-tab/window clicks and modified navigation.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);

    if (!targetElement) return;

    stopScroll();

    const startY = window.scrollY;
    const targetY =
      targetElement.getBoundingClientRect().top + startY - NAVBAR_OFFSET;
    const distance = targetY - startY;

    if (Math.abs(distance) < 2) return;

    const duration = Math.min(
      MAX_SCROLL_DURATION,
      Math.max(MIN_SCROLL_DURATION, Math.abs(distance) * 0.35),
    );
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);

      window.scrollTo(0, startY + distance * easeInOutCubic(progress));

      if (progress < 1) {
        scrollFrameRef.current = requestAnimationFrame(step);
        return;
      }

      stopScroll();
    };

    // A manual gesture should always win over the animation.
    const cancelOnUserInput = () => stopScroll();

    window.addEventListener("wheel", cancelOnUserInput, { passive: true });
    window.addEventListener("touchstart", cancelOnUserInput, { passive: true });
    window.addEventListener("keydown", cancelOnUserInput);
    scrollCleanupRef.current = () => {
      window.removeEventListener("wheel", cancelOnUserInput);
      window.removeEventListener("touchstart", cancelOnUserInput);
      window.removeEventListener("keydown", cancelOnUserInput);
    };

    scrollFrameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
      }

      scrollCleanupRef.current?.();
    };
  }, []);

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
        {/* Equal empty grow items on both sides keep the cluster in the true center. */}
        <NavbarContent
          aria-hidden="true"
          as="div"
          className="hidden lg:flex"
          justify="start"
        />

        <NavbarContent as="div" className="hidden lg:flex" justify="center">
          <ul className="flex h-full flex-nowrap items-stretch justify-center overflow-x-hidden">
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
                    onClick={(event) => handleSmoothScroll(event, item.href)}
                  >
                    {item.label}
                  </a>
                </NavbarItem>
              );
            })}
          </ul>

          <span
            aria-hidden="true"
            className="h-5 w-px flex-shrink-0 bg-white/15"
          />

          <div className="flex flex-shrink-0 items-center gap-3">
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
          </div>
        </NavbarContent>

        <NavbarContent
          aria-hidden="true"
          as="div"
          className="hidden lg:flex"
          justify="end"
        />

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
                      "relative block rounded-xl px-3 py-2 text-lg transition-colors",
                      isActive
                        ? "bg-white/[0.08] font-medium text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-white/70"
                        : "text-zinc-300/85 hover:bg-white/[0.05] hover:text-white",
                    )}
                    href={item.href}
                    onClick={(event) => {
                      handleSmoothScroll(event, item.href);
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
