import React from 'react';
import { Check } from 'lucide-react';
import './CheckoutStepper.css';

export default function CheckoutStepper({ currentStep = 1 }) {
  const steps = [
    { num: 1, label: 'Rental Details' },
    { num: 2, label: 'Review & Checkout' },
    { num: 3, label: 'Confirmation' },
  ];

  return (
    <div className="stepper-container">
      {steps.map((step, idx) => {
        const isCompleted = currentStep > step.num;
        const isActive = currentStep === step.num;

        return (
          <React.Fragment key={step.num}>
            <div className="flex items-center gap-2">
              <div className={`step-circle ${
                isCompleted 
                  ? 'step-completed' 
                  : isActive 
                    ? 'step-active' 
                    : 'step-pending'
              }`}>
                {isCompleted ? <Check size={16} /> : step.num}
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${
                isActive ? 'text-[#E63946]' : isCompleted ? 'text-[#1D3557]' : 'text-[#457B9D]'
              }`}>
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div className={`step-divider ${
                currentStep > step.num ? 'bg-[#1D3557]' : 'bg-[#A8DADC]'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
