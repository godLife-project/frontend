"use client";
<<<<<<< HEAD
import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
=======

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

>>>>>>> chaerim
import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef(function ScrollArea(
  { className, children, ...props },
  ref
) {
  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
<<<<<<< HEAD
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
=======
>>>>>>> chaerim

const ScrollBar = React.forwardRef(function ScrollBar(
  { className, orientation = "vertical", ...props },
  ref
) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent p-[1px]",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
});
<<<<<<< HEAD
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;
=======
>>>>>>> chaerim

export { ScrollArea, ScrollBar };
