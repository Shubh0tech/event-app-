
import React, { useState, useRef, useEffect } from 'react';
import { format, parse, startOfDay, setHours, setMinutes, isSameDay } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';

// We'll define cn here as well if it doesn't exist yet, but the prompt says 
// "Use Tailwind CSS utility classes directly".
// I'll define it locally to be safe or check src/lib/utils.ts

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({ value, onChange, placeholder = 'Select date & time', className }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Time slots every 30 mins
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? 0 : 30;
    return { hour, minute, label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}` };
  });

  const currentHour = selectedDate ? selectedDate.getHours() : 12;
  const currentMinute = selectedDate ? selectedDate.getMinutes() : 0;
  const roundedMinute = currentMinute < 30 ? 0 : 30;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = setHours(setMinutes(date, currentMinute), currentHour);
      setSelectedDate(newDate);
      onChange(newDate.toISOString());
    }
  };

  const handleTimeSelect = (hour: number, minute: number) => {
    const baseDate = selectedDate || new Date();
    const newDate = setHours(setMinutes(baseDate, minute), hour);
    setSelectedDate(newDate);
    onChange(newDate.toISOString());
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-neutral-50 p-4 rounded-2xl flex items-center justify-between text-left transition-all border outline-none",
          isOpen ? "border-black ring-2 ring-black/5 bg-white" : "border-transparent hover:bg-white hover:border-neutral-200"
        )}
      >
        <div className="flex items-center gap-3">
          <CalendarIcon size={18} className={cn("transition-colors", selectedDate ? "text-black" : "text-neutral-400")} />
          <span className={cn("text-sm font-medium", !selectedDate && "text-neutral-400")}>
            {selectedDate ? format(selectedDate, 'PPP p') : placeholder}
          </span>
        </div>
        <ChevronDown size={18} className={cn("text-neutral-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-[32px] shadow-2xl border border-neutral-100 p-6 flex flex-col md:flex-row gap-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex-1 border-r border-neutral-100 pr-0 md:pr-6">
              <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-widest text-neutral-400">
                <CalendarIcon size={14} />
                <span>Select Date</span>
              </div>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="mx-auto"
                modifiersClassNames={{
                  selected: 'rdp-day_selected_custom'
                }}
              />
            </div>

            <div className="w-full md:w-32 flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-widest text-neutral-400">
                <Clock size={14} />
                <span>Select Time</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-1 max-h-[250px] scrollbar-hide">
                {timeSlots.map((slot) => {
                  const isSelected = selectedDate && selectedDate.getHours() === slot.hour && selectedDate.getMinutes() === slot.minute;
                  return (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => handleTimeSelect(slot.hour, slot.minute)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all",
                        isSelected ? "bg-black text-white" : "hover:bg-neutral-100 text-neutral-600"
                      )}
                    >
                      {slot.label}
                      {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
              .rdp {
                --rdp-cell-size: 40px;
                --rdp-accent-color: #000;
                --rdp-background-color: #f5f5f5;
                margin: 0;
              }
              .rdp-day_selected {
                background-color: #000 !important;
                color: #fff !important;
                border-radius: 12px !important;
              }
              .rdp-day:hover:not(.rdp-day_selected) {
                background-color: #f5f5f5 !important;
                border-radius: 12px !important;
              }
              .rdp-button:focus-visible {
                background-color: #f5f5f5 !important;
                color: #000 !important;
              }
              .rdp-head_cell {
                font-size: 10px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: #a3a3a3;
                padding-bottom: 8px;
              }
              .rdp-nav_button {
                background-color: #f5f5f5;
                border-radius: 10px;
                color: #000;
              }
              .rdp-caption_label {
                font-weight: 800;
                font-size: 14px;
              }
            ` }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
