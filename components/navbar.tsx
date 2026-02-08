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
      targetElement.scrollIntoView({ behavior: "smooth" });
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
          setActiveSection(entry.target.id);
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
          className="basis-1/5 sm:basis-full overflow-hidden"
          justify="start"
        >
          <ul className="hidden lg:flex gap-2 sm:gap-4 justify-start overflow-x-hidden flex-nowrap">
            {siteConfig.navItems.map((item) => {
              const targetId = item.href.replace("#", "");
              const isActive = activeSection === targetId;

              return (
                <NavbarItem key={item.href} className="flex-shrink-0">
                  <a
                    className={clsx(
                      linkStyles({ color: "foreground" }),
                      isActive ? "text-primary font-medium" : "",
                      "text-sm sm:text-base whitespace-nowrap",
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
          className="hidden sm:flex basis-1/5 sm:basis-full overflow-hidden"
          justify="end"
        >
          <NavbarItem className="hidden sm:flex gap-2 sm:gap-4 flex-shrink-0">
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

        <NavbarContent className="sm:hidden basis-1 pl-2 pr-2" justify="end">
          <div className="flex gap-3 items-center flex-shrink-0">
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
            <NavbarMenuToggle className="ml-4 touch-manipulation" />
          </div>
        </NavbarContent>

        <NavbarMenu>
          <div className="mx-4 mt-2 flex flex-col gap-2">
            {siteConfig.navItems.map((item, index) => {
              const targetId = item.href.replace("#", "");
              const isActive = activeSection === targetId;

              return (
                <NavbarMenuItem key={`${item}-${index}`}>
                  <Link
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
