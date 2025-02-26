import React from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import RoutineNameInput from './RoutineNameInput';
import DaySelector from './DaySelector';
import ColorSelector from './ColorSelector';
import TaskList from './TaskList';
import TaskInput from './TaskInput';
import RoutinePreview from './RoutinePreview';

const RoutineForm = ({
  routineName,
  setRoutineName,
  routineColor,
  setRoutineColor,
  tasks,
  setTasks,
  selectedDays,
  setSelectedDays,
  onSave
}) => {
  const [newTask, setNewTask] = React.useState('');
  const [newTaskTime, setNewTaskTime] = React.useState('07:30');

  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([
        ...tasks, 
        { 
          id: Date.now(), 
          title: newTask, 
          time: newTaskTime,
          completed: false 
        }
      ]);
      setNewTask('');
    }
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="bg-primary">
        <CardTitle className="text-xl text-white">새 루틴 만들기</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* 루틴 이름 */}
        <RoutineNameInput
          routineName={routineName}
          setRoutineName={setRoutineName}
        />

        {/* 요일 선택 */}
        <DaySelector
          selectedDays={selectedDays}
          setSelectedDays={setSelectedDays}
        />

        {/* 테마 색상 */}
        <ColorSelector
          routineColor={routineColor}
          setRoutineColor={setRoutineColor}
        />

        <Separator />

        {/* 태스크 목록 및 입력 */}
        <TaskList tasks={tasks} onRemoveTask={removeTask} />
        
        <TaskInput
          newTask={newTask}
          setNewTask={setNewTask}
          newTaskTime={newTaskTime}
          setNewTaskTime={setNewTaskTime}
          onAddTask={addTask}
        />

        <Separator />

        {/* 루틴 프리뷰 */}
        <RoutinePreview
          routineName={routineName}
          routineColor={routineColor}
          tasks={tasks}
          selectedDays={selectedDays}
        />
      </CardContent>

      <CardFooter className="px-6 pb-6">
        <Button className="w-full" size="lg" onClick={onSave}>
          <Save size={18} className="mr-2" />
          루틴 저장하기
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoutineForm;