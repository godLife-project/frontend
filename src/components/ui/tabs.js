"use client";
<<<<<<< HEAD

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

=======
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
>>>>>>> 3c89179f6abba90b38b8ccbb7076cce3d51b6cda
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

<<<<<<< HEAD
const TabsList = React.forwardRef((props, ref) => {
  const { className, ...rest } = props;
=======
const TabsList = React.forwardRef(function TabsList(
  { className, ...props },
  ref
) {
>>>>>>> 3c89179f6abba90b38b8ccbb7076cce3d51b6cda
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
<<<<<<< HEAD
      {...rest}
=======
      {...props}
>>>>>>> 3c89179f6abba90b38b8ccbb7076cce3d51b6cda
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

<<<<<<< HEAD
const TabsTrigger = React.forwardRef((props, ref) => {
  const { className, ...rest } = props;
=======
const TabsTrigger = React.forwardRef(function TabsTrigger(
  { className, ...props },
  ref
) {
>>>>>>> 3c89179f6abba90b38b8ccbb7076cce3d51b6cda
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
        className
      )}
<<<<<<< HEAD
      {...rest}
=======
      {...props}
>>>>>>> 3c89179f6abba90b38b8ccbb7076cce3d51b6cda
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

<<<<<<< HEAD
const TabsContent = React.forwardRef((props, ref) => {
  const { className, ...rest } = props;
=======
const TabsContent = React.forwardRef(function TabsContent(
  { className, ...props },
  ref
) {
>>>>>>> 3c89179f6abba90b38b8ccbb7076cce3d51b6cda
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
<<<<<<< HEAD
      {...rest}
=======
      {...props}
>>>>>>> 3c89179f6abba90b38b8ccbb7076cce3d51b6cda
    />
  );
});
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
