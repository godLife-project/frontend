import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const StatsDashboard = ({ stats }) => {
  return (
    <Card className="col-span-12">
      <CardHeader>
        <CardTitle>상담 현황</CardTitle>
        <CardDescription>오늘의 처리 현황 및 월간 통계</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* 오늘 통계 */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">오늘 처리 현황</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-blue-600 mb-1">나의 처리량</div>
                <div className="text-2xl font-bold">
                  {stats.today.completed}건
                </div>
                <div className="text-xs text-gray-500">
                  평균: {stats.today.average}건
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm text-green-600 mb-1">평균 소요시간</div>
                <div className="text-2xl font-bold">
                  {stats.today.myAverageTime}
                </div>
                <div className="text-xs text-gray-500">
                  평균: {stats.today.averageTime}
                </div>
              </div>
            </div>
          </div>

          {/* 월간 통계 */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">월간 누적 통계</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-sm text-purple-600 mb-1">나의 누적량</div>
                <div className="text-2xl font-bold">
                  {stats.month.completed}건
                </div>
                <div className="text-xs text-gray-500">
                  평균: {stats.month.average}건
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-sm text-orange-600 mb-1">
                  평균 소요시간
                </div>
                <div className="text-2xl font-bold">
                  {stats.month.myAverageTime}
                </div>
                <div className="text-xs text-gray-500">
                  평균: {stats.month.averageTime}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsDashboard;
