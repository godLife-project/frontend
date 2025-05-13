import React from "react";
import { Clock, Eye, Heart, GitFork, Flame } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SortOptions = ({ currentSort, onSortChange }) => {
  // 정렬 표시 아이콘
  const getSortIcon = (sortType) => {
    switch (sortType) {
      case "latest":
        return <Clock size={18} />;
      case "view":
        return <Eye size={18} />;
      case "like":
        return <Heart size={18} />;
      case "fork":
        return <GitFork size={18} />;
      case "fire":
        return <Flame size={18} />;
      default:
        return <Clock size={18} />;
    }
  };

  // 정렬 표시 텍스트
  const getSortText = (sortType) => {
    switch (sortType) {
      case "latest":
        return "최신순";
      case "view":
        return "조회순";
      case "like":
        return "추천순";
      case "fork":
        return "포크순";
      case "fire":
        return "불꽃순";
      default:
        return "최신순";
    }
  };

  return (
    <Select value={currentSort} onValueChange={onSortChange}>
      <SelectTrigger className="w-32">
        <div className="flex items-center space-x-2">
          {getSortIcon(currentSort)}
          <span>{getSortText(currentSort)}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="latest" className="flex items-center">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="mr-2" />
            <span>최신순</span>
          </div>
        </SelectItem>
        <SelectItem value="view">
          <div className="flex items-center space-x-2">
            <Eye size={16} className="mr-2" />
            <span>조회순</span>
          </div>
        </SelectItem>
        <SelectItem value="like">
          <div className="flex items-center space-x-2">
            <Heart size={16} className="mr-2" />
            <span>추천순</span>
          </div>
        </SelectItem>
        <SelectItem value="fork">
          <div className="flex items-center space-x-2">
            <GitFork size={16} className="mr-2" />
            <span>포크순</span>
          </div>
        </SelectItem>
        <SelectItem value="fire">
          <div className="flex items-center space-x-2">
            <Flame size={16} className="mr-2" />
            <span>불꽃순</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortOptions;
