// src/components/routine/detail/FlameLevel.jsx
import React from "react";
import { Flame } from "lucide-react";

// 불꽃 레벨 컴포넌트
const FlameLevel = ({ certExp }) => {
  // 경험치에 따른 레벨 계산 (임의로 설정, 실제 레벨 계산 로직에 맞게 조정 필요)
  const getFlameLevel = (exp) => {
    if (exp >= 1000) return 5;
    if (exp >= 750) return 4;
    if (exp >= 500) return 3;
    if (exp >= 250) return 2;
    if (exp > 0) return 1;
    return 0;
  };

  // 불꽃 색상 결정
  const getFlameColor = (level) => {
    const colors = {
      0: "#D1D5DB", // 레벨 0 (회색)
      1: "#FF7F7F", // 빨간색 레벨 1
      2: "#FFA07A", // 주황색 레벨 2
      3: "#FFD700", // 노란색 레벨 3
      4: "#90EE90", // 초록색 레벨 4
      5: "#FF4500", // 빨간색 레벨 5 (강조)
    };
    return colors[level] || colors[0];
  };

  // 불꽃 이름 결정
  const getFlameName = (level) => {
    const names = {
      0: "불꽃 없음",
      1: "빨간색 불꽃 1단계",
      2: "주황색 불꽃 2단계",
      3: "노란색 불꽃 3단계",
      4: "초록색 불꽃 4단계",
      5: "빨간색 불꽃 5단계",
    };
    return names[level] || names[0];
  };

  // 불꽃 효과 설명
  const getFlameEffect = (level) => {
    const effects = {
      0: "루틴을 인증하여 불꽃을 키워보세요!",
      1: "기본 불꽃 마스터 배지 획득",
      2: "불꽃 수집가 배지 획득",
      3: "빛나는 성취자 배지 획득",
      4: "자연의 수호자 배지 획득",
      5: "불꽃 마스터 배지, 루틴 달성 보너스 획득",
    };
    return effects[level] || effects[0];
  };

  const level = getFlameLevel(certExp);
  const color = getFlameColor(level);
  const name = getFlameName(level);
  const effect = getFlameEffect(level);

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <Flame className="w-5 h-5 mr-2 text-orange-500" />
        불꽃 레벨 시스템
      </h3>

      {/* 불꽃 레벨 표시 */}
      <div className="flex justify-between items-center mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <Flame
              size={32}
              className={`mb-1 ${i <= level ? "" : "opacity-40"}`}
              color={i <= level ? getFlameColor(i) : "#D1D5DB"}
            />
            <span className="text-xs font-medium">{i}</span>
          </div>
        ))}
      </div>

      {/* 프로그레스 바 */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(level * 20, 100)}%`,
            background: `linear-gradient(to right, ${getFlameColor(
              1
            )}, ${getFlameColor(level || 1)})`,
          }}
        ></div>
      </div>

      {/* 현재 레벨 정보 */}
      <div className="bg-yellow-50 p-3 rounded-md">
        <div className="flex items-center mb-2">
          <Flame size={18} color={color} className="mr-2" />
          <span className="font-medium">
            현재 불꽃 레벨: {level > 0 ? level : "없음"}
          </span>
        </div>
        {level > 0 ? (
          <p className="text-sm text-gray-700">
            {name}: {effect}
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            루틴을 인증하여 불꽃을 얻어보세요!
          </p>
        )}
      </div>

      {/* 경험치 표시 */}
      <div className="mt-3 text-sm text-right text-gray-500">
        현재 경험치: {certExp} 포인트
      </div>
    </div>
  );
};

export default FlameLevel;
