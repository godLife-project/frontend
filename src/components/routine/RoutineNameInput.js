import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const RoutineNameInput = ({ routineName, setRoutineName }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="routine-name">루틴 이름</Label>
      <Input
        id="routine-name"
        type="text"
        value={routineName}
        onChange={(e) => setRoutineName(e.target.value)}
        placeholder="아침 루틴"
      />
    </div>
  );
};

export default RoutineNameInput;