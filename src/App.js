import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Gift, Star, Zap } from 'lucide-react';

const ProductivityApp = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('morning');
  const [claimedRewards, setClaimedRewards] = useState({});

  const timeBlocks = {
    morning: { name: 'Morning', time: '11 AM - 3 PM', emoji: '🌅' },
    evening: { name: 'Evening', time: '5 PM - 9 PM', emoji: '🌆' },
    latenight: { name: 'Late Night', time: '11 PM - 2 AM', emoji: '🌙' }
  };

  const rewards = {
    50: { name: 'Lime Soda', emoji: '🥤', color: '#10b981' },
    60: { name: '2 Games of PES', emoji: '⚽', color: '#3b82f6' },
    70: { name: 'Mountain Dew', emoji: '🥤', color: '#eab308' }
  };

  // Get today's date string
  const getTodayString = () => {
    return new Date().toDateString();
  };

  // Load data from storage on component mount
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage?.getItem('productivityTasks') || '[]');
    const savedRewards = JSON.parse(localStorage?.getItem('claimedRewards') || '{}');
    
    // Process tasks for new day
    const today = getTodayString();
    const processedTasks = savedTasks.map(task => {
      if (task.date !== today && !task.completed) {
        // Move incomplete tasks to today, same block
        return { ...task, date: today, completed: false };
      } else if (task.date !== today && task.completed) {
        // Keep completed tasks but don't show them today
        return task;
      }
      return task;
    });

    setTasks(processedTasks);
    setClaimedRewards(savedRewards[today] || {});
  }, []);

  // Save data to storage whenever tasks or rewards change
  useEffect(() => {
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('productivityTasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    if (typeof Storage !== 'undefined') {
      const today = getTodayString();
      const allRewards = JSON.parse(localStorage.getItem('claimedRewards') || '{}');
      allRewards[today] = claimedRewards;
      localStorage.setItem('claimedRewards', JSON.stringify(allRewards));
    }
  }, [claimedRewards]);

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        block: selectedBlock,
        completed: false,
        date: getTodayString()
      };
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Get today's tasks
  const todaysTasks = tasks.filter(task => task.date === getTodayString());
  
  // Calculate progress
  const totalTasks = todaysTasks.length;
  const completedTasks = todaysTasks.filter(task => task.completed).length;
  const totalPoints = totalTasks * 10;
  const earnedPoints = completedTasks * 10;
  const progressPercentage = totalTasks > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  // Check available rewards
  const availableRewards = Object.keys(rewards)
    .filter(threshold => progressPercentage >= parseInt(threshold))
    .filter(threshold => !claimedRewards[threshold]);

  const claimReward = (threshold) => {
    setClaimedRewards(prev => ({ ...prev, [threshold]: true }));
    
    // Show celebration
    const reward = rewards[threshold];
    alert(`🎉 Congratulations! You've earned: ${reward.emoji} ${reward.name}! 🎉`);
  };

  const getTasksByBlock = (block) => {
    return todaysTasks.filter(task => task.block === block);
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Daily Focus Blocks</h1>
          <p style={styles.subtitle}>Progress over perfection ✨</p>
        </div>

        {/* Progress Section */}
        <div style={styles.progressCard}>
          <div style={styles.progressHeader}>
            <div>
              <h2 style={styles.progressTitle}>Today's Progress</h2>
              <p style={styles.progressSubtext}>{completedTasks} of {totalTasks} tasks completed</p>
            </div>
            <div style={styles.pointsSection}>
              <div style={styles.points}>{earnedPoints} points</div>
              <div style={styles.percentage}>({progressPercentage}%)</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={styles.progressBarContainer}>
            <div 
              style={{
                ...styles.progressBar,
                width: `${progressPercentage}%`
              }}
            ></div>
          </div>

          {/* Rewards */}
          <div style={styles.rewardsContainer}>
            {Object.entries(rewards).map(([threshold, reward]) => {
              const isEarned = progressPercentage >= parseInt(threshold);
              const isClaimed = claimedRewards[threshold];
              
              return (
                <div key={threshold}>
                  {isEarned && !isClaimed ? (
                    <button
                      onClick={() => claimReward(threshold)}
                      style={styles.claimButton}
                    >
                      <Gift size={16} style={{ marginRight: '4px' }} />
                      Claim {reward.emoji} {reward.name}!
                    </button>
                  ) : (
                    <div style={{
                      ...styles.rewardBadge,
                      backgroundColor: isClaimed ? '#059669' : 
                                     isEarned ? '#eab308' : '#475569',
                      color: isClaimed || isEarned ? '#000' : '#94a3b8'
                    }}>
                      {isClaimed ? <CheckCircle2 size={16} style={{ marginRight: '4px' }} /> : 
                       isEarned ? <Star size={16} style={{ marginRight: '4px' }} /> :
                       <Zap size={16} style={{ marginRight: '4px' }} />}
                      {threshold}%: {reward.emoji} {reward.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Task Section */}
        <div style={styles.addTaskCard}>
          <h2 style={styles.addTaskTitle}>Add New Task</h2>
          <div style={styles.addTaskForm}>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="What would you like to accomplish?"
              style={styles.taskInput}
            />
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              style={styles.blockSelect}
            >
              {Object.entries(timeBlocks).map(([key, block]) => (
                <option key={key} value={key}>
                  {block.emoji} {block.name}
                </option>
              ))}
            </select>
            <button
              onClick={addTask}
              style={styles.addButton}
            >
              <Plus size={20} style={{ marginRight: '8px' }} />
              Add Task
            </button>
          </div>
        </div>

        {/* Time Blocks */}
        <div style={styles.blocksGrid}>
          {Object.entries(timeBlocks).map(([blockKey, block]) => {
            const blockTasks = getTasksByBlock(blockKey);
            const completedInBlock = blockTasks.filter(task => task.completed).length;
            const totalInBlock = blockTasks.length;
            const blockProgress = totalInBlock > 0 ? Math.round((completedInBlock / totalInBlock) * 100) : 0;

            return (
              <div key={blockKey} style={styles.blockCard}>
                <div style={styles.blockHeader}>
                  <h3 style={styles.blockTitle}>
                    {block.emoji} {block.name}
                  </h3>
                  <div style={styles.blockCount}>
                    {completedInBlock}/{totalInBlock}
                  </div>
                </div>
                <p style={styles.blockTime}>{block.time}</p>
                
                {/* Block Progress */}
                <div style={styles.blockProgressContainer}>
                  <div 
                    style={{
                      ...styles.blockProgressBar,
                      width: `${blockProgress}%`
                    }}
                  ></div>
                </div>

                {/* Tasks */}
                <div style={styles.tasksContainer}>
                  {blockTasks.length === 0 ? (
                    <p style={styles.noTasks}>No tasks yet</p>
                  ) : (
                    blockTasks.map(task => (
                      <div
                        key={task.id}
                        style={{
                          ...styles.taskItem,
                          backgroundColor: task.completed ? '#064e3b' : '#374151',
                          border: task.completed ? '1px solid #059669' : 'none'
                        }}
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
                          style={styles.taskToggle}
                        >
                          {task.completed ? (
                            <CheckCircle2 size={20} color="#10b981" />
                          ) : (
                            <Circle size={20} color="#9ca3af" />
                          )}
                        </button>
                        <span style={{
                          ...styles.taskText,
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? '#9ca3af' : '#fff'
                        }}>
                          {task.text}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          style={styles.deleteButton}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Encouraging Message */}
        <div style={styles.encouragingMessage}>
          <p style={styles.messageText}>
            {progressPercentage >= 70 ? "🌟 Amazing work today! You're crushing it!" :
             progressPercentage >= 50 ? "🎯 Great progress! You're doing fantastic!" :
             progressPercentage >= 30 ? "💪 Keep going! Every small step counts!" :
             totalTasks > 0 ? "🚀 You've got this! One task at a time!" :
             "✨ Ready to make today awesome? Add your first task!"}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: '16px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  maxWidth: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#60a5fa'
  },
  subtitle: {
    color: '#94a3b8'
  },
  progressCard: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '32px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  progressTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#93c5fd',
    margin: '0 0 4px 0'
  },
  progressSubtext: {
    color: '#94a3b8',
    margin: 0
  },
  pointsSection: {
    textAlign: 'right'
  },
  points: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#10b981'
  },
  percentage: {
    color: '#94a3b8'
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#334155',
    borderRadius: '9999px',
    height: '12px',
    marginBottom: '16px'
  },
  progressBar: {
    background: 'linear-gradient(to right, #10b981, #3b82f6)',
    height: '12px',
    borderRadius: '9999px',
    transition: 'width 0.5s ease'
  },
  rewardsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  claimButton: {
    backgroundColor: '#eab308',
    color: '#000',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    animation: 'pulse 2s infinite'
  },
  rewardBadge: {
    padding: '8px 12px',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center'
  },
  addTaskCard: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '32px'
  },
  addTaskTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#93c5fd',
    margin: '0 0 16px 0'
  },
  addTaskForm: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  taskInput: {
    flex: 1,
    minWidth: '200px',
    backgroundColor: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '16px'
  },
  blockSelect: {
    backgroundColor: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '16px'
  },
  addButton: {
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px'
  },
  blocksGrid: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  },
  blockCard: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    padding: '24px'
  },
  blockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  blockTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#93c5fd',
    margin: 0
  },
  blockCount: {
    fontSize: '0.875rem',
    color: '#94a3b8'
  },
  blockTime: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    marginBottom: '16px',
    margin: '0 0 16px 0'
  },
  blockProgressContainer: {
    width: '100%',
    backgroundColor: '#334155',
    borderRadius: '9999px',
    height: '8px',
    marginBottom: '16px'
  },
  blockProgressBar: {
    backgroundColor: '#10b981',
    height: '8px',
    borderRadius: '9999px',
    transition: 'width 0.3s ease'
  },
  tasksContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  noTasks: {
    color: '#6b7280',
    textAlign: 'center',
    padding: '16px',
    margin: 0
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '8px'
  },
  taskToggle: {
    marginRight: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  taskText: {
    flex: 1
  },
  deleteButton: {
    color: '#ef4444',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '8px',
    fontSize: '0.875rem'
  },
  encouragingMessage: {
    textAlign: 'center',
    marginTop: '32px',
    padding: '24px',
    backgroundColor: '#1e293b',
    borderRadius: '8px'
  },
  messageText: {
    color: '#d1d5db',
    margin: 0
  }
};

export default ProductivityApp;