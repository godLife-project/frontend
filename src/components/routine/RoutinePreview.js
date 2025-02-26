// components/Routine/RoutinePreview.js
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const RoutinePreview = ({ routineName, routineColor, tasks, selectedDays }) => {
  return (
    <>
      <div>
        <Label>루틴 프리뷰</Label>
      </div>

      <div className="border rounded-lg p-4" style={{ borderColor: routineColor }}>
        <div 
          className="rounded-lg p-4"
          style={{ backgroundColor: `${routineColor}15` }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 
              className="font-bold text-lg" 
              style={{ color: routineColor }}
            >
              {routineName || '아침 루틴'}
            </h3>
            <Badge variant="outline" className="text-xs">
              {selectedDays.join(', ')}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center">
                <div 
                  className="w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0" 
                  style={{ borderColor: routineColor }}
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span>{task.title}</span>
                    <span className="text-sm text-muted-foreground">{task.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RoutinePreview;