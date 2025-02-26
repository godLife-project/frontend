// components/Routine/TaskInput.js
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TaskInput = ({ 
  newTask, 
  setNewTask, 
  newTaskTime, 
  setNewTaskTime, 
  onAddTask 
}) => {
  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="새 태스크"
        className="flex-1"
      />
      <Input
        type="time"
        value={newTaskTime}
        onChange={(e) => setNewTaskTime(e.target.value)}
        className="w-24"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={onAddTask}
        className="flex-shrink-0"
      >
        <Plus size={18} />
      </Button>
    </div>
  );
};

export default TaskInput;