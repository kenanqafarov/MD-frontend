"use client";

import { useState, useRef, useEffect } from "react";

const CustomSelect = ({
  options = [],
  onChange,
  placeholder = "Select...",
  value,
  isClearable = false,
  isSearchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="relative w-full" ref={selectRef}>
      <div
        className="flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-blue-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}>
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value ? value.label : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {isClearable && value && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 text-lg">
              ×
            </button>
          )}
          <span
            className={`transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}>
            ▼
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {isSearchable && (
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="p-3 text-gray-500 text-center">
              No options found
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                className="p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleSelect(option)}>
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
