"use client";

import {
  AlertCircle,
  Bookmark,
  CloudCog,
  Cog,
  Group,
  LayoutGrid,
  Settings,
  ShieldCheck,
  SquareChartGantt,
  SquarePen,
  Tag,
  Timer,
  UserCog,
} from "lucide-react";

import {
  AWSIcon,
} from "@/components/icons/Icons";
import { GroupProps } from "@/types";

export const getMenuList = (pathname: string): GroupProps[] => {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "",
          label: "Analytics",
          icon: LayoutGrid,
          submenus: [
            {
              href: "/",
              label: "AWS Well Architecture Overview",
              icon: SquareChartGantt,
              active: pathname === "/",
            },
            {
              href: "/compliance",
              label: "AWS Compliance",
              icon: ShieldCheck,
              active: pathname === "/compliance",
            },
          ],
          defaultOpen: true,
        },
      ],
    },

    {
      groupLabel: "AWS Issues",
      menus: [
        {
          href: "",
          label: "Top failed AWS issues",
          icon: Bookmark,
          submenus: [
            {
              href: "/findings?filter[status__in]=FAIL&filter[provider_type__in]=aws&sort=severity,-inserted_at",
              label: "AWS Misconfigurations",
              icon: AlertCircle,
            },
            {
              href: "/findings?filter[status__in]=FAIL&filter[severity__in]=critical%2Chigh%2Cmedium&filter[provider_type__in]=aws&filter[service__in]=iam&sort=-inserted_at",
              label: "AWS IAM Issues",
              icon: ShieldCheck,
            },
          ],
          defaultOpen: false,
        },
        {
          href: "",
          label: "High-risk AWS findings",
          icon: SquarePen,
          submenus: [
            {
              href: "/findings?filter[status__in]=FAIL&filter[severity__in]=critical%2Chigh%2Cmedium&filter[provider_type__in]=aws&sort=severity,-inserted_at",
              label: "Amazon Web Services",
              icon: AWSIcon,
            },
          ],
          defaultOpen: false,
        },
        {
          href: "/findings?filter[provider_type__in]=aws",
          label: "Browse all AWS findings",
          icon: Tag,
        },
      ],
    },

    {
      groupLabel: "AWS Settings",
      menus: [
        {
          href: "",
          label: "AWS Configuration",
          icon: Settings,
          submenus: [
            { href: "/providers?filter[provider_type__in]=aws", label: "AWS Providers", icon: CloudCog },
            { href: "/manage-groups?filter[provider_type__in]=aws", label: "AWS Provider Groups", icon: Group },
            { href: "/scans?filter[provider_type__in]=aws", label: "AWS Scan Jobs", icon: Timer },
            { href: "/roles", label: "Roles", icon: UserCog },
          ],
          defaultOpen: true,
        },
      ],
    },
  ];
};
