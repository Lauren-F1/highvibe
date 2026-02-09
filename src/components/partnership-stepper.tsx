'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const steps = [
  'Draft',
  'Shortlist',
  'Invites Sent',
  'In Conversation',
  'Confirmed',
  'Booked',
];

export type PartnershipStage = 'Draft' | 'Shortlist' | 'Invites Sent' | 'In Conversation' | 'Confirmed' | 'Booked';

interface PartnershipStepperProps {
  currentStage: PartnershipStage;
}

export function PartnershipStepper({ currentStage }: PartnershipStepperProps) {
  const currentStepIndex = steps.indexOf(currentStage);

  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center text-center w-24">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted ? 'border-beige bg-beige text-background' : '',
                    isCurrent ? 'border-beige-dark bg-beige/20 ring-4 ring-beige/20' : '',
                    !isCompleted && !isCurrent ? 'border-border bg-secondary' : ''
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <span className={cn('text-base font-bold', isCurrent && 'text-beige-dark')}>{index + 1}</span>}
                </div>
                <p
                  className={cn(
                    'mt-2 text-xs font-medium leading-tight',
                    isCurrent ? 'text-beige-dark' : 'text-muted-foreground'
                  )}
                >
                  {step}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'flex-1 border-t-2 transition-colors duration-300',
                  isCompleted ? 'border-beige' : 'border-border'
                )}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
