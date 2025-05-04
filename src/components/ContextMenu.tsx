import React, { useEffect, useRef, useState } from 'react';
import { Copy, Trash2, RotateCcw } from 'lucide-react';

interface MenuPosition {
  x: number;
  y: number;
}

interface MenuItem {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  divider?: boolean;
}

interface ContextMenuProps {
  items: MenuItem[];
  position: MenuPosition;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ items, position, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState<MenuPosition>(position);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const adjustMenuPosition = () => {
      if (!menuRef.current) return;

      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      if (x + menuRect.width > windowWidth) {
        x = windowWidth - menuRect.width;
      }

      if (y + menuRect.height > windowHeight) {
        y = windowHeight - menuRect.height;
      }

      setAdjustedPosition({ x, y });
    };

    document.addEventListener('mousedown', handleClickOutside);
    adjustMenuPosition();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [position, onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] bg-gray-800 dark:bg-white rounded-md shadow-lg border border-gray-700 dark:border-gray-200 py-1"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <button
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className="w-full px-4 py-2 text-sm text-left text-gray-200 dark:text-gray-800 hover:bg-gray-700 dark:hover:bg-gray-100 flex items-center"
          >
            {item.icon && <span className="w-5 h-5 mr-2">{item.icon}</span>}
            {item.label}
          </button>
          {item.divider && <div className="my-1 border-t border-gray-700 dark:border-gray-200" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ContextMenu;