import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Marquee by Dillion Verma (21st.dev), adapted: copies after the first are hidden from
// assistive tech, and motion stops for prefers-reduced-motion (see globals.css).
interface MarqueeProps extends Omit<ComponentProps<"div">, "children"> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  // A function receives isCopy, so repeated links can leave the tab order (tabIndex={-1}).
  children?: ReactNode | ((isCopy: boolean) => ReactNode);
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      data-marquee=""
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className,
      )}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          data-marquee-copy={i === 0 ? "first" : "repeat"}
          aria-hidden={i > 0 || undefined}
          className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
            "animate-marquee flex-row": !vertical,
            "animate-marquee-vertical flex-col": vertical,
            "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]":
              pauseOnHover,
            "[animation-direction:reverse]": reverse,
          })}
        >
          {typeof children === "function" ? children(i > 0) : children}
        </div>
      ))}
    </div>
  );
}
