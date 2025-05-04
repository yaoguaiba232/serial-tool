import React from 'react';
import { X, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft, ArrowRightCircle, ArrowLeftCircle, RotateCcw, Info, Github } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Element, scroller } from 'react-scroll';
import { ARROW_STYLES } from '../utils/constants';
import Card from './common/Card';

interface SettingsModalProps {
  onClose: () => void;
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

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = React.useState(() => localStorage.getItem('fontSize') || '14');
  const [timestampFormat, setTimestampFormat] = React.useState(() => localStorage.getItem('timestampFormat') || '24');
  const [showTimestamp, setShowTimestamp] = React.useState(() => localStorage.getItem('showTimestamp') !== 'false');
  const [showSent, setShowSent] = React.useState(() => localStorage.getItem('showSent') !== 'false');
  const [showReceived, setShowReceived] = React.useState(() => localStorage.getItem('showReceived') !== 'false');
  const [arrowStyle, setArrowStyle] = React.useState(() => localStorage.getItem('arrowStyle') || 'arrow');
  const [bufferSize, setBufferSize] = React.useState(() => localStorage.getItem('bufferSize') || '512');

  const scrollToSection = (section: string) => {
    scroller.scrollTo(section, {
      duration: 500,
      smooth: true,
      containerId: 'settingsContainer',
      offset: -20
    });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = e.target.value;
    setFontSize(newSize);
    localStorage.setItem('fontSize', newSize);
  };

  const handleTimestampFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value;
    setTimestampFormat(newFormat);
    localStorage.setItem('timestampFormat', newFormat);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as 'dark' | 'light';
    setTheme(newTheme);
  };

  const handleShowTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowTimestamp(e.target.checked);
    localStorage.setItem('showTimestamp', e.target.checked.toString());
  };

  const handleShowSentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowSent(e.target.checked);
    localStorage.setItem('showSent', e.target.checked.toString());
  };

  const handleShowReceivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowReceived(e.target.checked);
    localStorage.setItem('showReceived', e.target.checked.toString());
  };

  const handleBufferSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 512;
    if (value < 0) value = 0;
    if (value > 51200) value = 51200;
    setBufferSize(value.toString());
    localStorage.setItem('bufferSize', value.toString());
  };

  const resetBufferSize = () => {
    setBufferSize('512');
    localStorage.setItem('bufferSize', '512');
  };

  const sections = [
    { id: 'appearance', title: '外观设置' },
    { id: 'messages', title: '消息显示' },
    { id: 'buffer', title: '接收缓冲区' },
    { id: 'timestamp', title: '时间格式' },
    { id: 'arrows', title: '箭头样式' },
    { id: 'about', title: '关于' }
  ];

  const versions = [
    {
      version: 'v1.0.0',
      date: '2025.5.3',
      description: '初始版本',
      features: ['基础串口通信功能', '支持发送和接收数据', '基本配置界面']
    },
    {
      version: 'v1.0.1',
      date: '2025.5.4',
      description: '功能增强更新',
      features: [
        '新增文件传输功能',
        '新增定时发送功能',
        '新增预设报文功能',
        '新增校验计算器',
        '深色/浅色主题切换',
        '启动动画效果',
        '可拖拽的面板布局'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 dark:bg-gray-100 rounded-lg shadow-xl w-full max-w-5xl flex max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white dark:hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="w-1/2 border-r border-gray-700 dark:border-gray-200 flex flex-col">
          <div className="flex-none p-4 border-b border-gray-700 dark:border-gray-200">
            <h2 className="text-lg font-semibold text-white dark:text-gray-900">设置</h2>
          </div>

          <div className="flex-none border-b border-gray-700 dark:border-gray-200 p-2">
            <div className="flex flex-wrap gap-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="px-3 py-1 text-sm bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-full hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors"
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>

          <div 
            id="settingsContainer"
            className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 dark:scrollbar-thumb-gray-300 scrollbar-track-gray-700 dark:scrollbar-track-gray-200"
          >
            <Card id="appearance" title="外观">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
                    主题
                  </label>
                  <select
                    value={theme}
                    onChange={handleThemeChange}
                    className="bg-gray-600 dark:bg-gray-50 text-white dark:text-gray-900 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">浅色主题</option>
                    <option value="dark">深色主题</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
                    字体大小
                  </label>
                  <select
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="bg-gray-600 dark:bg-gray-50 text-white dark:text-gray-900 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24].map(size => (
                      <option key={size} value={size}>{size}px</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            <Card id="messages" title="消息显示">
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showTimestamp}
                    onChange={handleShowTimestampChange}
                    className="rounded border-gray-500 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm text-gray-300 dark:text-gray-700">显示时间戳</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showSent}
                    onChange={handleShowSentChange}
                    className="rounded border-gray-500 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm text-gray-300 dark:text-gray-700">显示发送消息</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showReceived}
                    onChange={handleShowReceivedChange}
                    className="rounded border-gray-500 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm text-gray-300 dark:text-gray-700">显示接收消息</span>
                </label>
              </div>
            </Card>

            <Card id="buffer" title="接收缓冲区">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
                      缓冲区大小 (0-51200 bytes)
                    </label>
                    <input
                      type="number"
                      value={bufferSize}
                      onChange={handleBufferSizeChange}
                      min="0"
                      max="51200"
                      className="bg-gray-600 dark:bg-gray-50 text-white dark:text-gray-900 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={resetBufferSize}
                    className="mt-6 p-2 bg-gray-600 dark:bg-gray-200 hover:bg-gray-500 dark:hover:bg-gray-300 rounded-md transition-colors"
                    title="重置为默认值 (512 bytes)"
                  >
                    <RotateCcw size={18} className="text-gray-300 dark:text-gray-700" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  当前设置: {bufferSize} bytes
                </p>
              </div>
            </Card>

            <Card id="timestamp" title="时间格式">
              <select
                value={timestampFormat}
                onChange={handleTimestampFormatChange}
                className="bg-gray-600 dark:bg-gray-50 text-white dark:text-gray-900 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24">24小时制</option>
                <option value="12">12小时制</option>
              </select>
            </Card>

            <Card id="arrows" title="箭头样式">
              <div className="grid gap-2">
                {ARROW_STYLES.map(style => (
                  <ArrowStylePreview
                    key={style.id}
                    style={style.id}
                    selected={arrowStyle === style.id}
                    onClick={() => {
                      setArrowStyle(style.id);
                      localStorage.setItem('arrowStyle', style.id);
                    }}
                  />
                ))}
              </div>
            </Card>

            <Card id="about" title="关于">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-blue-400 dark:text-blue-600">
                  <Info size={20} />
                  <h3 className="text-lg font-medium">串口调试工具</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/50 dark:border-gray-300/50">
                    <span className="text-sm text-gray-400 dark:text-gray-600">作者</span>
                    <span className="text-sm text-gray-300 dark:text-gray-700">huangpenghao</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/50 dark:border-gray-300/50">
                    <span className="text-sm text-gray-400 dark:text-gray-600">联系方式</span>
                    <a 
                      href="mailto:2908272845@qq.com"
                      className="text-sm text-blue-400 dark:text-blue-600 hover:underline"
                    >
                      2908272845@qq.com
                    </a>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/50 dark:border-gray-300/50">
                    <span className="text-sm text-gray-400 dark:text-gray-600">仓库地址</span>
                    <a 
                      href="https://github.com/yaoguaiba232/serial-tool"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 dark:text-blue-600 hover:underline flex items-center"
                    >
                      <Github size={16} className="mr-1" />
                      GitHub
                    </a>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/50 dark:border-gray-300/50">
                    <span className="text-sm text-gray-400 dark:text-gray-600">当前版本</span>
                    <span className="text-sm text-gray-300 dark:text-gray-700">v1.0.1</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-300 dark:text-gray-700">版本历史</h4>
                  {versions.map((version, index) => (
                    <div 
                      key={version.version}
                      className="bg-gray-700 dark:bg-gray-200 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-white dark:text-gray-900">
                          {version.version}
                        </span>
                        <span className="text-sm text-gray-400 dark:text-gray-600">
                          {version.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 dark:text-gray-700">
                        {version.description}
                      </p>
                      <ul className="text-sm space-y-1">
                        {version.features.map((feature, i) => (
                          <li 
                            key={i}
                            className="text-gray-400 dark:text-gray-600 flex items-center"
                          >
                            <span className="w-1.5 h-1.5 bg-blue-400 dark:bg-blue-600 rounded-full mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="w-1/2 flex flex-col max-h-[90vh]">
          <div className="flex-none p-4 border-b border-gray-700 dark:border-gray-200">
            <h2 className="text-lg font-semibold text-white dark:text-gray-900">预览</h2>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 dark:scrollbar-thumb-gray-300 scrollbar-track-gray-700 dark:scrollbar-track-gray-200">
            <Card id="preview" title="消息预览">
              <div className="space-y-2 font-mono" style={{ fontSize: `${fontSize}px` }}>
                {[
                  { id: 1, timestamp: new Date(), direction: 'sent' as const, content: '发送的消息示例' },
                  { id: 2, timestamp: new Date(), direction: 'received' as const, content: '接收的消息示例' },
                  { id: 3, timestamp: new Date(), direction: 'sent' as const, content: '另一条发送的消息' }
                ].map(message => (
                  showSent && message.direction === 'sent' || showReceived && message.direction === 'received' ? (
                    <div
                      key={message.id}
                      className={`py-1 px-2 rounded transition-colors ${
                        message.direction === 'sent'
                          ? 'bg-gray-600/50 dark:bg-gray-100/50'
                          : ''
                      }`}
                    >
                      {showTimestamp && (
                        <span className="text-gray-400 dark:text-gray-500">
                          [{timestampFormat === '24'
                            ? message.timestamp.toLocaleTimeString('zh-CN', { hour12: false })
                            : message.timestamp.toLocaleTimeString('zh-CN', { hour12: true })}]
                        </span>
                      )}{' '}
                      <span className={`${
                        message.direction === 'sent'
                          ? 'text-blue-400 dark:text-blue-600'
                          : 'text-green-400 dark:text-green-600'
                      }`}>
                        {(() => {
                          switch (arrowStyle) {
                            case 'arrow':
                              return message.direction === 'sent' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />;
                            case 'chevron':
                              return message.direction === 'sent' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />;
                            case 'circle':
                              return message.direction === 'sent' ? <ArrowRightCircle size={16} /> : <ArrowLeftCircle size={16} />;
                            case 'text':
                              return message.direction === 'sent' ? '>>' : '<<';
                            case 'none':
                              return '';
                            default:
                              return message.direction === 'sent' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />;
                          }
                        })()}
                      </span>{' '}
                      <span className="break-all">{message.content}</span>
                    </div>
                  ) : null
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;