# 插件图标和样式文件

## 📁 图标文件结构

需要在插件根目录创建 `icons` 文件夹，并添加以下图标文件：

```
icons/
├── icon-16.png          # 工具栏小图标
├── icon-32.png          # 中等尺寸图标  
├── icon-48.png          # 扩展管理页面图标
├── icon-128.png         # 商店展示图标
├── icon-active-16.png   # 激活状态小图标
├── icon-active-32.png   # 激活状态中图标
├── icon-active-48.png   # 激活状态大图标
└── icon-active-128.png  # 激活状态超大图标
```

## 🎨 图标设计建议

### 基础图标 (未激活状态)
- **颜色**: 灰色调 (#6c757d)
- **设计**: 简洁的AI/机器人图标
- **风格**: 线条图标，现代简约

### 激活状态图标  
- **颜色**: 蓝色调 (#007bff)
- **设计**: 相同图标但颜色更鲜明
- **效果**: 可添加微光或动态效果

### SVG图标代码示例

```svg
<!-- 基础机器人图标 -->
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="45" r="25" fill="#6c757d" stroke="#fff" stroke-width="3"/>
  <rect x="35" y="65" width="58" height="40" rx="8" fill="#6c757d" stroke="#fff" stroke-width="3"/>
  <circle cx="50" cy="55" r="3" fill="#fff"/>
  <circle cx="78" cy="55" r="3" fill="#fff"/>
  <rect x="55" y="75" width="18" height="3" fill="#fff" rx="1"/>
  <rect x="55" y="85" width="25" height="3" fill="#fff" rx="1"/>
  <rect x="55" y="95" width="20" height="3" fill="#fff" rx="1"/>
</svg>
```

## 🛠️ 创建图标文件

### 方法一：在线图标生成器
推荐使用以下工具生成图标：
- [Favicon Generator](https://favicon.io/)  
- [Icon Generator](https://icon-generator.net/)
- [Real Favicon Generator](https://realfavicongenerator.net/)

### 方法二：设计软件制作
- **Adobe Illustrator**: 矢量设计，导出PNG
- **Figma**: 在线设计工具
- **Canva**: 简单易用的在线设计

### 方法三：使用Emoji
临时方案可以用emoji转换为图标：
- 🤖 (机器人)
- 🧠 (大脑) 
- 💬 (对话)
- ⚡ (闪电，表示智能)

## 📏 图标尺寸规范

| 文件名 | 尺寸 | 用途 | 格式要求 |
|--------|------|------|----------|
| icon-16.png | 16×16px | 浏览器工具栏 | PNG, 透明背景 |
| icon-32.png | 32×32px | 扩展列表 | PNG, 透明背景 |
| icon-48.png | 48×48px | 扩展管理页面 | PNG, 透明背景 |
| icon-128.png | 128×128px | Chrome商店 | PNG, 透明背景 |

## 🎨 附加样式文件

### popup.css (可选的独立样式文件)

```css
/* 现代化弹窗样式 */
:root {
  --primary-color: #007bff;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --border-radius: 8px;
  --box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

body {
  margin: 0;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  min-height: 500px;
}

.container {
  background: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--box-shadow);
  max-width: 400px;
}

.header {
  text-align: center;
  margin-bottom: 25px;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 15px;
}

.header h2 {
  margin: 0;
  color: var(--primary-color);
  font-size: 20px;
  font-weight: 600;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin: 10px 0;
}

.status-indicator.active {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-indicator.inactive {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-indicator::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.section-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: var(--border-radius);
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.section-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0,123,255,0.15);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--dark-color);
}

.form-group {
  margin-bottom: 12px;
}

.form-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-control.textarea {
  min-height: 60px;
  resize: vertical;
  font-family: inherit;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
}

.checkbox-wrapper label {
  margin: 0;
  font-size: 13px;
  color: var(--dark-color);
  cursor: pointer;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  width: 100%;
  margin: 4px 0;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,123,255,0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.keyword-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.keyword-tag:hover {
  background: var(--primary-color);
  color: white;
}

.progress-indicator {
  width: 100%;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin: 8px 0;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--info-color));
  width: 0%;
  transition: width 0.3s ease;
}

.animation-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.tooltip {
  position: relative;
  cursor: help;
}

.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--dark-color);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 1000;
}

.tooltip:hover::after {
  opacity: 1;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  body {
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  }
  
  .container {
    background: #2c3e50;
    color: #ecf0f1;
  }
  
  .section-card {
    background: #34495e;
    border-color: #4a5568;
  }
  
  .form-control {
    background: #4a5568;
    border-color: #6c757d;
    color: #ecf0f1;
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  body {
    padding: 10px;
  }
  
  .container {
    padding: 15px;
  }
  
  .header h2 {
    font-size: 18px;
  }
}
```

## 🚀 快速开始脚本

创建 `setup.js` 帮助快速设置：

```javascript
// 快速设置脚本
const fs = require('fs');
const path = require('path');

// 创建基础图标 (使用Canvas生成简单图标)
function createBasicIcons() {
  const sizes = [16, 32, 48, 128];
  const colors = {
    inactive: '#6c757d',
    active: '#007bff'
  };
  
  console.log('正在生成基础图标文件...');
  console.log('请手动替换为设计好的图标文件');
  
  // 创建icons目录
  if (!fs.existsSync('icons')) {
    fs.mkdirSync('icons');
  }
  
  // 生成提示文件
  const iconNote = `
请在此目录放置以下图标文件：

基础图标 (灰色, 未激活状态):
- icon-16.png (16×16px)
- icon-32.png (32×32px)  
- icon-48.png (48×48px)
- icon-128.png (128×128px)

激活状态图标 (蓝色):
- icon-active-16.png (16×16px)
- icon-active-32.png (32×32px)
- icon-active-48.png (48×48px)  
- icon-active-128.png (128×128px)

建议使用机器人、AI或对话相关的图标设计。
`;
  
  fs.writeFileSync('icons/README.txt', iconNote);
  console.log('✅ 图标目录和说明文件已创建');
}

// 验证插件文件完整性
function validatePlugin() {
  const requiredFiles = [
    'manifest.json',
    'popup.html', 
    'popup.js',
    'content.js',
    'background.js',
    'injected.js'
  ];
  
  const missing = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missing.length > 0) {
    console.error('❌ 缺少以下文件:', missing.join(', '));
    return false;
  }
  
  console.log('✅ 所有必需文件都存在');
  return true;
}

// 主函数
function main() {
  console.log('🚀 AI智能交互插件设置向导');
  console.log('================================');
  
  if (validatePlugin()) {
    createBasicIcons();
    console.log('\n🎉 插件设置完成!');
    console.log('\n📖 下一步:');
    console.log('1. 为icons目录添加图标文件');
    console.log('2. 打开Chrome扩展管理页面 (chrome://extensions/)');
    console.log('3. 启用开发者模式');  
    console.log('4. 点击"加载已解压的扩展程序"');
    console.log('5. 选择插件目录');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { createBasicIcons, validatePlugin };
```

## 📦 完整的文件清单

确保您的插件目录包含以下所有文件：

```
ai-interaction-plugin/
├── manifest.json              # ✅ 插件配置文件
├── popup.html                 # ✅ 弹窗界面
├── popup.js                   # ✅ 弹窗逻辑
├── content.js                 # ✅ 内容脚本  
├── background.js              # ✅ 后台服务
├── injected.js                # ✅ 页面注入脚本
├── README.md                  # ✅ 说明文档
├── setup.js                   # 🔄 可选设置脚本
├── icons/                     # 📁 图标目录
│   ├── icon-16.png           # ❗ 需要添加
│   ├── icon-32.png           # ❗ 需要添加
│   ├── icon-48.png           # ❗ 需要添加
│   ├── icon-128.png          # ❗ 需要添加
│   ├── icon-active-16.png    # ❗ 需要添加
│   ├── icon-active-32.png    # ❗ 需要添加
│   ├── icon-active-48.png    # ❗ 需要添加
│   ├── icon-active-128.png   # ❗ 需要添加
│   └── README.txt            # 📝 图标说明
└── _locales/                  # 📁 可选本地化目录
    └── en/
        └── messages.json      # 🌐 英文消息文件
```

现在您的Chrome插件就完整了！只需要添加图标文件即可开始使用。