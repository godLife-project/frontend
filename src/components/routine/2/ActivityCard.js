import React from 'react';
import { Trash2, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ActivityCard = ({ index, activity, updateActivity, removeActivity, isRemovable }) => {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium">활동 {index + 1}</CardTitle>
        {isRemovable && (
          <Button
            type="button"
            onClick={() => removeActivity(index)}
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 활동명 */}
          <div className="space-y-2">
            <Label htmlFor={`activity-name-${index}`}>
              활동명
            </Label>
            <Input
              id={`activity-name-${index}`}
              value={activity.activityName}
              onChange={(e) => updateActivity(index, 'activityName', e.target.value)}
              placeholder="활동 이름"
              required
            />
          </div>

          {/* 시간 설정 */}
          <div className="space-y-2">
            <Label htmlFor={`activity-time-${index}`} className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-blue-500" />
              알람 시간 (선택)
            </Label>
            <Input
              id={`activity-time-${index}`}
              type="time"
              value={activity.setTime || ''}
              onChange={(e) => updateActivity(index, 'setTime', e.target.value)}
            />
          </div>

          {/* 활동 메모 */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`activity-desc-${index}`}>
              한 줄 메모
            </Label>
            <Input
              id={`activity-desc-${index}`}
              value={activity.description}
              onChange={(e) => updateActivity(index, 'description', e.target.value)}
              placeholder="활동에 대한 메모"
            />
          </div>

          {/* 활동 중요도 */}
          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-amber-500" />
              활동 중요도
            </Label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateActivity(index, 'activityImp', String(value))}
                  className="text-2xl focus:outline-none p-1 transition-all duration-200"
                >
                  <Star 
                    fill={parseInt(activity.activityImp) >= value ? '#F59E0B' : 'none'} 
                    className={parseInt(activity.activityImp) >= value ? 'text-amber-500' : 'text-gray-300 hover:text-gray-400'} 
                    size={20}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-gray-600">
                {activity.activityImp}/5
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;