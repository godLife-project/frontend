// components/Routine/DaySelector.js
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const DaySelector = ({ selectedDays, setSelectedDays }) => {
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>반복 요일</Label>
      <div className="flex flex-wrap gap-2">
        {days.map((day) => (
          <Button
            key={day}
            variant={selectedDays.includes(day) ? "default" : "outline"}
            size="sm"
            className="w-10 h-10 rounded-full p-0"
            onClick={() => toggleDay(day)}
          >
            {day}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DaySelector;