import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { STEPS } from '../constants';
import { CommissionType } from '../types';

interface ProgressBarProps {
  type: CommissionType;
  currentStatus: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ type, currentStatus }) => {
  const steps = STEPS[type];
  const percentage = (currentStatus / (steps.length - 1)) * 100;

  return (
    <div className="w-full py-6">
      <div className="relative h-2 bg-rose-100 rounded-full overflow-hidden mb-8">
        <div 
          className="absolute top-0 left-0 h-full bg-rose-400 transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {steps.map((step, idx) => (
          <div key={idx} className={`text-center transition-opacity duration-500 ${idx <= currentStatus ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-6 h-6 mx-auto rounded-full mb-2 flex items-center justify-center ${idx <= currentStatus ? 'bg-rose-400 text-white' : 'bg-gray-200'}`}>
              {idx < currentStatus ? <CheckCircle2 size={14} /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
            </div>
            <p className="text-[10px] font-medium text-gray-700 truncate leading-tight h-8">{step.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;