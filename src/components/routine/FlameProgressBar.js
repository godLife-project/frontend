// src/components/routine/detail/FlameProgressBar.jsx
import React from "react";
import { Flame } from "lucide-react";

const FlameProgressBar = ({ certExp }) => {
  // 경험치에 따른 레벨 계산 및 진행률
  const getFlameStats = (exp) => {
    // 레벨별 필요 경험치 (예시, 실제 값으로 조정 필요)
    const levelThresholds = [0, 100, 300, 600, 1000, 1500];
    const maxLevel = 5;

    // 현재 레벨 계산
    let currentLevel = 0;
    for (let i = maxLevel; i >= 0; i--) {
      if (exp >= levelThresholds[i]) {
        currentLevel = i;
        break;
      }
    }

    // 다음 레벨까지 필요한 경험치 계산
    const nextLevel = Math.min(currentLevel + 1, maxLevel);
    const currentExp = exp - levelThresholds[currentLevel];
    const expForNextLevel =
      levelThresholds[nextLevel] - levelThresholds[currentLevel];
    const progress =
      expForNextLevel > 0 ? (currentExp / expForNextLevel) * 100 : 100;

    return {
      currentLevel,
      nextLevel,
      progress: Math.min(progress, 100),
      currentExp,
      expForNextLevel,
      totalExp: exp,
    };
  };

  // 불꽃 색상 정의
  const flameColors = [
    "#D1D5DB", // 레벨 0 (회색)
    "#FF7F7F", // 빨간색 레벨 1
    "#FFA07A", // 주황색 레벨 2
    "#FFD700", // 노란색 레벨 3
    "#90EE90", // 초록색 레벨 4
    "#FF4500", // 빨간색 레벨 5
    "#9370DB", // 보라색 (추가 레벨)
  ];

  // 불꽃 이름 정의
  const flameNames = [
    "불꽃 없음",
    "빨간색 불꽃",
    "주황색 불꽃",
    "노란색 불꽃",
    "초록색 불꽃",
    "파란색 불꽃",
    "보라색 불꽃",
  ];

  const stats = getFlameStats(certExp);

  return (
    <div className="bg-white rounded-lg shadow p-5 mb-6">
      <h3 className="text-lg font-bold mb-3 flex items-center">
        <Flame className="w-5 h-5 mr-2 text-orange-500" />
        불꽃 레벨 진행 상태
      </h3>

      {/* 불꽃 진행 슬라이더 */}
      <div className="relative mb-5">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-700 ease-in-out"
            style={{
              width: `${stats.progress}%`,
              background: `linear-gradient(to right, ${
                flameColors[stats.currentLevel]
              }, ${flameColors[stats.nextLevel]})`,
            }}
          ></div>
        </div>

        {/* 불꽃 레벨 표시 */}
        <div className="w-full flex justify-between mt-1 relative">
          {flameColors.slice(0, 7).map((color, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col items-center ${
                idx > stats.currentLevel ? "opacity-40" : ""
              }`}
            >
              <Flame
                size={idx === stats.currentLevel ? 28 : 22}
                color={color}
                className={`${
                  idx === stats.currentLevel ? "animate-pulse" : ""
                }`}
                style={{
                  filter:
                    idx === stats.currentLevel
                      ? "drop-shadow(0 0 3px rgba(255,165,0,0.5))"
                      : "none",
                  transform:
                    idx === stats.currentLevel ? "scale(1.2)" : "scale(1)",
                }}
              />
              <span
                className={`text-xs ${
                  idx === stats.currentLevel ? "font-bold" : "font-medium"
                }`}
              >
                {idx}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 현재 불꽃 상태 정보 */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Flame
              size={20}
              color={flameColors[stats.currentLevel]}
              className="mr-2"
            />
            <span className="font-medium text-gray-800">
              현재: {flameNames[stats.currentLevel]} (레벨 {stats.currentLevel})
            </span>
          </div>

          {stats.currentLevel < 6 && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">
                다음: {flameNames[stats.nextLevel]}
              </span>
              <Flame size={16} color={flameColors[stats.nextLevel]} />
            </div>
          )}
        </div>

        {stats.currentLevel < 6 ? (
          <div className="text-sm text-gray-700">
            <p>
              다음 레벨까지 필요 경험치:{" "}
              {stats.expForNextLevel - stats.currentExp} /{" "}
              {stats.expForNextLevel}
            </p>
          </div>
        ) : (
          <div className="text-sm text-purple-700 font-medium">
            <p>최고 레벨에 도달했습니다! 모든 불꽃을 마스터했습니다.</p>
          </div>
        )}
      </div>

      {/* 총 경험치 표시 */}
      <div className="mt-3 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          총 누적 경험치:{" "}
          <span className="font-medium text-orange-500">
            {stats.totalExp} 포인트
          </span>
        </span>

        {stats.currentLevel > 0 && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
            불꽃 {stats.currentLevel}단계 달성!
          </span>
        )}
      </div>
    </div>
  );
};

export default FlameProgressBar;
