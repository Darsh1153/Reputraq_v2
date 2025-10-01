"use client";
import React, { useState, useEffect } from "react";
import {
  FloatingNav,
  type NavItem,
} from "@/components/ui/floating-navbar";
import { Home, User, Settings, Mail, Search, BarChart3 } from "lucide-react";

export function FloatingNavDemo() {
  const [active, setActive] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Features",
      link: "/#features",
      icon: <BarChart3 className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Pricing",
      link: "/#pricing",
      icon: <Settings className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Contact",
      link: "/#contact",
      icon: <Mail className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ];

  return (
    <div className="relative w-full">
      <FloatingNav navItems={navItems} />
    </div>
  );
}
