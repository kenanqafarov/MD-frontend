import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function CustomSelect({
  options,
  onChange,
  placeholder,
  value,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between min-w-[120px]">
        <span className="text-gray-700">
          {value ? value.label : placeholder}
        </span>
        <FaChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100">
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
