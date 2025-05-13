import React from "react";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

const ShareSetSection = ({ control }) => {
  return (
    <FormField
      control={control}
      name="isShared"
      render={({ field }) => (
        <FormItem className="flex items-center justify-between">
          <div className="font-medium text-sm">다른 사용자에게 공개</div>
          <FormControl>
            <Switch
              checked={field.value === 1}
              onCheckedChange={(checked) => {
                field.onChange(checked ? 1 : 0);
              }}
              className="data-[state=checked]:bg-blue-500"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ShareSetSection;
