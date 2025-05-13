import React from "react";
import { Clock3 } from "lucide-react";

const StatusBar = ({ waitList, assignedList }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t py-2 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600">
          <Clock3 className="h-4 w-4 mr-1" />
          <span>현재 시간: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center text-blue-600">
            <span className="font-medium mr-1">{waitList.length}</span>
            <span>대기중</span>
          </div>
          <div className="flex items-center text-green-600">
            <span className="font-medium mr-1">
              {assignedList.filter((q) => q.qnaStatus === "완료").length}
            </span>
            <span>완료</span>
          </div>
          <div className="flex items-center text-orange-600">
            <span className="font-medium mr-1">
              {assignedList.filter((q) => q.qnaStatus !== "완료").length}
            </span>
            <span>처리중</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
