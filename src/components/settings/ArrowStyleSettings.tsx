import React from 'react';
import { Settings } from '../../hooks/useSettings';
import { Card } from '../common';
import { ArrowRight, ArrowLeft, ChevronRight, ChevronLeft, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';
import { ARROW_STYLES } from '../../utils/constants';

interface ArrowStyleSettingsProps {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const ArrowStylePreview: React.FC<{
  style: string;
  selected: boolean;
  onClick: () => void;
}> = ({ style, selected, onClick }) => {
  const getArrowContent = (style: string, direction: 'sent' | 'received') => {
    switch (style) {
      case 'arrow':
        return direction === 'sent' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />;
      case 'chevron':
        return direction === 'sent' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />;
      case 'circle':
        return direction === 'sent' ? <ArrowRightCircle size={16} /> : <ArrowLeftCircle size={16} />;
      case 'text':
        return direction === 'sent' ? '>>' : '<<';
      case 'none':
        return '';
      default:
        return direction === 'sent' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors w-full ${
        selected
          ? 'bg-blue-600 text-white'
          : 'bg-gray-600 dark:bg-gray-50 text-gray-300 dark:text-gray-700 hover:bg-gray-500 dark:hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-blue-400">{getArrowContent(style, 'sent')}</span>
        <span className="text-xs">发送</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-green-400">{getArrowContent(style, 'received')}</span>
        <span className="text-xs">接收</span>
      </div>
    </button>
  );
};

const ArrowStyleSettings: React.FC<ArrowStyleSettingsProps> = ({ settings, onUpdate }) => {
  return (
    <Card id="arrows" title="箭头样式">
      <div className="grid gap-2">
        {ARROW_STYLES.map(style => (
          <ArrowStylePreview
            key={style.id}
            style={style.id}
            selected={settings.arrowStyle === style.id}
            onClick={() => onUpdate('arrowStyle', style.id)}
          />
        ))}
      </div>
    </Card>
  );
};

export default ArrowStyleSettings;