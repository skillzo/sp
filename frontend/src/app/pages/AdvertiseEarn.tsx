import { useState } from 'react';
import { CheckCircle, ExternalLink, Upload, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router';
import { TopBar } from '../components/TopBar';
import { BackButton } from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';

interface Task {
  id: number;
  title: string;
  taskType: string;
  reward: number;
  targetUrl: string;
  requiresProof: boolean;
  icon: string;
}

export function AdvertiseEarn() {
  const { isVIP, formatCurrency, gameBalance, updateGameBalance } = useUser();
  const navigate = useNavigate();
  
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [proofImage, setProofImage] = useState<string>('');

  // Available tasks from advertisers
  const [tasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Subscribe to YouTube Channel',
      taskType: 'Subscribe to YouTube',
      reward: 0.20,
      targetUrl: 'https://youtube.com/@example',
      requiresProof: true,
      icon: '▶️'
    },
    {
      id: 2,
      title: 'Visit E-commerce Website',
      taskType: 'Visit Website',
      reward: 0.10,
      targetUrl: 'https://example-store.com',
      requiresProof: false,
      icon: '🌐'
    },
    {
      id: 3,
      title: 'Follow on Twitter/X',
      taskType: 'Follow on Twitter/X',
      reward: 0.15,
      targetUrl: 'https://twitter.com/example',
      requiresProof: true,
      icon: '🐦'
    },
    {
      id: 4,
      title: 'Join Telegram Group',
      taskType: 'Join Telegram Group',
      reward: 0.25,
      targetUrl: 'https://t.me/examplegroup',
      requiresProof: true,
      icon: '✈️'
    },
    {
      id: 5,
      title: 'Watch Product Video',
      taskType: 'Watch Video',
      reward: 0.05,
      targetUrl: 'https://youtube.com/watch?v=example',
      requiresProof: false,
      icon: '📹'
    },
  ]);

  const handleStartTask = (task: Task) => {
    if (completedTasks.includes(task.id)) {
      toast.info('You have already completed this task!');
      return;
    }

    // Open the target URL
    window.open(task.targetUrl, '_blank');

    // If requires proof, show proof modal after a delay
    if (task.requiresProof) {
      setTimeout(() => {
        setSelectedTask(task);
        setShowProofModal(true);
      }, 2000);
    } else {
      // Auto-complete non-proof tasks
      setTimeout(() => {
        completeTask(task);
      }, 3000);
    }
  };

  const completeTask = (task: Task) => {
    setCompletedTasks([...completedTasks, task.id]);
    updateGameBalance(task.reward);
    toast.success(`Task completed! Earned ${formatCurrency(task.reward, true)}`);
    setShowProofModal(false);
    setProofImage('');
  };

  const handleSubmitProof = () => {
    if (!proofImage) {
      toast.error('Please upload proof of completion');
      return;
    }

    if (selectedTask) {
      completeTask(selectedTask);
    }
  };

  const totalEarned = tasks
    .filter(t => completedTasks.includes(t.id))
    .reduce((sum, t) => sum + t.reward, 0);

  // Redirect if not VIP
  if (!isVIP) {
    navigate('/upgrade');
    return null;
  }

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopBar />
      
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <BackButton />

        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-8 h-8" style={{ color: '#0A84FF' }} />
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Advertise & Earn
          </h1>
        </div>

        {/* Stats Card */}
        <div className="rounded-lg p-6 mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Total Earned Today</p>
              <p className="text-white text-3xl font-bold">{formatCurrency(totalEarned, true)}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Tasks Completed</p>
              <p className="text-white text-3xl font-bold">
                {completedTasks.length}/{tasks.length}
              </p>
            </div>
          </div>
        </div>

        {/* Available Tasks */}
        <div className="rounded-lg shadow-sm p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Available Tasks
          </h2>

          <div className="space-y-4">
            {tasks.map((task) => {
              const isCompleted = completedTasks.includes(task.id);
              
              return (
                <div
                  key={task.id}
                  className="border rounded-lg p-4"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.05)' : 'transparent'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{task.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {task.title}
                        </h3>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {task.taskType}
                        </p>
                        
                        {task.requiresProof && (
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <Upload className="w-3 h-3" />
                            Requires proof (screenshot)
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-2">
                        <DollarSign className="w-4 h-4" style={{ color: '#22C55E' }} />
                        <span className="font-bold text-lg" style={{ color: '#22C55E' }}>
                          {formatCurrency(task.reward, true)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg flex-1" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                        <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} />
                        <span className="font-medium" style={{ color: '#22C55E' }}>Completed</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartTask(task)}
                        className="flex-1 px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#0A84FF' }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Start Task
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)', border: '1px solid rgba(10, 132, 255, 0.3)' }}>
          <p className="text-sm" style={{ color: '#0A84FF' }}>
            💡 <strong>How it works:</strong> Complete simple tasks from advertisers and earn directly to your Game Wallet. Tasks reset daily!
          </p>
        </div>
      </div>

      {/* Proof Upload Modal */}
      {showProofModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-lg max-w-md w-full p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Submit Proof of Completion
            </h2>

            <div className="mb-4">
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                Upload a screenshot showing you completed: <strong>{selectedTask.title}</strong>
              </p>

              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <Upload className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                  Click to upload screenshot
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProofImage(URL.createObjectURL(file));
                      toast.success('Screenshot uploaded!');
                    }
                  }}
                  className="hidden"
                  id="proof-upload"
                />
                <label
                  htmlFor="proof-upload"
                  className="inline-block px-4 py-2 rounded-lg text-white font-medium cursor-pointer mt-2"
                  style={{ backgroundColor: '#0A84FF' }}
                >
                  Choose File
                </label>
              </div>

              {proofImage && (
                <div className="mt-3">
                  <img
                    src={proofImage}
                    alt="Proof"
                    className="w-full rounded-lg"
                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowProofModal(false);
                  setProofImage('');
                  setSelectedTask(null);
                }}
                className="flex-1 py-3 rounded-lg border-2 font-medium"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitProof}
                disabled={!proofImage}
                className="flex-1 py-3 rounded-lg text-white font-medium disabled:opacity-50"
                style={{ backgroundColor: '#0A84FF' }}
              >
                Submit Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
