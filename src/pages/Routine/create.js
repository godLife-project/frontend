import React, { useState } from 'react';
import RoutineForm from '../../components/routine/RoutineForm';

const RoutineCreatePage = () => {
  // 상태는 페이지 레벨에서 관리하여 자식 컴포넌트에 전달
  const [routineName, setRoutineName] = useState('');
  const [routineColor, setRoutineColor] = useState('#4F46E5');
  const [tasks, setTasks] = useState([
    { id: 1, title: '물 한잔 마시기', time: '06:30', completed: false },
    { id: 2, title: '15분 스트레칭', time: '07:00', completed: false }
  ]);
  const [selectedDays, setSelectedDays] = useState(['월', '화', '수', '목', '금']);

  const saveRoutine = () => {
    // TODO: 루틴 저장 로직 구현
    console.log('루틴 저장:', {
      name: routineName,
      color: routineColor,
      days: selectedDays,
      tasks: tasks
    });
  };

  return (
      <RoutineForm
        routineName={routineName}
        setRoutineName={setRoutineName}
        routineColor={routineColor}
        setRoutineColor={setRoutineColor}
        tasks={tasks}
        setTasks={setTasks}
        selectedDays={selectedDays}
        setSelectedDays={setSelectedDays}
        onSave={saveRoutine}
      />
  );
};

export default RoutineCreatePage;