import { useState, useEffect } from 'react';
import { Zap, Clock, Star } from 'lucide-react';

type ProcessingMode = {
  display_name: string;
  description: string;
  estimated_cost_per_page: string;
};

type ProcessingModes = {
  fast: ProcessingMode;
  moderate: ProcessingMode;
  slow: ProcessingMode;
};

type ProcessingModeSelectorProps = {
  selectedMode: string;
  onModeChange: (mode: string) => void;
};

export function ProcessingModeSelector({ selectedMode, onModeChange }: ProcessingModeSelectorProps) {
  const [modes, setModes] = useState<ProcessingModes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/processing-modes');
        if (response.ok) {
          const data = await response.json();
          setModes(data);
        }
      } catch (error) {
        console.error('Failed to fetch processing modes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModes();
  }, []);

  if (loading || !modes) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">Processing Mode</label>
        <div className="animate-pulse bg-slate-200 h-32 rounded-xl"></div>
      </div>
    );
  }

  const modeIcons = {
    fast: Zap,
    moderate: Clock,
    slow: Star
  };

  const modeColors = {
    fast: 'from-green-500 to-emerald-600',
    moderate: 'from-blue-500 to-indigo-600', 
    slow: 'from-purple-500 to-violet-600'
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Processing Mode</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(modes).map(([key, mode]) => {
          const Icon = modeIcons[key as keyof typeof modeIcons];
          const isSelected = selectedMode === key;
          
          return (
            <button
              key={key}
              onClick={() => onModeChange(key)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected 
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105' 
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  w-10 h-10 rounded-lg bg-gradient-to-br ${modeColors[key as keyof typeof modeColors]} 
                  flex items-center justify-center flex-shrink-0
                `}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                    {mode.display_name}
                  </h3>
                  <p className={`text-xs mt-1 ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>
                    {mode.description}
                  </p>
                  <p className={`text-xs mt-2 font-mono ${isSelected ? 'text-indigo-800' : 'text-slate-500'}`}>
                    {mode.estimated_cost_per_page}/page
                  </p>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}