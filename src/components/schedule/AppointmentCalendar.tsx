import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Doctor = {
  id: number;
  name: string;
  avatar: string;
  specialty: string;
};

type Appointment = {
  id: number;
  doctorId: number;
  patient: string;
  type: string;
  timeRange: string; // e.g. "09:00 am - 10:00 am"
  from: string; // e.g. "09:00"
  to: string;   // e.g. "10:00"
  info?: string;
  color?: string;
};

type Props = {
  doctors: Doctor[];
  appointments: Appointment[];
  day: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
};

const TIME_SLOTS = [
  "9 am", "10 am", "11 am", "12 pm", "1 pm", "2 pm"
];

export default function AppointmentCalendar({
  doctors,
  appointments,
  day,
  onPrevDay,
  onNextDay,
}: Props) {
  const doctorAvatars = doctors.map((doc) => doc.avatar);

  return (
    <div className="rounded-3xl bg-white/[.93] shadow flex-1 overflow-hidden flex flex-col">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b px-6 py-4">
        <div>
          <div className="font-semibold text-zinc-900 text-lg mb-1">
            Appointments
          </div>
          <div className="text-sm text-zinc-500">Stay organized and on track with calendar</div>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button size="sm" variant="secondary" className="rounded-full px-5">Day</Button>
          <Button size="sm" variant="ghost" className="rounded-full px-5 text-zinc-500">Week</Button>
          <Button size="sm" variant="ghost" className="rounded-full px-5 text-zinc-500">Month</Button>
          <div className="flex items-center ml-3 gap-1 text-zinc-700 font-semibold">
            <Button size="icon" variant="ghost" className="rounded-full" onClick={onPrevDay}><ChevronLeft /></Button>
            <span className="w-28 text-center">{day.toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" })}</span>
            <Button size="icon" variant="ghost" className="rounded-full" onClick={onNextDay}><ChevronRight /></Button>
          </div>
        </div>
        <Button variant="default" className="ml-auto rounded-full">+ Add new</Button>
      </div>
      {/* Doctor Avatars */}
      <div className="flex px-6 py-3 gap-7 border-b scrollbar-thin overflow-x-auto">
        {doctors.map((doc) => (
          <div className="flex flex-col items-center min-w-[95px]" key={doc.id}>
            <img
              src={doc.avatar}
              alt={doc.name}
              className="w-9 h-9 rounded-full object-cover shadow border-2 border-white mx-auto"
            />
            <span className="text-xs font-semibold text-zinc-800">{doc.name}</span>
            <span className="text-[11px] text-zinc-400">{doc.specialty}</span>
          </div>
        ))}
      </div>
      {/* Calendar Table */}
      <div className="flex-1 w-full overflow-auto p-4 pb-7">
        <div className="hidden md:grid grid-cols-[120px_repeat(var(--doc-count),1fr)] gap-5" style={{ "--doc-count": doctors.length } as React.CSSProperties}>
          <div></div>
          {doctors.map((d) => (
            <div key={d.id} className="text-sm text-center font-semibold text-zinc-600">{d.name}</div>
          ))}
          {/* Render times and cells */}
          {TIME_SLOTS.map((slot, i) => (
            <React.Fragment key={slot}>
              <div className="text-zinc-400 text-xs pt-2">{slot}</div>
              {doctors.map((doc) => (
                <div key={doc.id + slot} className="h-20 relative">
                  {appointments
                    .filter((a) => a.doctorId === doc.id && a.timeRange.toLowerCase().includes(slot))
                    .map((a) => (
                      <div
                        key={a.id}
                        className={cn(
                          "absolute left-0 right-0 bg-white rounded-xl shadow text-xs px-3 py-2 border border-blue-100/60",
                          "flex flex-col gap-1",
                        )}
                        style={{
                          top: "4px",
                          background:
                            a.color ||
                            "linear-gradient(90deg, #eef2ff 60%, #dbeafe 100%)",
                        }}
                      >
                        <div className="font-medium text-zinc-700">{a.patient}</div>
                        <div className="text-[11px] text-zinc-400">{a.type}</div>
                        <div className="text-[11px] text-zinc-500">{a.timeRange}</div>
                      </div>
                    ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        {/* Mobile: Stack list */}
        <div className="md:hidden flex flex-col gap-4">
          {appointments.map((a) => {
            const doc = doctors.find((doc) => doc.id === a.doctorId);
            return (
              <div key={a.id} className="bg-white rounded-2xl shadow p-4 flex items-center gap-3 border border-blue-50">
                <img src={doc?.avatar} className="w-10 h-10 rounded-full" alt={doc?.name} />
                <div className="flex-1">
                  <div className="font-semibold text-zinc-900">{a.patient}</div>
                  <div className="text-xs text-zinc-500">{a.type}</div>
                  <div className="text-xs text-zinc-400">{a.timeRange}</div>
                </div>
                <div className="text-[11px] text-zinc-400">{doc?.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
