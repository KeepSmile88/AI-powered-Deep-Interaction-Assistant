class AIInteractionBot {
    constructor() {
        this.isActive = false;
        this.currentRounds = 0;
        this.maxRounds = 10;
        this.settings = {};
        this.lastResponse = '';
        this.conversationContext = [];
        this.observer = null;
        
        // 对话记录相关
        this.currentConversation = null;
        this.sessionStartTime = null;
        this.messageCount = 0;
        this.conversationHistory = [];
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.detectPlatform();
        this.setupMessageListener();
        this.setupMutationObserver();
        console.log('AI交互机器人已初始化');
    }

    async loadSettings() {
        const settings = await chrome.storage.sync.get({
            isActive: false,
            interactionMode: 'keywords',
            replyDelay: 3,
            deepExploration: false,
            customKeywords: '详细解释一下,举个具体例子,还有什么相关的,更深入分析,原理是什么',
            explorationDirection: 'deeper',
            contextAware: true,
            maxRounds: 10,
            stopKeywords: '结束,停止,够了,不用继续'
        });
        
        this.settings = settings;
        this.isActive = settings.isActive;
        this.maxRounds = settings.maxRounds;
    }

    detectPlatform() {
        const hostname = window.location.hostname;
        
        if (hostname.includes('openai.com')) {
            this.platform = 'chatgpt';
            this.selectors = {
                messageContainer: '[data-message-author-role="assistant"]',
                inputBox: '#prompt-textarea, textarea[placeholder*="Message"]',
                sendButton: 'button[data-testid="send-button"]',
                messages: '[data-message-author-role]'
            };
        } else if (hostname.includes('microsoft.com')) {
            this.platform = 'copilot';
            this.selectors = {
                messageContainer: '.response-message-group',
                inputBox: '.chat-input textarea',
                sendButton: '.send-button',
                messages: '.message-group'
            };
        } else if (hostname.includes('google.com')) {
            this.platform = 'gemini';
            this.selectors = {
                messageContainer: '[data-test-id="bot-response"]',
                inputBox: '.ql-editor[contenteditable="true"]',
                sendButton: '[data-test-id="send-button"]',
                messages: '[data-test-id]'
            };
        }
        
        console.log(`检测到平台: ${this.platform}`);
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.type) {
                case 'START_INTERACTION':
                    this.startInteraction();
                    break;
                case 'STOP_INTERACTION':
                    this.stopInteraction();
                    break;
                case 'PAUSE_INTERACTION':
                    this.pauseInteraction();
                    break;
                case 'SETTINGS_UPDATED':
                    this.settings = message.settings;
                    break;
                case 'GET_CONVERSATION_STATS':
                    sendResponse(this.getConversationStats());
                    break;
                case 'EXPORT_CURRENT_CONVERSATION':
                    this.exportCurrentConversation(message.format).then(sendResponse);
                    return true; // 异步响应
                case 'GET_CONVERSATION_HISTORY':
                    this.getConversationHistory().then(sendResponse);
                    return true;
            }
            sendResponse({success: true});
        });
    }

    setupMutationObserver() {
        this.observer = new MutationObserver((mutations) => {
            if (!this.isActive) return;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const newNodes = Array.from(mutation.addedNodes);
                    const hasNewResponse = newNodes.some(node => 
                        node.nodeType === Node.ELEMENT_NODE && 
                        this.isAIResponse(node)
                    );
                    
                    if (hasNewResponse) {
                        this.handleNewAIResponse();
                    }
                }
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    isAIResponse(node) {
        const selectors = this.selectors.messageContainer;
        return node.matches && node.matches(selectors) ||
               node.querySelector && node.querySelector(selectors);
    }

    async handleNewAIResponse() {
        if (this.currentRounds >= this.maxRounds) {
            this.stopInteraction();
            return;
        }

        // 等待响应完全加载
        await this.waitForResponseComplete();
        
        const latestResponse = this.getLatestResponse();
        if (latestResponse && latestResponse !== this.lastResponse) {
            this.lastResponse = latestResponse;
            
            // 记录AI响应
            this.recordMessage('ai', latestResponse, false);
            
            this.conversationContext.push({
                type: 'ai_response',
                content: latestResponse,
                timestamp: Date.now()
            });
            
            if (this.shouldContinueInteraction(latestResponse)) {
                await this.generateAndSendFollowUp(latestResponse);
            }
        }
    }

    async waitForResponseComplete() {
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 检查是否还在生成中
            const isGenerating = this.checkIfGenerating();
            if (!isGenerating) break;
            
            attempts++;
        }
    }

    checkIfGenerating() {
        // 根据不同平台检查是否还在生成
        switch (this.platform) {
            case 'chatgpt':
                return document.querySelector('.result-streaming') !== null ||
                       document.querySelector('[data-testid="stop-button"]') !== null;
            case 'copilot':
                return document.querySelector('.typing-indicator') !== null;
            case 'gemini':
                return document.querySelector('.loading-indicator') !== null;
            default:
                return false;
        }
    }

    getLatestResponse() {
        const responseElements = document.querySelectorAll(this.selectors.messageContainer);
        if (responseElements.length === 0) return null;
        
        const latestElement = responseElements[responseElements.length - 1];
        return latestElement.textContent.trim();
    }

    shouldContinueInteraction(response) {
        const stopKeywords = this.settings.stopKeywords.split(',').map(k => k.trim());
        return !stopKeywords.some(keyword => 
            response.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    async generateAndSendFollowUp(response) {
        await new Promise(resolve => 
            setTimeout(resolve, this.settings.replyDelay * 1000)
        );

        let followUpMessage = '';

        switch (this.settings.interactionMode) {
            case 'keywords':
                followUpMessage = this.generateKeywordFollowUp();
                break;
            case 'intelligent':
                followUpMessage = this.generateIntelligentFollowUp(response);
                break;
            case 'mixed':
                followUpMessage = Math.random() > 0.5 ? 
                    this.generateKeywordFollowUp() : 
                    this.generateIntelligentFollowUp(response);
                break;
        }

        if (followUpMessage) {
            this.sendMessage(followUpMessage);
            this.currentRounds++;
            
            // 记录自动生成的用户消息
            this.recordMessage('user', followUpMessage, true);
            
            this.conversationContext.push({
                type: 'user_followup',
                content: followUpMessage,
                timestamp: Date.now()
            });
        }
    }

    generateKeywordFollowUp() {
        const keywords = this.settings.customKeywords.split(',').map(k => k.trim());
        return keywords[Math.floor(Math.random() * keywords.length)];
    }

    generateIntelligentFollowUp(response) {
        const templates = this.getIntelligentTemplates();
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        // 基于上下文和探索方向生成
        if (this.settings.contextAware && this.conversationContext.length > 0) {
            return this.generateContextAwareFollowUp(template, response);
        }
        
        return template;
    }

    getIntelligentTemplates() {
        const templates = {
            deeper: [
                '能否深入解释一下背后的原理？',
                '这个概念的核心机制是什么？',
                '可以分析一下更深层次的原因吗？',
                '从技术角度来看，具体是如何实现的？'
            ],
            broader: [
                '还有哪些相关的应用领域？',
                '这个话题衍生出哪些相关概念？',
                '在其他行业中有类似的情况吗？',
                '可以扩展讨论相关的主题吗？'
            ],
            practical: [
                '在实际应用中如何操作？',
                '有什么具体的使用案例？',
                '如何将这个应用到实际工作中？',
                '实践中需要注意什么问题？'
            ],
            theoretical: [
                '这个理论的基础假设是什么？',
                '背后有什么重要的理论支撑？',
                '从学术角度如何理解这个问题？',
                '相关的理论框架有哪些？'
            ],
            comparative: [
                '与其他方案相比有什么优劣？',
                '可以对比分析不同的方法吗？',
                '这种方式和传统方法有什么区别？',
                '各种选择的利弊权衡如何？'
            ]
        };
        
        return templates[this.settings.explorationDirection] || templates.deeper;
    }

    generateContextAwareFollowUp(template, response) {
        // 简单的上下文感知逻辑
        if (response.includes('例子') || response.includes('案例')) {
            return '能提供更多不同类型的例子吗？';
        }
        if (response.includes('原理') || response.includes('机制')) {
            return '这个原理在其他场景下是否同样适用？';
        }
        if (response.includes('优点') || response.includes('好处')) {
            return '那相对应的缺点或限制有哪些？';
        }
        
        return template;
    }

    sendMessage(message) {
        const inputBox = document.querySelector(this.selectors.inputBox);
        const sendButton = document.querySelector(this.selectors.sendButton);
        
        if (!inputBox || !sendButton) {
            console.error('无法找到输入框或发送按钮');
            return;
        }

        // 根据不同平台处理输入
        if (inputBox.contentEditable === 'true') {
            // 可编辑div (如Gemini)
            inputBox.focus();
            inputBox.textContent = message;
            
            // 触发输入事件
            const inputEvent = new Event('input', {bubbles: true});
            inputBox.dispatchEvent(inputEvent);
        } else {
            // 普通textarea
            inputBox.focus();
            inputBox.value = message;
            
            // 触发输入事件
            const inputEvent = new Event('input', {bubbles: true});
            const changeEvent = new Event('change', {bubbles: true});
            inputBox.dispatchEvent(inputEvent);
            inputBox.dispatchEvent(changeEvent);
        }

        // 等待一小段时间再点击发送
        setTimeout(() => {
            if (sendButton && !sendButton.disabled) {
                sendButton.click();
            }
        }, 100);

        console.log(`发送消息: ${message}`);
    }

    startInteraction() {
        this.isActive = true;
        this.currentRounds = 0;
        this.conversationContext = [];
        this.sessionStartTime = Date.now();
        this.messageCount = 0;
        
        // 初始化新对话记录
        this.initializeConversation();
        
        console.log('开始智能交互');
    }

    stopInteraction() {
        this.isActive = false;
        
        // 结束当前对话记录
        this.finalizeConversation();
        
        console.log('停止智能交互');
    }

    pauseInteraction() {
        this.isActive = false;
        console.log('暂停智能交互');
    }

    // 对话记录管理方法
    initializeConversation() {
        this.currentConversation = {
            id: this.generateConversationId(),
            platform: this.platform,
            startTime: Date.now(),
            endTime: null,
            messages: [],
            interactionMode: this.settings.interactionMode,
            topics: [],
            knowledgePoints: [],
            metadata: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                settings: { ...this.settings }
            }
        };

        // 尝试获取现有对话内容
        this.captureExistingMessages();
    }

    captureExistingMessages() {
        try {
            const existingMessages = this.getExistingConversationMessages();
            existingMessages.forEach(msg => {
                this.currentConversation.messages.push({
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp || Date.now(),
                    isAutoGenerated: false,
                    metadata: msg.metadata || {}
                });
            });
            this.messageCount = this.currentConversation.messages.length;
        } catch (error) {
            console.log('无法获取现有消息:', error);
        }
    }

    getExistingConversationMessages() {
        const messages = [];
        const messageElements = document.querySelectorAll(this.selectors.messages);
        
        messageElements.forEach(element => {
            try {
                const role = this.determineMessageRole(element);
                const content = this.extractMessageContent(element);
                const timestamp = this.extractMessageTimestamp(element);
                
                if (content && content.length > 0) {
                    messages.push({
                        role: role,
                        content: content,
                        timestamp: timestamp,
                        metadata: {
                            elementId: element.id,
                            className: element.className
                        }
                    });
                }
            } catch (error) {
                console.log('提取消息失败:', error);
            }
        });
        
        return messages;
    }

    determineMessageRole(element) {
        // 根据不同平台的特征判断消息角色
        switch (this.platform) {
            case 'chatgpt':
                return element.getAttribute('data-message-author-role') || 
                       (element.textContent.includes('ChatGPT') ? 'assistant' : 'user');
            case 'copilot':
                return element.classList.contains('user-message') ? 'user' : 'assistant';
            case 'gemini':
                return element.getAttribute('data-test-id')?.includes('user') ? 'user' : 'assistant';
            default:
                return 'unknown';
        }
    }

    extractMessageContent(element) {
        // 移除不相关的UI元素
        const clonedElement = element.cloneNode(true);
        
        // 删除按钮、图标等UI元素
        const uiElements = clonedElement.querySelectorAll('button, .icon, .timestamp, .avatar, .copy-button');
        uiElements.forEach(el => el.remove());
        
        return clonedElement.textContent.trim();
    }

    extractMessageTimestamp(element) {
        // 尝试从元素中提取时间戳
        const timeElement = element.querySelector('time, .timestamp, [data-timestamp]');
        if (timeElement) {
            return new Date(timeElement.getAttribute('datetime') || timeElement.textContent).getTime();
        }
        return Date.now();
    }

    recordMessage(role, content, isAutoGenerated = false) {
        if (!this.currentConversation) {
            this.initializeConversation();
        }

        const message = {
            role: role,
            content: content,
            timestamp: Date.now(),
            isAutoGenerated: isAutoGenerated,
            metadata: {
                roundNumber: this.currentRounds,
                interactionMode: this.settings.interactionMode
            }
        };

        this.currentConversation.messages.push(message);
        this.messageCount++;

        // 实时分析和更新话题
        this.analyzeMessageContent(content);
    }

    analyzeMessageContent(content) {
        // 简单的话题提取
        const topics = this.extractTopicsFromContent(content);
        topics.forEach(topic => {
            if (!this.currentConversation.topics.includes(topic)) {
                this.currentConversation.topics.push(topic);
            }
        });

        // 限制话题数量
        if (this.currentConversation.topics.length > 10) {
            this.currentConversation.topics = this.currentConversation.topics.slice(-10);
        }
    }

    extractTopicsFromContent(content) {
        const topics = [];
        // 简单的关键词提取逻辑
        const topicPatterns = [
            /关于([^\s，。！？,.\!?]{2,8})/g,
            /([A-Za-z]{3,}(?:\s+[A-Za-z]{3,})?)/g,
            /([\u4e00-\u9fa5]{2,6})(?:技术|方法|理论|概念|系统|模式)/g
        ];

        topicPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1] && match[1].length > 2) {
                    topics.push(match[1].trim());
                }
            }
        });

        return [...new Set(topics)].slice(0, 3);
    }

    finalizeConversation() {
        if (!this.currentConversation) return;

        this.currentConversation.endTime = Date.now();
        this.currentConversation.duration = this.currentConversation.endTime - this.currentConversation.startTime;
        
        // 生成对话摘要
        this.currentConversation.summary = this.generateConversationSummary();
        
        // 保存到本地存储
        this.saveConversationToHistory();

        // 如果启用了自动导出
        if (this.settings.autoExport) {
            this.autoExportConversation();
        }
    }

    generateConversationSummary() {
        const messages = this.currentConversation.messages;
        const topics = this.currentConversation.topics;
        const duration = Math.round(this.currentConversation.duration / 60000);
        
        let summary = `本次对话包含 ${messages.length} 条消息，持续 ${duration} 分钟`;
        
        if (topics.length > 0) {
            summary += `，主要讨论了${topics.slice(0, 3).join('、')}等话题`;
        }
        
        const userMessages = messages.filter(m => m.role === 'user' && !m.isAutoGenerated).length;
        const autoMessages = messages.filter(m => m.isAutoGenerated).length;
        
        if (autoMessages > 0) {
            summary += `，其中自动生成 ${autoMessages} 个深度探索问题`;
        }
        
        return summary;
    }

    async saveConversationToHistory() {
        try {
            const data = await chrome.storage.local.get(['conversationHistory']);
            const history = data.conversationHistory || [];
            
            // 添加当前对话
            history.push(this.currentConversation);
            
            // 保持最近50次对话
            if (history.length > 50) {
                history.splice(0, history.length - 50);
            }
            
            await chrome.storage.local.set({ conversationHistory: history });
            console.log('对话已保存到历史记录');
        } catch (error) {
            console.error('保存对话历史失败:', error);
        }
    }

    generateConversationId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getConversationStats() {
        return {
            messageCount: this.messageCount,
            sessionDuration: this.sessionStartTime ? Date.now() - this.sessionStartTime : 0,
            currentRounds: this.currentRounds,
            maxRounds: this.maxRounds,
            isActive: this.isActive
        };
    }

    async exportCurrentConversation(format) {
        if (!this.currentConversation || this.currentConversation.messages.length === 0) {
            return {
                success: false,
                error: '当前没有对话内容可导出'
            };
        }

        try {
            // 确保当前对话是最新的
            this.captureExistingMessages();
            
            const content = this.formatConversation(this.currentConversation, format);
            const filename = this.generateFilename(`conversation-${this.currentConversation.id}`, format);
            
            return {
                success: true,
                content: content,
                filename: filename,
                mimeType: this.getMimeType(format)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    formatConversation(conversation, format) {
        switch (format) {
            case 'markdown':
                return this.formatConversationMarkdown(conversation);
            case 'html':
                return this.formatConversationHTML(conversation);
            case 'json':
                return JSON.stringify(conversation, null, 2);
            case 'txt':
            default:
                return this.formatConversationText(conversation);
        }
    }

    formatConversationMarkdown(conversation) {
        let md = `# AI智能交互对话\n\n`;
        md += `**平台**: ${conversation.platform}\n`;
        md += `**开始时间**: ${new Date(conversation.startTime).toLocaleString()}\n`;
        md += `**结束时间**: ${conversation.endTime ? new Date(conversation.endTime).toLocaleString() : '进行中'}\n`;
        md += `**消息数量**: ${conversation.messages.length}\n`;
        md += `**交互模式**: ${conversation.interactionMode}\n\n`;

        if (conversation.topics.length > 0) {
            md += `**主要话题**: ${conversation.topics.join(', ')}\n\n`;
        }

        if (conversation.summary) {
            md += `**对话摘要**: ${conversation.summary}\n\n`;
        }

        md += `## 对话内容\n\n`;

        conversation.messages.forEach((message, index) => {
            const time = new Date(message.timestamp).toLocaleTimeString();
            const role = message.role === 'user' ? '👤 用户' : '🤖 AI助手';
            const auto = message.isAutoGenerated ? ' *(自动生成)*' : '';
            
            md += `### ${role}${auto} - ${time}\n\n`;
            md += `${message.content}\n\n`;
        });

        return md;
    }

    formatConversationHTML(conversation) {
        let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>AI对话记录 - ${new Date(conversation.startTime).toLocaleDateString()}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .message { margin: 15px 0; padding: 15px; border-radius: 8px; }
        .user { background: #e3f2fd; border-left: 4px solid #2196f3; }
        .assistant { background: #f3e5f5; border-left: 4px solid #9c27b0; }
        .auto { opacity: 0.8; font-style: italic; }
        .timestamp { font-size: 0.9em; color: #666; margin-bottom: 8px; }
        .topics { margin: 10px 0; }
        .topic { background: #e9ecef; padding: 2px 6px; border-radius: 12px; font-size: 0.8em; margin: 0 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 AI智能交互对话记录</h1>
        <p><strong>平台</strong>: ${conversation.platform}</p>
        <p><strong>时间</strong>: ${new Date(conversation.startTime).toLocaleString()}</p>
        <p><strong>消息数</strong>: ${conversation.messages.length}</p>`;

        if (conversation.topics.length > 0) {
            html += `<div class="topics"><strong>话题</strong>: `;
            conversation.topics.forEach(topic => {
                html += `<span class="topic">${topic}</span>`;
            });
            html += `</div>`;
        }

        html += `</div>`;

        conversation.messages.forEach(message => {
            const role = message.role === 'user' ? 'user' : 'assistant';
            const autoClass = message.isAutoGenerated ? ' auto' : '';
            const roleText = message.role === 'user' ? '👤 用户' : '🤖 AI助手';
            const autoText = message.isAutoGenerated ? ' (自动生成)' : '';
            
            html += `<div class="message ${role}${autoClass}">
                <div class="timestamp">${roleText}${autoText} - ${new Date(message.timestamp).toLocaleTimeString()}</div>
                <div>${message.content.replace(/\n/g, '<br>')}</div>
            </div>`;
        });

        html += `</body></html>`;
        return html;
    }

    formatConversationText(conversation) {
        let text = `AI智能交互对话记录\n`;
        text += `${'='.repeat(40)}\n`;
        text += `平台: ${conversation.platform}\n`;
        text += `时间: ${new Date(conversation.startTime).toLocaleString()}\n`;
        text += `消息数: ${conversation.messages.length}\n\n`;

        conversation.messages.forEach(message => {
            const role = message.role === 'user' ? '用户' : 'AI助手';
            const auto = message.isAutoGenerated ? ' (自动)' : '';
            const time = new Date(message.timestamp).toLocaleTimeString();
            
            text += `[${time}] ${role}${auto}:\n`;
            text += `${message.content}\n\n`;
        });

        return text;
    }

    generateFilename(prefix, format) {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
        return `${prefix}_${date}_${time}.${format === 'markdown' ? 'md' : format}`;
    }

    getMimeType(format) {
        const mimeTypes = {
            'markdown': 'text/markdown',
            'html': 'text/html',
            'txt': 'text/plain',
            'json': 'application/json'
        };
        return mimeTypes[format] || 'text/plain';
    }

    async autoExportConversation() {
        if (!this.currentConversation) return;
        
        try {
            const format = this.settings.exportFormat || 'markdown';
            const content = this.formatConversation(this.currentConversation, format);
            const filename = this.generateFilename(`auto-export-${this.currentConversation.id}`, format);
            
            // 通过消息传递触发下载
            window.postMessage({
                type: 'AUTO_EXPORT_CONVERSATION',
                data: {
                    filename: filename,
                    content: content,
                    mimeType: this.getMimeType(format)
                }
            }, '*');
        } catch (error) {
            console.error('自动导出失败:', error);
        }
    }

    async getConversationHistory() {
        try {
            const data = await chrome.storage.local.get(['conversationHistory']);
            return {
                success: true,
                conversations: data.conversationHistory || []
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// 初始化机器人
const bot = new AIInteractionBot();