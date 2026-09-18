import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Info, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import api from '../../services/api';
import './AvailabilityCalendar.css';

export default function AvailabilityCalendar({
  productId,
  selectedStart,
  selectedEnd,
  quantity = 1,
  onDatesChange
}) {
  // Determine initial calendar month view based on selectedStart or simulated current period (September 2026)
  const [viewDate, setViewDate] = useState(() => {
    if (selectedStart && !isNaN(new Date(selectedStart).getTime())) {
      return new Date(`${selectedStart}T00:00:00`);
    }
    return new Date('2026-09-01T00:00:00');
  });

  const [availabilityMap, setAvailabilityMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1; // 1 - 12

  // Month metadata
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const startDayOffset = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month, 0).getDate();

  const weekHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Fetch real-time monthly matrix from backend API
  const fetchMonthAvailability = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await api.get(`/products/${productId}/availability`, {
        params: { month, year }
      });

      if (response.data?.success && response.data?.data?.matrix) {
        const map = {};
        for (const item of response.data.data.matrix) {
          map[item.date] = {
            ...item,
            isAvailable: item.availableStock >= quantity && item.isAvailable
          };
        }
        setAvailabilityMap(map);
      }
    } catch (err) {
      console.warn('[AvailabilityCalendar] Failed to load matrix, using local check:', err);
      setLoadError('Live sync offline. Using local calendar check.');
    } finally {
      setIsLoading(false);
    }
  }, [productId, month, year, quantity]);

  useEffect(() => {
    fetchMonthAvailability();
  }, [fetchMonthAvailability]);

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month, 1));
  };

  const formatDateStr = (dayNum) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
  };

  const handleDayClick = (dayNum) => {
    const clickedDateStr = formatDateStr(dayNum);
    const dayInfo = availabilityMap[clickedDateStr];

    // Block selection if unavailable
    if (dayInfo && !dayInfo.isAvailable) {
      alert(`Date ${clickedDateStr} is unavailable. It is either already booked or reserved for the mandatory 1-day inspection & sanitization turnaround buffer.`);
      return;
    }

    // Single click / Reset selection: If nothing is selected, or both start & end already picked
    if (!selectedStart || (selectedStart && selectedEnd && selectedStart !== selectedEnd)) {
      if (onDatesChange) {
        onDatesChange({ start: clickedDateStr, end: clickedDateStr, count: 1 });
      }
    } else if (selectedStart && (!selectedEnd || selectedStart === selectedEnd)) {
      if (clickedDateStr < selectedStart) {
        // User clicked an earlier date -> reset start to this earlier date
        if (onDatesChange) {
          onDatesChange({ start: clickedDateStr, end: clickedDateStr, count: 1 });
        }
      } else {
        // Verify all intermediate days are available (no booked / buffer days in between)
        const dStart = new Date(`${selectedStart}T00:00:00`);
        const dEnd = new Date(`${clickedDateStr}T00:00:00`);
        let hasConflict = false;
        let conflictDate = '';

        const cur = new Date(dStart);
        while (cur <= dEnd) {
          const curStr = cur.toISOString().split('T')[0];
          const info = availabilityMap[curStr];
          if (info && !info.isAvailable) {
            hasConflict = true;
            conflictDate = curStr;
            break;
          }
          cur.setDate(cur.getDate() + 1);
        }

        if (hasConflict) {
          alert(`Cannot select range: ${conflictDate} is booked or reserved for 1-day sanitization turnaround buffer. Please pick a continuous available date range.`);
          return;
        }

        const count = Math.round((dEnd - dStart) / (1000 * 60 * 60 * 24)) + 1;
        if (onDatesChange) {
          onDatesChange({
            start: selectedStart,
            end: clickedDateStr,
            count
          });
        }
      }
    }
  };

  const isDaySelected = (dateStr) => {
    return dateStr === selectedStart || dateStr === selectedEnd;
  };

  const isDayInRange = (dateStr) => {
    if (!selectedStart || !selectedEnd) return false;
    return dateStr > selectedStart && dateStr < selectedEnd;
  };

  return (
    <div className="calendar-box space-y-3">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#E63946]" />
          <span className="font-bold text-sm text-[#1D3557] font-['Sora']">{monthName}</span>
          {isLoading && <Loader2 size={13} className="animate-spin text-[#457B9D]" />}
        </div>
        <div className="flex items-center gap-1 text-[#457B9D]">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="p-1 hover:bg-[#F1FAEE] rounded-lg transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="p-1 hover:bg-[#F1FAEE] rounded-lg transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Week Day Labels */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekHeaders.map((w, i) => (
          <div key={i} className="text-[11px] font-bold text-[#457B9D] py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 gap-1">
        {[...Array(startDayOffset)].map((_, i) => (
          <div key={`empty-${i}`} className="cal-day-cell text-transparent select-none" />
        ))}

        {[...Array(daysInMonth)].map((_, i) => {
          const dayNum = i + 1;
          const dateStr = formatDateStr(dayNum);
          const dayInfo = availabilityMap[dateStr];
          const isBooked = dayInfo ? !dayInfo.isAvailable : false;
          const selected = isDaySelected(dateStr);
          const inRange = isDayInRange(dateStr);

          return (
            <div
              key={dayNum}
              onClick={() => handleDayClick(dayNum)}
              title={
                isBooked
                  ? `${dateStr}: Booked / 1-Day Turnaround Buffer`
                  : dayInfo
                  ? `${dateStr}: Available (${dayInfo.availableStock} in stock)`
                  : dateStr
              }
              className={`cal-day-cell ${
                isBooked
                  ? 'cal-day-booked'
                  : selected
                  ? 'cal-day-selected'
                  : inRange
                  ? 'cal-day-in-range'
                  : 'cal-day-available'
              }`}
            >
              {dayNum}
            </div>
          );
        })}
      </div>

      {/* Dynamic Legend */}
      <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-[#457B9D] gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
            <span className="font-semibold text-[#1D3557]">Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F1FAEE] border border-[#A8DADC]" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            <span className="line-through text-gray-400">Booked / Buffer</span>
          </div>
        </div>
        <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
          <Sparkles size={10} /> +1 Day Turnaround Buffer Protected
        </div>
      </div>

      {/* Realtime Selection Notification Box */}
      <div className="p-2.5 bg-[#A8DADC]/20 rounded-xl text-xs flex items-center gap-2 text-[#1D3557]">
        <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
        <span className="font-medium">
          {selectedStart && selectedEnd && selectedStart !== selectedEnd
            ? `Selected: ${selectedStart} → ${selectedEnd} (${Math.round((new Date(selectedEnd) - new Date(selectedStart)) / (1000 * 60 * 60 * 24)) + 1} Days)`
            : selectedStart
            ? `Rental starts: ${selectedStart} (Click another date to set end date)`
            : 'Click any available calendar slot to choose rental dates'}
        </span>
      </div>
    </div>
  );
}
