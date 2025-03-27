import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  placeholder = "검색...",
  className = "",
  onSearch = null,
}) => {
  // 입력 중인 검색어를 관리하는 내부 상태
  const [inputValue, setInputValue] = useState(searchTerm || "");

  // 폼 설정
  const form = useForm({
    defaultValues: {
      search: inputValue,
    },
  });

  // 입력 변경 핸들러 - 내부 상태만 업데이트
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // 폼 제출 핸들러 - 실제 검색 실행
  const onSubmit = (data) => {
    setSearchTerm(data.search); // 부모 컴포넌트의 상태 업데이트
    if (onSearch) {
      onSearch(data.search);
    }
  };

  // 클리어 버튼 핸들러
  const handleClear = () => {
    setInputValue("");
    form.reset({ search: "" });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`relative ${className}`}
      >
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative flex">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder={placeholder}
                      value={inputValue}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange(e);
                      }}
                      className="pl-10 pr-10 h-10"
                    />
                    {inputValue && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={handleClear}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                  <Button type="submit" className="ml-2">
                    검색
                  </Button>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default SearchBar;
