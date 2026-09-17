import React from 'react';
import { 
  Check, 
  CalendarCheck, 
  Package, 
  Truck, 
  Play, 
  Clock, 
  RotateCcw, 
  ShieldCheck 
} from 'lucide-react';
import './RentalTimeline.css';

export default function RentalTimeline({ currentStep = 5 }) {
  const steps = [
    { num: 1, label: 'Booking Confirmed', icon: CalendarCheck },
    { num: 2, label: 'Product Reserved', icon: Package },
    { num: 3, label: 'Pickup Scheduled', icon: Truck },
    { num: 4, label: 'Product Handed Over', icon: Check },
    { num: 5, label: 'Rental Active', icon: Play },
    { num: 6, label: 'Return Scheduled', icon: Clock },
    { num: 7, label: 'Product Returned', icon: RotateCcw },
    { num: 8, label: 'Deposit Released', icon: ShieldCheck }
  ];

  return (
    <div className="w-full py-4 overflow-x-auto scrollbar-none">
      <div className="flex items-center min-w-[650px] px-2">
        {steps.map((step, idx) => {
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          const StepIcon = step.icon;

          return (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center text-center group flex-shrink-0 w-20">
                <div className={`timeline-step-circle ${
                  isDone 
                    ? 'timeline-step-done' 
                    : isCurrent 
                      ? 'timeline-step-current' 
                      : 'timeline-step-todo'
                }`}>
                  {isDone ? <Check size={13} strokeWidth={3} /> : <StepIcon size={13} />}
                </div>

                <span className={`text-[10px] font-bold mt-2 leading-tight ${
                  isCurrent ? 'text-[#E63946]' : isDone ? 'text-[#1D3557]' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div className={`timeline-line ${
                  currentStep > step.num ? 'timeline-line-done' : ''
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
