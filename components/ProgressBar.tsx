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
      <div className="relative h-2 bg-[#E6DCC3] rounded-full overflow-hidden mb-8">
        {/* Changed from rose-400 to #BC4A3C (Vintage Red) */}
        <div 
          className="absolute top-0 left-0 h-full bg-[#BC4A3C] transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {steps.map((step, idx) => (
          <div key={idx} className={`text-center transition-opacity duration-500 ${idx <= currentStatus ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-6 h-6 mx-auto rounded-full mb-2 flex items-center justify-center ${idx <= currentStatus ? 'bg-[#BC4A3C] text-white' : 'bg-[#E6DCC3] text-[#F9F5F0]'}`}>
              {idx < currentStatus ? <CheckCircle2 size={14} /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
            </div>
            <p className="text-[10px] font-medium text-[#5C4033] truncate leading-tight h-8">{step.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;