"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

import { type ClientEventAnalyticsType, useEventAnalytics } from "./EventAnalyticsProvider";

type EventAnalyticsLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  analyticsType: ClientEventAnalyticsType;
  children: ReactNode;
};

export default function EventAnalyticsLink({
  analyticsType,
  onClick,
  children,
  ...props
}: EventAnalyticsLinkProps) {
  const { track } = useEventAnalytics();

  return (
    <a
      {...props}
      onClick={(event) => {
        track(analyticsType);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
