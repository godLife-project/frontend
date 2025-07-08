import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { iconMap, renderIcon } from "./icon-utils";

export function CustomInput({ 
  customValue, 
  setCustomValue, 
  selectedIconKey, 
  setSelectedIconKey, 
  addCustomOption, 
  setIsCustomInputActive, 
  field 
}) {
  const customInputRef = useRef(null);

  useEffect(() => {
    if (customInputRef.current) {
      customInputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col w-full mt-2 gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 hover:bg-gray-50">
              {renderIcon(selectedIconKey, 20)}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-white border shadow-md rounded-md p-1">
              <div className="grid grid-cols-5 gap-1 p-2">
                {Object.keys(iconMap).map((iconKey) => (
                  <button
                    key={iconKey}
                    type="button"
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded hover:bg-blue-50 transition-colors",
                      selectedIconKey === iconKey ? "bg-blue-100" : ""
                    )}
                    onClick={() => setSelectedIconKey(iconKey)}
                  >
                    {renderIcon(iconKey, 20)}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Input
          ref={customInputRef}
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="직접 입력하세요"
          className="flex-grow"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustomOption(field);
            } else if (e.key === 'Escape') {
              setIsCustomInputActive(false);
              setCustomValue("");
            }
          }}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button 
          type="button" 
          size="sm" 
          onClick={() => addCustomOption(field)}
        >
          추가
        </Button>
        <Button 
          type="button" 
          size="sm" 
          variant="outline" 
          onClick={() => {
            setIsCustomInputActive(false);
            setCustomValue("");
          }}
        >
          취소
        </Button>
      </div>
    </div>
  );
}