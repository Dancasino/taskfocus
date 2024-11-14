import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, SkipForward } from 'lucide-react';

export default function TimeTimerPomodoro() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ name: '', duration: '' });
  const [breakTime, setBreakTime] = useState(5);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('SETUP');

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalId);
            if (mode === 'WORK') {
              setMode('BREAK');
              const breakTimeInSeconds = breakTime * 60;
              setTotalTime(breakTimeInSeconds);
              return breakTimeInSeconds;
            } else if (mode === 'BREAK') {
              if (currentTaskIndex < tasks.length - 1) {
                setCurrentTaskIndex(prev => prev + 1);
                setMode('WORK');
                const nextTaskTime = tasks[currentTaskIndex + 1].duration * 60;
                setTotalTime(nextTaskTime);
                return nextTaskTime;
              } else {
                setMode('SETUP');
                setIsRunning(false);
                setCurrentTaskIndex(null);
                return 0;
              }
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, mode, currentTaskIndex, tasks, breakTime]);

  const addTask = () => {
    if (newTask.name.trim() && newTask.duration && Number(newTask.duration) > 0) {
      setTasks([...tasks, { ...newTask, duration: Number(newTask.duration) }]);
      setNewTask({ name: '', duration: '' });
    }
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const startPomodoro = () => {
    if (tasks.length === 0) return;
    setMode('WORK');
    setCurrentTaskIndex(0);
    const firstTaskTime = tasks[0].duration * 60;
    setTimeLeft(firstTaskTime);
    setTotalTime(firstTaskTime);
    setIsRunning(true);
  };

  const skipToBreak = () => {
    setMode('BREAK');
    const breakTimeInSeconds = breakTime * 60;
    setTotalTime(breakTimeInSeconds);
    setTimeLeft(breakTimeInSeconds);
  };

  const skipToNextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      setMode('WORK');
      const nextTaskTime = tasks[currentTaskIndex + 1].duration * 60;
      setTotalTime(nextTaskTime);
      setTimeLeft(nextTaskTime);
    } else {
      setMode('SETUP');
      setIsRunning(false);
      setCurrentTaskIndex(null);
      setTimeLeft(0);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode('SETUP');
    setTimeLeft(0);
    setCurrentTaskIndex(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeTimerArc = () => {
    if (!timeLeft || !totalTime) return '';
    
    const radius = 80;
    
    const totalMinutes = Math.min(totalTime / 60, 60);
    const remainingMinutes = Math.min(timeLeft / 60, 60);
    
    const startAngle = -90;
    const sweepAngle = -(remainingMinutes / 60) * 360;
    
    const endAngle = (startAngle + sweepAngle) * (Math.PI / 180);
    const endX = 96 + radius * Math.cos(endAngle);
    const endY = 96 + radius * Math.sin(endAngle);
    
    const largeArcFlag = Math.abs(sweepAngle) > 180 ? 1 : 0;
    
    return `
      M 96 16
      A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}
      L 96 96
      Z
    `;
  };

  const getQuarterHourMarks = () => {
    const marks = [];
    const radius = 80;
    const tickLength = 10;
    
    [0, 15, 30, 45].forEach(minutes => {
      const angle = ((minutes / 60) * 360 - 90) * (Math.PI / 180);
      const outerX = 96 + (radius + 2) * Math.cos(angle);
      const outerY = 96 + (radius + 2) * Math.sin(angle);
      const innerX = 96 + (radius - tickLength) * Math.cos(angle);
      const innerY = 96 + (radius - tickLength) * Math.sin(angle);
      
      marks.push(
        <line
          key={minutes}
          x1={innerX}
          y1={innerY}
          x2={outerX}
          y2={outerY}
          stroke="#495057"
          strokeWidth="2"
        />
      );
    });
    return marks;
  };

  const TimerControls = () => (
    <div className="flex justify-center space-x-4 items-center">
      <button
        onClick={() => setIsRunning(!isRunning)}
        className="p-2 rounded-full hover:bg-gray-100"
        title={isRunning ? "Pause" : "Play"}
      >
        {isRunning ? <Pause size={24} /> : <Play size={24} />}
      </button>
      <button
        onClick={resetTimer}
        className="p-2 rounded-full hover:bg-gray-100"
        title="Reset"
      >
        <RotateCcw size={24} />
      </button>
      <button
        onClick={mode === 'WORK' ? skipToBreak : skipToNextTask}
        className="p-2 rounded-full hover:bg-gray-100"
        title={mode === 'WORK' ? "Skip to break" : "Skip to next task"}
      >
        <SkipForward size={24} />
      </button>
    </div>
  );

  const TimerDisplay = () => (
    <div className="space-y-4 text-center">
      <div className="text-xl font-bold">
        {mode === 'WORK' ? tasks[currentTaskIndex]?.name : 'Break Time'}
      </div>

      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="#e9ecef"
            strokeWidth="12"
            fill="white"
          />
          {getQuarterHourMarks()}
          <path
            d={getTimeTimerArc()}
            fill={mode === 'WORK' ? '#ff6b6b' : '#51cf66'}
            className="transition-all duration-1000"
          />
          <circle
            cx="96"
            cy="96"
            r="4"
            fill="#495057"
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-3xl font-mono">{formatTime(timeLeft)}</div>
        </div>
      </div>

      <TimerControls />
    </div>
  );

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      {mode === 'SETUP' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTask.name}
                onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 rounded-md border-gray-300 shadow-sm p-2 border"
                placeholder="Enter task name"
              />
              <input
                type="number"
                value={newTask.duration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (Number(value) >= 0 && Number(value) <= 60)) {
                    setNewTask(prev => ({ ...prev, duration: value }));
                  }
                }}
                className="w-20 rounded-md border-gray-300 shadow-sm p-2 border"
                placeholder="Min"
                min="1"
                max="60"
              />
              <button
                onClick={addTask}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                disabled={!newTask.name.trim() || !newTask.duration || Number(newTask.duration) <= 0}
              >
                <Plus size={24} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Tasks:</h3>
            {tasks.map((task, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{task.name} ({task.duration}min)</span>
                <button
                  onClick={() => removeTask(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Break Time (minutes)</label>
            <input
              type="number"
              value={breakTime}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (Number(value) >= 0 && Number(value) <= 60)) {
                  setBreakTime(value === '' ? '' : Number(value));
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              placeholder="Min"
              min="1"
              max="60"
            />
          </div>

          <button
            onClick={startPomodoro}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
            disabled={tasks.length === 0}
          >
            Start Pomodoro
          </button>
        </div>
      ) : (
        <TimerDisplay />
      )}
    </div>
  );
}
