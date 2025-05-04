export const formatTimestamp = (date: Date, format: '12' | '24' = '24'): string => {
  return date.toLocaleTimeString('zh-CN', {
    hour12: format === '12'
  });
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};