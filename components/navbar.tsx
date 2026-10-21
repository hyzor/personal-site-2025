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
import { link as linkStyles } from "@heroui/theme";
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
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md overflow-hidden">
      <HeroUINavbar
        isMenuOpen={isMenuOpen}
        maxWidth="full"
        position="static"
        onMenuOpenChange={setIsMenuOpen}
        className="bg-transparent border-none"
        classNames={{
          wrapper:
            "bg-transparent px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden",
          menu: "bg-black/20",
          menuItem: "bg-transparent",
          toggle: "bg-transparent",
        }}
      >
        <NavbarContent
          className="hidden basis-1/5 overflow-hidden lg:flex lg:basis-full"
          justify="start"
        >
          <ul className="flex flex-nowrap justify-start gap-2 overflow-x-hidden sm:gap-4">
            {siteConfig.navItems.map((item) => {
              const targetId = item.href.replace("#", "");
              const isActive = activeSection === targetId;

              return (
                <NavbarItem key={item.href} className="flex-shrink-0">
                  <a
                    aria-current={isActive ? "location" : undefined}
                    className={clsx(
                      linkStyles({ color: "foreground" }),
                      isActive ? "text-primary font-medium" : "",
                      "text-sm whitespace-nowrap sm:text-base",
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
            <Link isExternal aria-label="Github" href={siteConfig.links.github}>
              <GithubIcon className="text-default-500" />
            </Link>
            <Link
              isExternal
              aria-label="LinkedIn"
              href={siteConfig.links.linkedin}
            >
              <LinkedInIcon className="text-default-500" />
            </Link>
            <Link aria-label="Email" href={siteConfig.links.email}>
              <MailIcon className="text-default-500" />
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent
          className="flex basis-1 pl-2 pr-2 lg:hidden"
          justify="end"
        >
          <NavbarItem className="flex flex-shrink-0 items-center gap-3">
            <Link isExternal aria-label="Github" href={siteConfig.links.github}>
              <GithubIcon className="text-default-500" />
            </Link>
            <Link aria-label="Email" href={siteConfig.links.email}>
              <MailIcon className="text-default-500" />
            </Link>
            <Link
              isExternal
              aria-label="LinkedIn"
              href={siteConfig.links.linkedin}
            >
              <LinkedInIcon className="text-default-500" />
            </Link>
            <NavbarMenuToggle
              aria-label={
                isMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              className="ml-1 touch-manipulation"
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
                  <Link
                    aria-current={isActive ? "location" : undefined}
                    color={isActive ? "primary" : "foreground"}
                    href={item.href}
                    size="lg"
                    onClick={(e) => {
                      handleSmoothScroll(e, item.href);
                      setIsMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </Link>
                </NavbarMenuItem>
              );
            })}
          </div>
        </NavbarMenu>
      </HeroUINavbar>
    </div>
  );
};
