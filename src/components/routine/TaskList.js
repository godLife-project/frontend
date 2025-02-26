// components/Routine/TaskList.js
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const TaskList = ({ tasks, onRemoveTask }) => {
  if (tasks.length === 0) {
    return (
      <div className="space-y-2">
        <Label>루틴 태스크</Label>
        <div className="p-4 text-center text-muted-foreground bg-muted rounded-md">
          태스크가 없습니다. 새 태스크를 추가해보세요.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>루틴 태스크</Label>
      
      <div className="space-y-2 mb-4">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="flex items-center p-3 bg-muted rounded-md"
          >
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-medium">{task.title}</span>
                <Badge variant="outline">{task.time}</Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 ml-2 text-muted-foreground hover:text-destructive"
              onClick={() => onRemoveTask(task.id)}
            >
              <X size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;