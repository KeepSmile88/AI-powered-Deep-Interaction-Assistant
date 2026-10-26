class BackgroundService {
    constructor() {
        this.init();
    }

    init() {
        // 监听插件安装
        chrome.runtime.onInstalled.addListener(() => {
            console.log('AI智能交互助手已安装');
            this.setDefaultSettings();
        });

        // 监听标签页更新
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                this.checkTabCompatibility(tab);
            }
        });

        // 监听来自content script的消息
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
        });
    }

    async setDefaultSettings() {
        const defaultSettings = {
            isActive: false,
            interactionMode: 'keywords',
            replyDelay: 3,
            deepExploration: false,
            customKeywords: '详细解释一下,举个具体例子,还有什么相关的,更深入分析,原理是什么',
            explorationDirection: 'deeper',
            contextAware: true,
            maxRounds: 10,
            stopKeywords: '结束,停止,够了,不用继续'
        };

        // 只设置不存在的设置项
        const existingSettings = await chrome.storage.sync.get(Object.keys(defaultSettings));
        const newSettings = {};
        
        for (const [key, value] of Object.entries(defaultSettings)) {
            if (!(key in existingSettings)) {
                newSettings[key] = value;
            }
        }

        if (Object.keys(newSettings).length > 0) {
            await chrome.storage.sync.set(newSettings);
            console.log('默认设置已初始化', newSettings);
        }
    }

    checkTabCompatibility(tab) {
        const supportedSites = [
            'chat.openai.com',
            'copilot.microsoft.com', 
            'gemini.google.com',
            'bard.google.com'
        ];

        const isSupported = supportedSites.some(site => 
            tab.url && tab.url.includes(site)
        );

        if (isSupported) {
            // 更新图标状态
            chrome.action.setIcon({
                tabId: tab.id,
                path: {
                    "16": "icons/icon-active-16.png",
                    "32": "icons/icon-active-32.png",
                    "48": "icons/icon-active-48.png",
                    "128": "icons/icon-active-128.png"
                }
            });
            
            chrome.action.setTitle({
                tabId: tab.id,
                title: 'AI智能交互助手 - 可用'
            });
        } else {
            chrome.action.setIcon({
                tabId: tab.id,
                path: {
                    "16": "icons/icon-inactive-16.png",
                    "32": "icons/icon-inactive-32.png", 
                    "48": "icons/icon-inactive-48.png",
                    "128": "icons/icon-inactive-128.png"
                }
            });
            
            chrome.action.setTitle({
                tabId: tab.id,
                title: 'AI智能交互助手 - 请在支持的AI网站使用'
            });
        }
    }

    handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'LOG_INTERACTION':
                this.logInteraction(message.data);
                break;
            case 'GET_TAB_INFO':
                this.getTabInfo(sender.tab.id).then(sendResponse);
                return true; // 异步响应
            case 'UPDATE_BADGE':
                this.updateBadge(sender.tab.id, message.text);
                break;
        }
    }

    async logInteraction(data) {
        // 记录交互日志到storage
        const logs = await chrome.storage.local.get(['interactionLogs']) || {interactionLogs: []};
        logs.interactionLogs.push({
            timestamp: Date.now(),
            ...data
        });
        
        // 保持最近1000条记录
        if (logs.interactionLogs.length > 1000) {
            logs.interactionLogs = logs.interactionLogs.slice(-1000);
        }
        
        await chrome.storage.local.set({interactionLogs: logs.interactionLogs});
    }

    async getTabInfo(tabId) {
        const tab = await chrome.tabs.get(tabId);
        return {
            url: tab.url,
            title: tab.title,
            id: tab.id
        };
    }

    updateBadge(tabId, text) {
        chrome.action.setBadgeText({
            tabId: tabId,
            text: text || ''
        });
        
        chrome.action.setBadgeBackgroundColor({
            tabId: tabId,
            color: '#007bff'
        });
    }
}

// 初始化后台服务
new BackgroundService();