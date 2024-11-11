// useDropdown 훅을 import
import useDropdown from "@/hooks/useDropdown";
import React, { ReactNode, createContext, useContext, useMemo } from "react";

import { PopoverContextType } from "../Dropdown/dropdownType";

const PopoverContext = createContext<PopoverContextType | null>(null);

const usePopoverContext = () => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("usePopoverContext must be used within PopoverProvider");
  }
  return context;
};

export default function Popover({ children }: { children: React.ReactNode }) {
  const { isOpen, toggleDropdown, closeDropdown, dropdownRef } = useDropdown();

  const contextValue = useMemo(
    () => ({
      isOpen,
      togglePopover: toggleDropdown,
      closePopover: closeDropdown,
    }),
    [isOpen, toggleDropdown, closeDropdown],
  );

  return (
    <PopoverContext.Provider value={contextValue}>
      <div ref={dropdownRef} className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

// Toggle 컴포넌트
interface ToggleProps {
  icon: ReactNode;
}

function Toggle({ icon }: ToggleProps) {
  const { togglePopover } = usePopoverContext();

  return (
    <button
      type="button"
      onClick={togglePopover}
      className="flex h-40 w-40 items-center justify-between rounded-full"
    >
      {icon}
    </button>
  );
}

// Wrapper 컴포넌트
function Wrapper({ children }: { children: React.ReactNode }) {
  const { isOpen } = usePopoverContext();

  return isOpen ? (
    <div className="absolute left-auto right-0 z-[100] mt-3 flex w-auto flex-col gap-3 rounded-8 border border-gray-20 bg-gray-5 p-8 shadow-dropdown-wrapper">
      {children}
    </div>
  ) : null;
}

// Item 컴포넌트
interface ItemProps {
  label: string;
  onClick: () => void;
}

function Item({ label, onClick }: ItemProps) {
  const { closePopover } = usePopoverContext();
  return (
    <button
      type="button"
      onClick={() => {
        onClick();
        closePopover();
      }}
      className="w-full text-nowrap rounded-8 px-12 py-6 text-center text-15-500 text-gray-100-opacity-80 hover:bg-purple-opacity-5 hover:text-purple-80"
    >
      {label}
    </button>
  );
}

Popover.Toggle = Toggle;
Popover.Wrapper = Wrapper;
Popover.Item = Item;
