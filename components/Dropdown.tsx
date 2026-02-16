'use client';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  required?: boolean;
  value: string;
  options: DropdownOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function Dropdown({
  label,
  required = false,
  value,
  options,
  onValueChange,
  disabled = false,
  placeholder = 'Select...',
}: DropdownProps) {

  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        className="input-field w-full cursor-pointer appearance-none bg-right bg-no-repeat pr-10 disabled:cursor-not-allowed disabled:bg-slate-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundSize: '1.25rem',
        }}
      >
        <option value="">
          {disabled ? 'Select district first...' : placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
