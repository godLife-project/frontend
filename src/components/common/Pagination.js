import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [9, 18, 27],
  itemName = "아이템",
}) => {
  return (
    <div className="mt-8 mb-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">표시 개수:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-24 h-9">
              <SelectValue placeholder="개수" />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}개
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-2 h-9"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            처음
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 h-9"
          >
            이전
          </Button>

          <div className="px-3 py-2 border rounded-md bg-white">
            <span className="text-sm">
              {currentPage} / {totalPages || 1} 페이지
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="px-2 h-9"
          >
            다음
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="px-2 h-9"
          >
            마지막
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          총 <span className="font-medium">{totalItems}</span>개의 {itemName}
        </div>
      </div>
    </div>
  );
};

export default Pagination;
