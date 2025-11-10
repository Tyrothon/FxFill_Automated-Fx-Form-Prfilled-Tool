# FX Fill App - 智能外汇单据填写助手

FX Fill App 是一个基于 AI 的 Web 应用，旨在简化和自动化外汇汇款申请流程。用户可以上传发票、合同等包含交易信息的文档，应用将利用 AI 技术智能提取关键信息，并自动填充到标准的汇款申请表中，最后生成可供下载的 PDF 文件。

## ✨ 主要功能

- **📄 智能文档解析**: 上传 PDF、JPG、PNG 等格式的交易文档。
- **🤖 AI 信息提取**: 自动从文档中识别并提取汇款人、收款人、银行账户、金额等关键信息。
- **📝 表单自动填充**: 将提取的信息无缝填充到汇款申请表单中。
- **✏️ 在线编辑与预览**: 支持在提交前对自动填充的信息进行手动修改和确认。
- **📥 PDF 生成与下载**: 一键生成标准格式的汇款申请表 PDF 文件。
- **🔐 用户认证**: 提供用户注册和登录功能，保障操作安全。

## 🛠️ 技术栈

- **前端**: React, React Router, Styled-Components, Axios
- **后端**: Node.js, Express
- **AI 服务**: 通用大语言模型 API (本项目使用 DashScope)
- **PDF 生成**: jsPDF

## 🚀 项目启动指南

请按照以下步骤在本地设置和运行项目。

### 1. 先决条件

- [Node.js](https://nodejs.org/) (建议使用 v16 或更高版本)
- [npm](https://www.npmjs.com/) (通常随 Node.js 一起安装)
- [Git](https://git-scm.com/)

### 2. 克隆仓库

```bash
git clone <your-repository-url>
cd FxFill
```

### 3. 安装依赖

在项目根目录下运行以下命令，安装前端和后端所需的所有依赖项：

```bash
npm install
```

### 4. 配置环境变量

项目需要连接到 AI 服务 API。请在项目根目录创建一个名为 `.env` 的文件，并添加以下内容：

```
# .env

# 替换为你的 DashScope API Key
DASHSCOPE_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

> **重要**: `.env` 文件包含敏感信息，已被添加到 `.gitignore` 中，不会被提交到版本库。

### 5. 运行项目

你需要同时启动前端开发服务器和后端服务器。请打开两个终端窗口：

**终端 1: 启动后端服务器** (运行在 `http://localhost:3001`)

```bash
npm run start:server
```

**终端 2: 启动前端开发服务器** (运行在 `http://localhost:3000` 或其他端口)

```bash
npm start
```

启动成功后，浏览器会自动打开应用页面。

## 📜 可用脚本

在 `package.json` 文件中，你可以找到以下可用脚本：

- `npm start`: 在开发模式下运行前端应用。
- `npm run start:server`: 启动后端 Node.js 服务器。
- `npm run build`: 将应用打包为用于生产环境的静态文件。
- `npm test`: 运行测试。
- `npm eject`: 弹出 Create React App 的配置。

---

感谢使用 FX Fill App！


## 项目简介

FX Fill App 是一个现代化的移动端React应用，专为银行和金融机构设计，用于自动化外汇表格的填写流程。该应用通过扫描合同或发票文档，智能提取关键信息并预填外汇表格，大大提高了工作效率。

## 主要功能

### 🏠 主页 (HomePage)
- 实时外汇汇率显示
- 跨境新闻资讯
- 银行外汇牌价表
- 登录入口

### 🔐 用户认证
- **登录页面 (LoginPage)**: 用户登录界面，支持密码可见性切换
- **注册页面 (RegisterPage)**: 新用户注册，包含完整的个人信息表单

### 👤 个人资料 (ProfilePage)
- 用户个人信息展示
- 账户设置
- 隐私政策访问

### 📄 文档处理流程
1. **文档上传 (UploadPage)**: 
   - 支持发票和合同两种文档类型
   - 拖拽上传功能
   - 文件格式和大小验证

2. **FX表格生成 (FxFormPage)**:
   - 自动生成外汇表格
   - 表格数据预览和编辑
   - 表格确认和导出

3. **风险分析 (RiskAnalysisPage)**:
   - 交易风险评估
   - 合规性检查
   - 风险等级显示

4. **文档下载 (DownloadPage)**:
   - 多种下载选项
   - 邮件发送功能
   - 分享链接生成

## 技术栈

- **前端框架**: React 18.2.0
- **路由管理**: React Router DOM 6.8.0
- **样式方案**: Styled Components 5.3.6
- **图标库**: Lucide React 0.263.1
- **构建工具**: Create React App

## 项目结构

```
FxFill/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── BottomNavigation.js    # 底部导航栏组件
│   ├── pages/
│   │   ├── HomePage.js            # 主页
│   │   ├── LoginPage.js           # 登录页
│   │   ├── RegisterPage.js        # 注册页
│   │   ├── ProfilePage.js         # 个人资料页
│   │   ├── UploadPage.js          # 文档上传页
│   │   ├── FxFormPage.js          # FX表格页
│   │   ├── RiskAnalysisPage.js    # 风险分析页
│   │   └── DownloadPage.js        # 下载页
│   ├── App.js                     # 主应用组件
│   └── index.js                   # 应用入口
├── package.json
└── README.md
```

## 安装和运行

### 前置要求
- Node.js (版本 14 或更高)
- npm 或 yarn

### 安装步骤

1. 克隆项目到本地
```bash
git clone <repository-url>
cd FxFill
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm start
```

4. 在浏览器中访问 `http://localhost:3000`

### 构建生产版本
```bash
npm run build
```

## 页面路由

- `/` - 主页
- `/login` - 登录页
- `/register` - 注册页
- `/profile` - 个人资料页
- `/upload` - 文档上传页
- `/fx-form` - FX表格页
- `/risk-analysis` - 风险分析页
- `/download` - 下载页

## 设计特色

### 🎨 现代化UI设计
- 采用渐变色彩方案
- 响应式移动端设计
- 流畅的动画过渡效果

### 📱 移动端优化
- 底部导航栏设计
- 触摸友好的交互元素
- 适配各种屏幕尺寸

### 🔒 安全性考虑
- 密码可见性切换
- 表单验证
- 安全的文件上传

## 功能亮点

1. **智能文档识别**: 自动识别发票和合同类型
2. **实时汇率显示**: 集成银行外汇牌价
3. **风险评估系统**: 自动进行交易风险分析
4. **多种导出选项**: 支持设备下载、邮件发送、链接分享
5. **用户友好界面**: 直观的操作流程和清晰的视觉反馈

## 开发说明

该应用使用了现代React开发最佳实践：
- 函数式组件和Hooks
- Styled Components进行样式管理
- React Router进行路由管理
- 响应式设计原则

## 许可证

本项目仅供学习和演示使用。

## 联系方式

如有问题或建议，请联系开发团队。