# 串口调试工具

一个基于 Electron + React + Vite 构建的现代化串口调试工具，提供直观的用户界面和强大的功能。

![预览图片](./screenshots/preview.png)

## ✨ 功能特点

- 🌈 现代化的用户界面，支持亮色/暗色主题
- 📊 实时数据显示和监控
- 🔌 支持多种串口配置
  - 波特率自定义
  - 数据位选择
  - 停止位设置
  - 校验方式选择
- 📝 数据收发功能
  - 支持 ASCII/HEX 格式
  - 自动换行选项
  - 数据记录和导出
- 🎯 便捷的窗口控制
  - 窗口拖拽
  - 最大化/最小化
  - 窗口置顶
- 💡 智能布局
  - 可调整面板大小
  - 左右布局切换
  - 布局状态保存

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装

```bash
# 克隆项目
git clone https://github.com/yaoguaiba232/serial-tool.git

# 进入项目目录
cd serial-tool

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run electron:dev
```

### 构建

```bash
# 构建应用
npm run electron:build
```

构建后的应用将在 `release` 目录中生成。

## 🛠 技术栈

- Electron - 跨平台桌面应用框架
- React - 用户界面库
- Vite - 构建工具
- TailwindCSS - 样式框架
- TypeScript - 类型安全
- SerialPort - 串口通信库

## 📝 配置说明

### 串口设置

- **波特率**: 支持常用波特率选择和自定义输入
- **数据位**: 5/6/7/8
- **停止位**: 1/1.5/2
- **校验方式**: None/Even/Odd/Mark/Space

### 数据收发

- **发送格式**: ASCII/HEX
- **接收格式**: ASCII/HEX
- **自动换行**: 可选择是否在发送数据后自动添加换行符
- **数据记录**: 支持将接收到的数据保存到文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT](./LICENSE) 