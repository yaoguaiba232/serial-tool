import React, { useState, useEffect } from 'react';
import { useSerial } from '../contexts/SerialContext';
import { MessageSquare, Plus, Send, Trash2, Save, Edit, X, CircleDot as DragHandleDots2 } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';

interface PresetMessage {
  id: string;
  content: string;
  type: 'ascii' | 'hex';
  name: string;
}

const SerialPresetMessages: React.FC = () => {
  const { sendMessage, status } = useSerial();
  const [presets, setPresets] = useLocalStorage<PresetMessage[]>('serialPresetMessages', []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'ascii' | 'hex'>('ascii');

  const resetForm = () => {
    setNewName('');
    setNewContent('');
    setNewType('ascii');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAddPreset = () => {
    if (!newContent.trim() || !newName.trim()) return;
    
    const newPreset: PresetMessage = {
      id: Date.now().toString(),
      content: newContent,
      type: newType,
      name: newName
    };
    
    setPresets([...presets, newPreset]);
    resetForm();
  };

  const handleEditPreset = () => {
    if (!editingId || !newContent.trim() || !newName.trim()) return;
    
    const updatedPresets = presets.map(preset => 
      preset.id === editingId 
        ? { ...preset, content: newContent, type: newType, name: newName }
        : preset
    );
    
    setPresets(updatedPresets);
    resetForm();
  };

  const startEditing = (preset: PresetMessage) => {
    setEditingId(preset.id);
    setNewName(preset.name);
    setNewContent(preset.content);
    setNewType(preset.type);
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter(preset => preset.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  const handleSendPreset = (preset: PresetMessage) => {
    if (!status.connected) return;
    sendMessage(preset.content, preset.type);
  };

  const handleDragStart = (e: React.DragEvent, preset: PresetMessage) => {
    e.dataTransfer.setData('application/json', JSON.stringify(preset));
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add a dragging class to the document body for styling
    document.body.classList.add('dragging-preset');
  };
  
  const handleDragEnd = () => {
    document.body.classList.remove('dragging-preset');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-blue-400 dark:text-blue-600" />
          <h3 className="text-lg font-medium">预设报文</h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`p-1.5 rounded-full ${
            isAdding
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          title={isAdding ? "取消添加" : "添加预设"}
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-gray-700 dark:bg-gray-200 p-3 rounded-md mb-3">
          <h4 className="text-sm font-medium mb-2 text-gray-300 dark:text-gray-700">
            {editingId ? '编辑预设' : '新增预设'}
          </h4>
          <div className="space-y-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="预设名称"
              className="w-full bg-gray-600 dark:bg-white text-white dark:text-gray-900 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="输入预设内容..."
              className="w-full bg-gray-600 dark:bg-white text-white dark:text-gray-900 rounded px-3 py-2 h-20 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300 dark:text-gray-700">格式:</label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={newType === 'ascii'}
                    onChange={() => setNewType('ascii')}
                    className="mr-1"
                  />
                  <span className="text-sm text-gray-300 dark:text-gray-700">ASCII</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={newType === 'hex'}
                    onChange={() => setNewType('hex')}
                    className="mr-1"
                  />
                  <span className="text-sm text-gray-300 dark:text-gray-700">HEX</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end pt-1">
              <button
                onClick={resetForm}
                className="px-3 py-1.5 bg-gray-600 dark:bg-gray-300 text-white dark:text-gray-700 text-sm rounded mr-2 hover:bg-gray-500 dark:hover:bg-gray-400"
              >
                取消
              </button>
              <button
                onClick={editingId ? handleEditPreset : handleAddPreset}
                disabled={!newContent.trim() || !newName.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Save size={14} className="mr-1" />
                {editingId ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {presets.length === 0 && !isAdding && (
        <div className="text-center py-6 text-gray-400 dark:text-gray-500">
          <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
          <p>暂无预设报文</p>
          <p className="text-sm mt-1">点击上方的 + 按钮添加</p>
        </div>
      )}

      <div className="space-y-2">
        {presets.map((preset) => (
          <div 
            key={preset.id} 
            className="bg-gray-700 dark:bg-white rounded-md p-2.5 flex items-center group"
            draggable={true}
            onDragStart={(e) => handleDragStart(e, preset)}
            onDragEnd={handleDragEnd}
          >
            <div className="cursor-grab text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-800 mr-2 flex-shrink-0" 
              title="拖动到定时发送"
            >
              <DragHandleDots2 size={16} />
            </div>
            <div className="flex-1 min-w-0 mr-2">
              <div className="flex items-center">
                <span className="font-medium text-sm text-white dark:text-gray-900 truncate max-w-[120px]">
                  {preset.name}
                </span>
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-600 dark:bg-gray-200 text-gray-300 dark:text-gray-700 flex-shrink-0">
                  {preset.type.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5 max-w-[180px]">
                {preset.content}
              </p>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => startEditing(preset)}
                className="p-1.5 text-gray-400 hover:text-white dark:hover:text-gray-900 rounded"
                title="编辑"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => handleDeletePreset(preset.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                title="删除"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => handleSendPreset(preset)}
                disabled={!status.connected}
                className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded"
                title="发送"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SerialPresetMessages;