class PopupController {
    constructor() {
        this.init();
        this.loadSettings();
        this.bindEvents();
    }

    init() {
        this.elements = {
            status: document.getElementById('status'),
            toggleBtn: document.getElementById('toggleBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            interactionMode: document.getElementById('interactionMode'),
            replyDelay: document.getElementById('replyDelay'),
            deepExploration: document.getElementById('deepExploration'),
            customKeywords: document.getElementById('customKeywords'),
            keywordTags: document.getElementById('keywordTags'),
            explorationDirection: document.getElementById('explorationDirection'),
            contextAware: document.getElementById('contextAware'),
            maxRounds: document.getElementById('maxRounds'),
            stopKeywords: document.getElementById('stopKeywords'),
            autoExport: document.getElementById('autoExport'),
            exportFormat: document.getElementById('exportFormat'),
            exportBtn: document.getElementById('exportBtn'),
            exportAllBtn: document.getElementById('exportAllBtn'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),
            messageCount: document.getElementById('messageCount'),
            sessionDuration: document.getElementById('sessionDuration')
        };
    }

    bindEvents() {
        this.elements.toggleBtn.addEventListener('click', () => this.togglePlugin());
        this.elements.pauseBtn.addEventListener('click', () => this.pausePlugin());
        this.elements.resetBtn.addEventListener('click', () => this.resetSettings());
        this.elements.customKeywords.addEventListener('input', () => this.updateKeywordTags());
        this.elements.exportBtn.addEventListener('click', () => this.exportCurrentConversation());
        this.elements.exportAllBtn.addEventListener('click', () => this.exportAllConversations());
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // 自动保存设置
        Object.keys(this.elements).forEach(key => {
            const element = this.elements[key];
            if (element && (element.type || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA')) {
                element.addEventListener('change', () => this.saveSettings());
            }
        });

        // 定期更新统计信息
        this.updateStatsTimer = setInterval(() => this.updateConversationStats(), 1000);
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
            stopKeywords: '结束,停止,够了,不用继续',
            autoExport: false,
            exportFormat: 'markdown'
        });

        this.elements.interactionMode.value = settings.interactionMode;
        this.elements.replyDelay.value = settings.replyDelay;
        this.elements.deepExploration.checked = settings.deepExploration;
        this.elements.customKeywords.value = settings.customKeywords;
        this.elements.explorationDirection.value = settings.explorationDirection;
        this.elements.contextAware.checked = settings.contextAware;
        this.elements.maxRounds.value = settings.maxRounds;
        this.elements.stopKeywords.value = settings.stopKeywords;
        this.elements.autoExport.checked = settings.autoExport;
        this.elements.exportFormat.value = settings.exportFormat;

        this.updateStatus(settings.isActive);
        this.updateKeywordTags();
        this.updateConversationStats();
    }

    async saveSettings() {
        const settings = {
            interactionMode: this.elements.interactionMode.value,
            replyDelay: parseInt(this.elements.replyDelay.value),
            deepExploration: this.elements.deepExploration.checked,
            customKeywords: this.elements.customKeywords.value,
            explorationDirection: this.elements.explorationDirection.value,
            contextAware: this.elements.contextAware.checked,
            maxRounds: parseInt(this.elements.maxRounds.value),
            stopKeywords: this.elements.stopKeywords.value,
            autoExport: this.elements.autoExport.checked,
            exportFormat: this.elements.exportFormat.value
        };

        await chrome.storage.sync.set(settings);
        
        // 通知content script更新设置
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            chrome.tabs.sendMessage(tab.id, {
                type: 'SETTINGS_UPDATED',
                settings: settings
            });
        } catch (e) {
            console.log('No active tab or content script');
        }
    }

    async togglePlugin() {
        const currentSettings = await chrome.storage.sync.get(['isActive']);
        const newState = !currentSettings.isActive;
        
        await chrome.storage.sync.set({isActive: newState});
        this.updateStatus(newState);

        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            chrome.tabs.sendMessage(tab.id, {
                type: newState ? 'START_INTERACTION' : 'STOP_INTERACTION'
            });
        } catch (e) {
            console.log('请在AI聊天页面使用此插件');
        }
    }

    async pausePlugin() {
        await chrome.storage.sync.set({isActive: false});
        this.updateStatus(false);
        
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            chrome.tabs.sendMessage(tab.id, {type: 'PAUSE_INTERACTION'});
        } catch (e) {
            console.log('No active tab');
        }
    }

    async resetSettings() {
        await chrome.storage.sync.clear();
        await this.loadSettings();
        alert('设置已重置');
    }

    updateStatus(isActive) {
        if (isActive) {
            this.elements.status.textContent = '🟢 插件运行中';
            this.elements.status.className = 'status active';
            this.elements.toggleBtn.textContent = '停止交互';
            this.elements.pauseBtn.disabled = false;
        } else {
            this.elements.status.textContent = '🔴 插件已停止';
            this.elements.status.className = 'status inactive';
            this.elements.toggleBtn.textContent = '启动智能交互';
            this.elements.pauseBtn.disabled = true;
        }
    }

    updateKeywordTags() {
        const keywords = this.elements.customKeywords.value.split(',')
            .map(k => k.trim())
            .filter(k => k.length > 0);
        
        this.elements.keywordTags.innerHTML = keywords.map(keyword => 
            `<span class="keyword-tag">${keyword}</span>`
        ).join('');
    }
}

// 初始化弹窗
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});