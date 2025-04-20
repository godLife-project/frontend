// src/components/routine/detail/FloatingActionButton.jsx
import React from "react";
import { Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingActionButton = ({ routineData, handleRoutineAction }) => {
  if (routineData.isCompleted) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out">
      {!routineData.isActive ? (
        <Button
          onClick={() => handleRoutineAction("start")}
          className="bg-green-500 hover:bg-green-600 text-white shadow-lg px-6 py-3 rounded-full flex items-center gap-2 text-base font-medium"
        >
          <Play className="w-5 h-5" />
          루틴 시작하기
        </Button>
      ) : (
        <Button
          onClick={() => handleRoutineAction("complete")}
          className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg px-6 py-3 rounded-full flex items-center gap-2 text-base font-medium"
        >
          <CheckCircle2 className="w-5 h-5" />
          루틴 끝내기
        </Button>
      )}
    </div>
  );
};

export default FloatingActionButton;
