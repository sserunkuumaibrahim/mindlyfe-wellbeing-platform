
const CONSULTATION_TYPES = [
  "Psychotherapy",
  "Psychiatric consultation",
  "Child psychology",
  "Family therapy",
  "Gestalt therapy",
  "Art therapy",
  "Sleep therapy",
];

export default function ConsultationTypeFilter({
  checked = [],
  onChange,
}: {
  checked: string[];
  onChange: (next: string[]) => void;
}) {
  function handleToggle(type: string) {
    onChange(
      checked.includes(type)
        ? checked.filter((c) => c !== type)
        : [...checked, type]
    );
  }
  return (
    <div className="bg-white/[0.92] rounded-3xl shadow p-5">
      <div className="font-bold text-zinc-800 mb-2">Type of Consultation</div>
      <div className="space-y-1">
        {CONSULTATION_TYPES.map((type) => (
          <label className="flex items-center gap-2 text-sm mb-1 cursor-pointer" key={type}>
            <input
              type="checkbox"
              className="accent-primary min-w-4 min-h-4 rounded"
              checked={checked.includes(type)}
              onChange={() => handleToggle(type)}
            />
            <span className="text-zinc-700">{type}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
