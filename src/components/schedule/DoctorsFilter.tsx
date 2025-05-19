
import React from "react";

type Doctor = {
  id: number;
  name: string;
  avatar: string;
  specialty: string;
  isCurrent?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function DoctorsFilter({
  doctors,
  onClear,
}: {
  doctors: Doctor[];
  onClear?: () => void;
}) {
  const current = doctors.find((d) => d.isCurrent);
  const others = doctors.filter((d) => !d.isCurrent);

  return (
    <div className="bg-white/[0.92] rounded-3xl shadow p-5 mb-5">
      <div className="font-bold text-zinc-800 mb-1">Doctors</div>
      <div className="text-xs text-zinc-500 mb-4">
        Plan your schedule and review your colleagues' workload
      </div>
      {current && (
        <DoctorRow {...current} />
      )}
      <div className="flex justify-between items-center mt-4 mb-1">
        <div className="text-xs text-zinc-500 font-semibold">Others</div>
        {onClear && (
          <button className="text-[11px] text-primary hover:underline" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>
      <div className="space-y-2">
        {others.map((d) => (
          <DoctorRow key={d.id} {...d} />
        ))}
      </div>
    </div>
  );
}

function DoctorRow({ id, name, avatar, specialty, checked, onChange, isCurrent }: Doctor) {
  return (
    <div className="flex items-center mb-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mr-2 accent-primary h-4 w-4 rounded focus:ring-2 focus:ring-primary"
        id={`doctor-${id}`}
      />
      <img
        src={avatar}
        alt={name}
        className="w-8 h-8 rounded-full border-2 border-white object-cover mr-2"
      />
      <div className="flex-1 min-w-0">
        <div className={isCurrent ? "font-semibold text-zinc-900" : "font-medium text-zinc-700 text-[15px]"}>
          {name}{isCurrent ? " (You)" : ""}
        </div>
        <div className="text-xs text-zinc-400 truncate">{specialty}</div>
      </div>
    </div>
  );
}
