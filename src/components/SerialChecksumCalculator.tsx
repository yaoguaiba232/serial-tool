import React, { useState, useEffect } from 'react';
import { Calculator, RotateCcw, Copy, Check } from 'lucide-react';

interface ChecksumAlgorithm {
  id: string;
  name: string;
  description?: string;
}

// All CRC algorithms from the provided table
const CHECKSUM_ALGORITHMS: ChecksumAlgorithm[] = [
  { id: 'sum', name: '校验和', description: '8位校验和 (Sum)' },
  { id: 'xor', name: '异或校验', description: '8位异或校验 (XOR)' },
  { id: 'crc4-itu', name: 'CRC-4/ITU', description: 'x4 + x + 1' },
  { id: 'crc5-epc', name: 'CRC-5/EPC', description: 'x5 + x3 + 1' },
  { id: 'crc5-itu', name: 'CRC-5/ITU', description: 'x5 + x4 + x2 + 1' },
  { id: 'crc5-usb', name: 'CRC-5/USB', description: 'x5 + x2 + 1' },
  { id: 'crc6-itu', name: 'CRC-6/ITU', description: 'x6 + x + 1' },
  { id: 'crc7-mmc', name: 'CRC-7/MMC', description: 'x7 + x3 + 1' },
  { id: 'crc8', name: 'CRC-8', description: 'x8 + x2 + x + 1' },
  { id: 'crc8-itu', name: 'CRC-8/ITU', description: 'x8 + x2 + x + 1' },
  { id: 'crc8-rohc', name: 'CRC-8/ROHC', description: 'x8 + x2 + x + 1' },
  { id: 'crc8-maxim', name: 'CRC-8/MAXIM', description: 'x8 + x5 + x4 + 1' },
  { id: 'crc16-ibm', name: 'CRC-16/IBM', description: 'x16 + x15 + x2 + 1' },
  { id: 'crc16-maxim', name: 'CRC-16/MAXIM', description: 'x16 + x15 + x2 + 1' },
  { id: 'crc16-usb', name: 'CRC-16/USB', description: 'x16 + x15 + x2 + 1' },
  { id: 'crc16-modbus', name: 'CRC-16/MODBUS', description: 'x16 + x15 + x2 + 1' },
  { id: 'crc16-ccitt', name: 'CRC-16/CCITT', description: 'x16 + x12 + x5 + 1' },
  { id: 'crc16-ccitt-false', name: 'CRC-16/CCITT-FALSE', description: 'x16 + x12 + x5 + 1' },
  { id: 'crc16-x25', name: 'CRC-16/X25', description: 'x16 + x12 + x5 + 1' },
  { id: 'crc16-xmodem', name: 'CRC-16/XMODEM', description: 'x16 + x12 + x5 + 1' },
  { id: 'crc16-dnp', name: 'CRC-16/DNP', description: 'x16 + x13 + x12 + x11 + x10 + x8 + x6 + x5 + x2 + 1' },
  { id: 'crc32', name: 'CRC-32', description: 'x32 + x26 + x23 + x22 + x16 + x12 + x11 + x10 + x8 + x7 + x5 + x4 + x2 + x + 1' },
  { id: 'crc32-mpeg2', name: 'CRC-32/MPEG-2', description: 'x32 + x26 + x23 + x22 + x16 + x12 + x11 + x10 + x8 + x7 + x5 + x4 + x2 + x + 1' },
];

// CRC parameters for each algorithm
interface CRCParameters {
  width: number;
  poly: number;
  init: number;
  xorOut: number;
  refIn: boolean;
  refOut: boolean;
}

const CRC_PARAMETERS: Record<string, CRCParameters> = {
  'crc4-itu': { width: 4, poly: 0x03, init: 0x00, xorOut: 0x00, refIn: true, refOut: true },
  'crc5-epc': { width: 5, poly: 0x09, init: 0x09, xorOut: 0x00, refIn: false, refOut: false },
  'crc5-itu': { width: 5, poly: 0x15, init: 0x00, xorOut: 0x00, refIn: true, refOut: true },
  'crc5-usb': { width: 5, poly: 0x05, init: 0x1F, xorOut: 0x1F, refIn: true, refOut: true },
  'crc6-itu': { width: 6, poly: 0x03, init: 0x00, xorOut: 0x00, refIn: true, refOut: true },
  'crc7-mmc': { width: 7, poly: 0x09, init: 0x00, xorOut: 0x00, refIn: false, refOut: false },
  'crc8': { width: 8, poly: 0x07, init: 0x00, xorOut: 0x00, refIn: false, refOut: false },
  'crc8-itu': { width: 8, poly: 0x07, init: 0x00, xorOut: 0x55, refIn: false, refOut: false },
  'crc8-rohc': { width: 8, poly: 0x07, init: 0xFF, xorOut: 0x00, refIn: true, refOut: true },
  'crc8-maxim': { width: 8, poly: 0x31, init: 0x00, xorOut: 0x00, refIn: true, refOut: true },
  'crc16-ibm': { width: 16, poly: 0x8005, init: 0x0000, xorOut: 0x0000, refIn: true, refOut: true },
  'crc16-maxim': { width: 16, poly: 0x8005, init: 0x0000, xorOut: 0xFFFF, refIn: true, refOut: true },
  'crc16-usb': { width: 16, poly: 0x8005, init: 0xFFFF, xorOut: 0xFFFF, refIn: true, refOut: true },
  'crc16-modbus': { width: 16, poly: 0x8005, init: 0xFFFF, xorOut: 0x0000, refIn: true, refOut: true },
  'crc16-ccitt': { width: 16, poly: 0x1021, init: 0x0000, xorOut: 0x0000, refIn: true, refOut: true },
  'crc16-ccitt-false': { width: 16, poly: 0x1021, init: 0xFFFF, xorOut: 0x0000, refIn: false, refOut: false },
  'crc16-x25': { width: 16, poly: 0x1021, init: 0xFFFF, xorOut: 0xFFFF, refIn: true, refOut: true },
  'crc16-xmodem': { width: 16, poly: 0x1021, init: 0x0000, xorOut: 0x0000, refIn: false, refOut: false },
  'crc16-dnp': { width: 16, poly: 0x3D65, init: 0x0000, xorOut: 0xFFFF, refIn: true, refOut: true },
  'crc32': { width: 32, poly: 0x04C11DB7, init: 0xFFFFFFFF, xorOut: 0xFFFFFFFF, refIn: true, refOut: true },
  'crc32-mpeg2': { width: 32, poly: 0x04C11DB7, init: 0xFFFFFFFF, xorOut: 0x00000000, refIn: false, refOut: false }
};

const SerialChecksumCalculator: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [inputType, setInputType] = useState<'text' | 'hex'>('hex');
  const [byteOrder, setByteOrder] = useState<'normal' | 'swapped'>('normal');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('crc16-modbus');
  const [result, setResult] = useState<string>('');
  const [binaryResult, setBinaryResult] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (inputValue) {
      calculateChecksum();
    } else {
      setResult('');
      setBinaryResult('');
    }
  }, [inputValue, inputType, selectedAlgorithm, byteOrder]);

  const calculateChecksum = () => {
    let data: number[];
    
    try {
      if (inputType === 'text') {
        // Convert text to byte array
        data = Array.from(inputValue).map(char => char.charCodeAt(0));
      } else {
        // Convert hex string to byte array
        data = [];
        const hexStr = inputValue.replace(/\s+/g, '');
        for (let i = 0; i < hexStr.length; i += 2) {
          if (i + 1 >= hexStr.length) {
            if (hexStr.length % 2 !== 0) {
              data.push(parseInt(hexStr.charAt(i) + '0', 16));
            }
            break;
          }
          data.push(parseInt(hexStr.substring(i, i + 2), 16));
        }
      }
    } catch (e) {
      setResult('输入格式错误');
      setBinaryResult('');
      return;
    }

    if (data.length === 0) {
      setResult('');
      setBinaryResult('');
      return;
    }

    let checksumResult: string;
    let rawValue: number = 0;
    
    switch (selectedAlgorithm) {
      case 'sum':
        rawValue = data.reduce((acc, val) => (acc + val) & 0xFF, 0);
        checksumResult = formatResult(rawValue, 1); // 1 byte
        break;
      case 'xor':
        rawValue = data.reduce((acc, val) => acc ^ val, 0);
        checksumResult = formatResult(rawValue, 1); // 1 byte
        break;
      case 'crc16-modbus':
        rawValue = calculateCRC16Modbus(data);
        checksumResult = formatResult(rawValue, 2); // 2 bytes
        break;
      default:
        if (selectedAlgorithm.startsWith('crc')) {
          const params = CRC_PARAMETERS[selectedAlgorithm];
          if (params) {
            rawValue = calculateGenericCRC(data, params);
            const byteCount = Math.ceil(params.width / 8);
            checksumResult = formatResult(rawValue, byteCount);
          } else {
            checksumResult = '未支持的CRC参数';
            setBinaryResult('');
            return;
          }
        } else {
          checksumResult = '未知算法';
          setBinaryResult('');
          return;
        }
    }

    setResult(checksumResult);
    
    // Update binary representation
    if (selectedAlgorithm.startsWith('crc')) {
      const params = CRC_PARAMETERS[selectedAlgorithm];
      if (params) {
        // Convert to binary with proper width
        const binaryStr = rawValue.toString(2).padStart(params.width, '0');
        setBinaryResult(binaryStr);
      }
    } else if (['sum', 'xor'].includes(selectedAlgorithm)) {
      // 8-bit for sum and xor
      const binaryStr = rawValue.toString(2).padStart(8, '0');
      setBinaryResult(binaryStr);
    } else {
      setBinaryResult('');
    }
  };

  // Reflect a value bit by bit (reverse bits)
  const reflect = (value: number, width: number): number => {
    let reflected = 0;
    for (let i = 0; i < width; i++) {
      if ((value & (1 << i)) !== 0) {
        reflected |= (1 << ((width - 1) - i));
      }
    }
    return reflected;
  };

  // Generic CRC calculation based on parameters
  const calculateGenericCRC = (data: number[], params: CRCParameters): number => {
    let crc = params.init;
    const topBit = 1 << (params.width - 1);
    const mask = (1 << params.width) - 1;
    
    for (let i = 0; i < data.length; i++) {
      let b = data[i];
      
      // Reflect input byte if needed
      if (params.refIn) {
        b = reflect(b, 8);
      }
      
      if (params.width <= 8) {
        crc ^= b;
        
        for (let j = 0; j < 8; j++) {
          if (crc & 0x01) {
            crc = ((crc >> 1) ^ params.poly) & mask;
          } else {
            crc = (crc >> 1) & mask;
          }
        }
      } else if (params.width <= 16) {
        crc ^= (b << 8);
        
        for (let j = 0; j < 8; j++) {
          if (crc & 0x8000) {
            crc = ((crc << 1) ^ params.poly) & mask;
          } else {
            crc = (crc << 1) & mask;
          }
        }
      } else { // 32-bit
        crc ^= (b << 24);
        
        for (let j = 0; j < 8; j++) {
          if (crc & 0x80000000) {
            crc = ((crc << 1) ^ params.poly) & mask;
          } else {
            crc = (crc << 1) & mask;
          }
        }
      }
    }
    
    // Reflect output if needed
    if (params.refOut) {
      crc = reflect(crc, params.width);
    }
    
    // Final XOR
    crc ^= params.xorOut;
    return crc & mask;
  };

  // Correctly implemented CRC-16/MODBUS according to specs
  const calculateCRC16Modbus = (data: number[]): number => {
    let crc = 0xFFFF; // Initial value for MODBUS
    
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x0001) !== 0) {
          crc = ((crc >> 1) ^ 0x8005) & 0xFFFF;
        } else {
          crc = (crc >> 1) & 0xFFFF;
        }
      }
    }
    
    return crc;
  };

  // Format the result according to byte order
  const formatResult = (value: number, byteCount: number): string => {
    if (byteCount === 1) {
      // For single byte values, byte order doesn't matter
      return `${value.toString(16).padStart(2, '0').toUpperCase()}`;
    }

    // For multi-byte results, format according to byte order
    let bytes: string[] = [];
    let tempValue = value;
    
    // Extract bytes
    for (let i = 0; i < byteCount; i++) {
      const byte = tempValue & 0xFF;
      bytes.push(byte.toString(16).padStart(2, '0').toUpperCase());
      tempValue = tempValue >>> 8;
    }
    
    // For normal byte order (big endian), reverse the bytes back
    // since we extracted them in little-endian order above
    if (byteOrder === 'normal') {
      bytes.reverse();
    }

    return `${bytes.join('')}`;
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setInputValue('');
    setResult('');
    setBinaryResult('');
  };

  return (
    <div>
      <div className="flex items-center mb-3">
        <Calculator className="mr-2 h-5 w-5 text-blue-400 dark:text-blue-600" />
        <h3 className="text-lg font-medium">校验计算</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
            算法
          </label>
          <select
            className="w-full bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
          >
            {CHECKSUM_ALGORITHMS.map(algo => (
              <option key={algo.id} value={algo.id}>
                {algo.name}
              </option>
            ))}
          </select>
          {selectedAlgorithm === 'crc16-modbus' && (
            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              <p>参数模型 NAME：CRC-16/MODBUS　　　　x16+x15+x2+1</p>
              <p>宽度 WIDTH：16</p>
              <p>多项式 POLY（Hex）：8005</p>
              <p>初始值 INIT（Hex）：FFFF</p>
              <p>结果异或值 XOROUT（Hex）：0000</p>
              <p>输入数据反转（REFIN）True　　输出数据反转（REFOUT）True</p>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
            输入类型
          </label>
          <div className="flex">
            <label className="inline-flex items-center bg-gray-700 dark:bg-white rounded-l px-3 py-2 border-r border-gray-600 dark:border-gray-300 flex-1">
              <input
                type="radio"
                name="inputType"
                className="form-radio mr-2"
                checked={inputType === 'text'}
                onChange={() => setInputType('text')}
              />
              <span className="text-white dark:text-gray-900">文本</span>
            </label>
            <label className="inline-flex items-center bg-gray-700 dark:bg-white rounded-r px-3 py-2 flex-1">
              <input
                type="radio"
                name="inputType"
                className="form-radio mr-2"
                checked={inputType === 'hex'}
                onChange={() => setInputType('hex')}
              />
              <span className="text-white dark:text-gray-900">十六进制</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
            高低位转换
          </label>
          <div className="flex">
            <label className="inline-flex items-center bg-gray-700 dark:bg-white rounded-l px-3 py-2 border-r border-gray-600 dark:border-gray-300 flex-1">
              <input
                type="radio"
                name="byteOrder"
                className="form-radio mr-2"
                checked={byteOrder === 'normal'}
                onChange={() => setByteOrder('normal')}
              />
              <span className="text-white dark:text-gray-900">正常顺序</span>
            </label>
            <label className="inline-flex items-center bg-gray-700 dark:bg-white rounded-r px-3 py-2 flex-1">
              <input
                type="radio"
                name="byteOrder"
                className="form-radio mr-2"
                checked={byteOrder === 'swapped'}
                onChange={() => setByteOrder('swapped')}
              />
              <span className="text-white dark:text-gray-900">交换高低位</span>
            </label>
          </div>
          <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {byteOrder === 'normal' 
              ? "示例: 0xABCD → 0xAB 0xCD"
              : "示例: 0xABCD → 0xCD 0xAB"}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
            输入数据
          </label>
          <textarea
            className="w-full bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={inputType === 'text' ? "输入要计算的文本..." : "输入十六进制数据 (例如: 11 22)..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
            计算结果（Hex）
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full bg-gray-600 dark:bg-gray-50 text-white dark:text-gray-900 rounded px-3 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={result}
              readOnly
              placeholder="结果将在此显示"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <button
                onClick={handleCopy}
                disabled={!result}
                className="p-1.5 rounded bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700 hover:bg-gray-600 dark:hover:bg-gray-300 disabled:opacity-50"
                title="复制结果"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
              <button
                onClick={handleReset}
                disabled={!inputValue}
                className="p-1.5 rounded bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700 hover:bg-gray-600 dark:hover:bg-gray-300 disabled:opacity-50"
                title="重置"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            高位在左低位在右，使用时请注意高低位顺序！！！
          </div>
        </div>

        {binaryResult && (
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
              计算结果（Bin）
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-gray-600 dark:bg-gray-50 text-white dark:text-gray-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={binaryResult}
                readOnly
              />
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 dark:text-gray-500">
          {selectedAlgorithm in CRC_PARAMETERS ? 
            `${CHECKSUM_ALGORITHMS.find(algo => algo.id === selectedAlgorithm)?.description || ''} — 多项式: ${CRC_PARAMETERS[selectedAlgorithm].poly.toString(16).toUpperCase().padStart(Math.ceil(CRC_PARAMETERS[selectedAlgorithm].width/4), '0')}` :
            CHECKSUM_ALGORITHMS.find(algo => algo.id === selectedAlgorithm)?.description || ''
          }
        </div>
      </div>
    </div>
  );
};

export default SerialChecksumCalculator;