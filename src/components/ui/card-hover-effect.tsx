"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    icon: React.ReactNode;
    highlight?: boolean;
    large?: boolean;
    full?: boolean;
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className={cn(
            "relative group block h-full w-full",
            item.full && "sm:col-span-2 lg:col-span-3",
            item.large && !item.full && "sm:col-span-2 lg:col-span-2"
          )}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-primary/5 block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card large={item.large || item.full} highlight={item.highlight}>
            <div className={cn(
              "flex gap-6",
              item.large ? "flex-col sm:flex-row sm:items-start" : "flex-col"
            )}>
              <CardIcon highlight={item.highlight} large={item.large}>
                {item.icon}
              </CardIcon>
              <div className="space-y-3 flex-1">
                <CardTitle large={item.large}>{item.title}</CardTitle>
                <CardDescription large={item.large}>{item.description}</CardDescription>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

const Card = ({
  className,
  children,
  large,
  highlight,
}: {
  className?: string;
  children: React.ReactNode;
  large?: boolean;
  highlight?: boolean;
}) => {
  return (
    <div
      className={cn(
        "relative z-20 h-full w-full overflow-hidden rounded-3xl border border-border/60 bg-card transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-xl",
        large ? "p-8" : "p-6",
        className
      )}
    >
      <div className={cn(
        "pointer-events-none absolute rounded-full transition-transform duration-500 group-hover:scale-150",
        highlight ? "bg-accent/5" : "bg-primary/5",
        large ? "-right-12 -top-12 h-40 w-40" : "-right-8 -top-8 h-24 w-24"
      )} />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const CardIcon = ({
  className,
  children,
  highlight,
  large,
}: {
  className?: string;
  children: React.ReactNode;
  highlight?: boolean;
  large?: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
        highlight ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary",
        large ? "h-16 w-16" : "h-14 w-14",
        className
      )}
    >
      {children}
    </div>
  );
};

const CardTitle = ({
  className,
  children,
  large,
}: {
  className?: string;
  children: React.ReactNode;
  large?: boolean;
}) => {
  return (
    <h3 className={cn(
      "font-serif font-medium",
      large ? "text-2xl" : "text-xl",
      className
    )}>
      {children}
    </h3>
  );
};

const CardDescription = ({
  className,
  children,
  large,
}: {
  className?: string;
  children: React.ReactNode;
  large?: boolean;
}) => {
  return (
    <p
      className={cn(
        "leading-relaxed text-muted-foreground",
        large ? "text-base" : "text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};
