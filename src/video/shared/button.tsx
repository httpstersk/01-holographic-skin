import type { ComponentProps } from "react";

import { cn } from "@/lib/resolve-class-name";

import { useTone } from "./tone";

export type ButtonProps = ComponentProps<"button">;

const PLATE = [
  "bg-media-background",
  // Hover, focus, and an open menu fill the oval with foil and cut the icon out of it.
  "hover:bg-media-foreground hover:text-media-background",
  "focus-visible:bg-media-foreground focus-visible:text-media-background",
  "aria-expanded:bg-media-foreground aria-expanded:text-media-background",
  "aria-disabled:hover:bg-media-background aria-disabled:hover:text-inherit",
];

// On the foil bar a control is bare ink. Hover, focus, and an open menu flip it to a black disc with the foil in its icon.
const GHOST = [
  "bg-transparent",
  "hover:bg-media-background hover:text-media-foreground",
  "focus-visible:bg-media-background focus-visible:text-media-foreground",
  "aria-expanded:bg-media-background aria-expanded:text-media-foreground",
  "aria-disabled:hover:bg-transparent aria-disabled:hover:text-inherit",
];

export function Button({ className, ...props }: ButtonProps) {
  const tone = useTone();

  return (
    <button
      className={cn(
        "group/btn relative grid size-8 shrink-0 cursor-pointer touch-manipulation place-items-center rounded-media-control p-0 text-inherit",
        tone === "plate" ? PLATE : GHOST,
        "transition-[background-color,border-color,color,scale,translate,transform] duration-(--feel-duration,150ms) ease-(--feel-ease,ease-out) motion-reduce:transition-none",
        tone === "plate"
          ? "motion-safe:hover:-translate-y-(--feel-lift,2px) motion-safe:hover:scale-(--feel-scale,1.08) motion-safe:active:translate-y-0 motion-safe:active:scale-92"
          : "motion-safe:hover:scale-(--feel-ghost-scale,1.05) motion-safe:active:scale-95",
        "focus-visible:z-10 focus-visible:focus-holo",
        // A disabled control keeps its opaque plate and dims only what is stamped on it.
        "outline-none aria-disabled:cursor-not-allowed aria-disabled:*:opacity-40 disabled:cursor-not-allowed disabled:*:opacity-40",
        tone === "plate" &&
          "media-high-contrast:hover:bg-media-foreground media-high-contrast:hover:text-media-background media-high-contrast:focus-visible:bg-media-foreground media-high-contrast:focus-visible:text-media-background",
        tone === "plate" &&
          "media-high-contrast:aria-expanded:bg-media-foreground media-high-contrast:aria-expanded:text-media-background",
        "media-high-contrast:border media-high-contrast:border-solid media-high-contrast:border-current",
        "forced-colors:border forced-colors:border-solid forced-colors:border-[ButtonText] forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText]",
        "forced-colors:forced-color-adjust-none",
        "forced-colors:hover:bg-[Highlight] forced-colors:hover:text-[HighlightText] forced-colors:focus-visible:bg-[Highlight] forced-colors:focus-visible:text-[HighlightText]",
        "forced-colors:aria-expanded:bg-[Highlight] forced-colors:aria-expanded:text-[HighlightText] forced-colors:aria-disabled:text-[GrayText] forced-colors:aria-disabled:opacity-100",
        "data-hidden:hidden",
        className,
      )}
      // A ghost button takes its light from the plate it sits in; a plate of its own would tint what lies beneath.
      data-holo={tone === "ghost" ? undefined : ""}
      {...props}
    />
  );
}

/** Text that opens out beside an icon while its button is hovered or focused. Decorative; the button is already named. */
export function HoverLabel({ children }: { children: string }) {
  return (
    <span
      aria-hidden="true"
      className="col-start-2 row-start-1 max-w-0 overflow-hidden text-media-sm font-medium whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-(--feel-duration,150ms) motion-reduce:transition-none group-hover/btn:ms-1.5 group-hover/btn:max-w-32 group-hover/btn:opacity-100 group-focus-visible/btn:ms-1.5 group-focus-visible/btn:max-w-32 group-focus-visible/btn:opacity-100"
    >
      {children}
    </span>
  );
}
