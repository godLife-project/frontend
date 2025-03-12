// icon-utils.jsx
import {
  Coffee,
  Book,
  Code,
  PenTool,
  Video,
  Star,
  Mic,
  Wrench,
  Building,
  BookOpen,
  Stethoscope,
  Scale,
  Shield,
  Heart,
  Store,
  Utensils,
  Trophy,
  MoreHorizontal,
  Sunrise,
  Moon,
  Dumbbell,
  Flower2,
  LineChart,
  Palette,
  UserCog,
  CalendarDays,
  Briefcase,
  Laptop,
  Library,
  MonitorSmartphone,
  Music,
  Car,
  Baby,
  Leaf,
  ShoppingBag,
  Camera,
  Construction,
  Factory,
  Gamepad2,
  Home,
  Hotel,
  Lightbulb,
  Mountain,
  Plane,
  Rocket,
  Shirt
  // 필요한 다른 아이콘들 추가
} from "lucide-react";

// 아이콘 맵핑
export const iconMap = {
  "coffee": Coffee,
  "book": Book,
  "code": Code,
  "pen-tool": PenTool,
  "video": Video,
  "star": Star,
  "mic": Mic,
  "wrench": Wrench,
  "building": Building,
  "book-open": BookOpen,
  "stethoscope": Stethoscope,
  "scale": Scale,
  "shield": Shield,
  "handHeart": Heart, // handHeart 대신 Heart 사용
  "store": Store,
  "utensils": Utensils,
  "trophy": Trophy,
  "more-horizontal": MoreHorizontal,
  "sunrise": Sunrise,
  "moon": Moon,
  "dumbbell": Dumbbell,
  "flower2": Flower2,
  "line-chart": LineChart,
  "palette": Palette,
  "user-cog": UserCog,
  "calendar-days": CalendarDays,
  "briefcase": Briefcase,
  "laptop": Laptop,
  "library": Library,
  "monitor": MonitorSmartphone,
  "music": Music,
  "car": Car,
  "baby": Baby,
  "plant": Leaf,
  "shopping": ShoppingBag,
  "camera": Camera,
  "construction": Construction,
  "factory": Factory,
  "gamepad2": Gamepad2,
  "home": Home,
  "hotel": Hotel,
  "lightbulb": Lightbulb,
  "mountain": Mountain,
  "plane": Plane,
  "rocket": Rocket,
  "shirt": Shirt
  // 필요한 다른 아이콘들 추가
};

// 아이콘 렌더링 함수
export function renderIcon(iconKey, size = 20, className = "", isSelected = false, color = "#3B82F6") {
  const IconComponent = iconMap[iconKey];
  
  if (!IconComponent) {
    console.warn(`Icon with key "${iconKey}" not found`);
    return null;
  }

  // 선택된 상태일 때 색상 처리
  const iconColor = isSelected ? "white" : color;

  return (
    <IconComponent
      size={size}
      className={className}
      color={iconColor}
    />
  );
}