import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import './AvailabilityCalendar.css';

export default function AvailabilityCalendar({ onDatesChange, defaultStart = 18, defaultEnd = 20 }) {
  const [startDay, setStartDay] = useState(defaultStart);
  const [endDay, setEndDay] = useState(defaultEnd);

  // September 2026 calendar days
  const daysInMonth = 30;
  const startDayOffset = 2; // Tuesday is 1st Sept 2026
  const bookedDays = [4, 5, 11, 12, 25, 26]; // example booked weekend slots

  const weekHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handleDayClick = (day) => {
    if (bookedDays.includes(day)) return;

    if (!startDay || (startDay && endDay)) {
      setStartDay(day);
      setEndDay(null);
      if (onDatesChange) onDatesChange({ start: `2026-09-${day < 10 ? '0' + day : day}`, end: null, count: 1 });
    } else if (startDay && !endDay) {
      if (day < startDay) {
        setStartDay(day);
        setEndDay(null);
        if (onDatesChange) onDatesChange({ start: `2026-09-${day < 10 ? '0' + day : day}`, end: null, count: 1 });
      } else {
        // check if range has booked days
        const hasBooked = bookedDays.some(b => b > startDay && b < day);
        if (hasBooked) {
          alert("The selected range contains unavailable dates. Please pick another range.");
          return;
        }
        setEndDay(day);
        const count = day - startDay + 1;
        if (onDatesChange) {
          onDatesChange({
            start: `2026-09-${startDay < 10 ? '0' + startDay : startDay}`,
            end: `2026-09-${day < 10 ? '0' + day : day}`,
            count
          });
        }
      }
    }
  };

  const isSelected = (day) => day === startDay || day === endDay;
  const isInRange = (day) => startDay && endDay && day > startDay && day < endDay;

  return (
    <div className="calendar-box space-y-3">
      {/* Month Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#E63946]" />
          <span className="font-bold text-sm text-[#1D3557] font-['Sora']">September 2026</span>
        </div>
        <div className="flex items-center gap-1 text-[#457B9D]">
          <button aria-label="Previous month" className="p-1 hover:bg-[#F1FAEE] rounded-lg">
            <ChevronLeft size={16} />
          </button>
          <button aria-label="Next month" className="p-1 hover:bg-[#F1FAEE] rounded-lg">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekHeaders.map((w, i) => (
          <div key={i} className="text-[11px] font-bold text-[#457B9D] py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Day Cells */}
      <div className="grid grid-cols-7 gap-1">
        {[...Array(startDayOffset)].map((_, i) => (
          <div key={`empty-${i}`} className="cal-day-cell text-transparent" />
        ))}

        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const booked = bookedDays.includes(day);
          const selected = isSelected(day);
          const inRange = isInRange(day);

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className={`cal-day-cell ${
                booked 
                  ? 'cal-day-booked' 
                  : selected 
                    ? 'cal-day-selected' 
                    : inRange 
                      ? 'cal-day-in-range' 
                      : 'cal-day-available'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend & Status */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#457B9D]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F1FAEE] border border-[#A8DADC]" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Realtime Notification */}
      <div className="p-2.5 bg-[#A8DADC]/20 rounded-xl text-xs flex items-center gap-2 text-[#1D3557]">
        <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
        <span>
          {startDay && endDay 
            ? `Selected: Sep ${startDay} - Sep ${endDay}, 2026 (${endDay - startDay + 1} Days)`
            : startDay 
              ? `Select end date (Start: Sep ${startDay})`
              : 'Select your rental start date'}
        </span>
      </div>
    </div>
  );
}
