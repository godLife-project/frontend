import { 
  Briefcase, 
  Store, 
  Laptop, 
  Library, 
  UtensilsCrossed, 
  Wrench, 
  Palette, 
  MonitorSmartphone,
  Music,
  Trophy,
  Car,
  Baby,
  Leaf,
  ShoppingBag,
  Building,
  Camera,
  Coffee,
  Construction,
  Dumbbell,
  Factory,
  Flower2,
  Gamepad2,
  Home,
  Hotel,
  Lightbulb,
  Mountain,
  Plane,
  Rocket,
  Shirt,
  // 새로 추가된 아이콘들
  Code,
  Star,
  Shield,
  BookOpen,
  Stethoscope,
  Scale,
  Mic,
  PenTool,
  Video,
  MoreHorizontal,
  Book,
  HandHeart
} from "lucide-react";

// 아이콘 매핑 (색상 포함)
export const iconMap = {
  // 기존 아이콘들
  briefcase: { icon: Briefcase, color: "#4A6FA5" },       // 사무직 - 짙은 파란색
  book: { icon: Book, color: "#6A5ACD" },  // 학생 - 슬레이트 블루
  store: { icon: Store, color: "#FF6B6B" },               // 자영업 - 연한 빨간색
  laptop: { icon: Laptop, color: "#4B0082" },             // 프리랜서 - 인디고
  library: { icon: Library, color: "#008080" },           // 교직/공무원 - 틸
  handHeart: { icon: HandHeart, color: "#FF4500" },     // 의료직 - 오렌지 레드
  utensils: { icon: UtensilsCrossed, color: "#DAA520" },  // 서비스직 - 골든로드
  wrench: { icon: Wrench, color: "#696969" },             // 기술직 - 딤그레이
  palette: { icon: Palette, color: "#9932CC" },           // 예술/디자인 - 다크 오키드
  monitor: { icon: MonitorSmartphone, color: "#1E90FF" }, // IT/개발 - 도저 블루
  music: { icon: Music, color: "#8A2BE2" },               // 음악/엔터테인먼트 - 블루 바이올렛
  trophy: { icon: Trophy, color: "#FFD700" },             // 스포츠/레저 - 골드
  car: { icon: Car, color: "#4682B4" },                   // 운송/물류 - 스틸 블루
  baby: { icon: Baby, color: "#FF69B4" },                 // 보육/교육 - 핫 핑크
  plant: { icon: Leaf, color: "#228B22" },                // 농업/환경 - 포레스트 그린
  shopping: { icon: ShoppingBag, color: "#FF8C00" },      // 유통/판매 - 다크 오렌지
  building: { icon: Building, color: "#A52A2A" },         // 건설/부동산 - 브라운
  camera: { icon: Camera, color: "#800080" },             // 미디어/방송 - 퍼플
  coffee: { icon: Coffee, color: "#8B4513" },             // 카페/요식업 - 새들 브라운
  construction: { icon: Construction, color: "#FF8C00" }, // 건설현장 - 다크 오렌지
  dumbbell: { icon: Dumbbell, color: "#708090" },         // 체육/스포츠 - 슬레이트 그레이
  factory: { icon: Factory, color: "#CD5C5C" },           // 제조/공장 - 인디언 레드
  flower2: { icon: Flower2, color: "#FF1493" },           // 원예/꽃 - 딥 핑크
  gamepad2: { icon: Gamepad2, color: "#32CD32" },         // 게임/엔터테인먼트 - 라임 그린
  home: { icon: Home, color: "#20B2AA" },                 // 가정/주거 - 라이트 시 그린
  hotel: { icon: Hotel, color: "#9370DB" },               // 호텔/숙박업 - 미디엄 퍼플
  lightbulb: { icon: Lightbulb, color: "#FFA500" },       // 아이디어/창업 - 오렌지
  mountain: { icon: Mountain, color: "#2F4F4F" },         // 여행/아웃도어 - 다크 슬레이트 그레이
  plane: { icon: Plane, color: "#00BFFF" },               // 항공/여행 - 딥 스카이 블루
  rocket: { icon: Rocket, color: "#DC143C" },             // 우주/과학 - 크림슨
  shirt: { icon: Shirt, color: "#6495ED" },               // 패션/의류 - 콘플라워 블루
  
  // 새로 추가된 아이콘들
  code: { icon: Code, color: "#1E90FF" },                 // 개발자 - 도저 블루
  star: { icon: Star, color: "#8A2BE2" },                 // 연예인 - 블루 바이올렛
  shield: { icon: Shield, color: "#4A6FA5" },             // 경찰 - 짙은 파란색
  "book-open": { icon: BookOpen, color: "#008080" },      // 교사 - 틸
  stethoscope: { icon: Stethoscope, color: "#FF4500" },   // 의사 - 오렌지 레드
  scale: { icon: Scale, color: "#4A6FA5" },               // 변호사 - 짙은 파란색
  mic: { icon: Mic, color: "#8A2BE2" },                   // 가수 - 블루 바이올렛
  "pen-tool": { icon: PenTool, color: "#9932CC" },        // 디자이너 - 다크 오키드
  video: { icon: Video, color: "#800080" },               // 크리에이터 - 퍼플
  "more-horizontal": { icon: MoreHorizontal, color: "#696969" } // 기타 - 딤그레이
};

// 아이콘 컴포넌트 렌더링 헬퍼 함수
export const renderIcon = (iconKey, size = 16, className = "", isSelected = false) => {
  const iconData = iconMap[iconKey] || iconMap.briefcase;
  const IconComponent = iconData.icon;
  // 선택된 상태일 경우 흰색으로, 아닐 경우 지정된 색상으로 표시
  const color = isSelected ? "#FFFFFF" : iconData.color;
  return <IconComponent size={size} color={color} className={className} />;
};