import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function FAQWritePage() {
  const [category, setCategory] = useState("");
  const suggestions = ["루틴", "챌린지", "계정", "기타"];

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const selectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-6 pl-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        뒤로 가기
      </Button>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">FAQ 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="faqCategory" className="text-sm font-medium">
                카테고리
              </label>
              <Input
                id="faqCategory"
                value={category}
                onChange={handleCategoryChange}
                placeholder="카테고리 입력"
                className="w-full"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    onClick={() => selectCategory(suggestion)}
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                제목
              </label>
              <Input
                id="title"
                placeholder="FAQ 제목을 입력하세요"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="answer" className="text-sm font-medium">
                답변
              </label>
              <Textarea
                id="answer"
                placeholder="내용을 입력하세요"
                className="w-full"
              />
              <div className="flex justify-end space-x-4">
                <Button>취소</Button>
                <Button>등록하기</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
