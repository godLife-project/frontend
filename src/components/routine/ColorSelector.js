// components/Routine/ColorSelector.js
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const ColorSelector = ({ routineColor, setRoutineColor }) => {
  const colorOptions = [
    '#4F46E5', // 인디고
    '#10B981', // 에메랄드
    '#F59E0B', // 앰버
    '#EF4444', // 레드
    '#8B5CF6', // 바이올렛
    '#3B82F6', // 블루
  ];

  return (
    <div className="space-y-2">
      <Label>테마 색상</Label>
      <div className="flex gap-2">
        {colorOptions.map((color) => (
          <Button
            key={color}
            className={`w-8 h-8 rounded-full p-0 ${
              routineColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
            }`}
            style={{ 
              backgroundColor: color,
              border: 'none'
            }}
            onClick={() => setRoutineColor(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;