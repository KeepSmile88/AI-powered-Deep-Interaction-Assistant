// 高级AI交互引擎 - 注入页面脚本
(function() {
    'use strict';

    class AdvancedAIEngine {
        constructor() {
            this.knowledgeGraph = new Map();
            this.topicExplored = new Set();
            this.conversationDepth = 0;
            this.lastTopics = [];
            this.intelligentPrompts = this.initIntelligentPrompts();
            this.init();
        }

        init() {
            console.log('高级AI交互引擎已注入');
            this.setupEventListeners();
            this.createKnowledgeExtractor();
        }

        initIntelligentPrompts() {
            return {
                deepAnalysis: [
                    "能否从多个维度深入分析这个问题？",
                    "这背后的根本原理和机制是什么？",
                    "从系统性角度来看，这个问题涉及哪些层面？",
                    "可以用更学术或专业的角度来探讨吗？"
                ],
                practicalApplication: [
                    "在实际场景中，这如何具体操作和实施？",
                    "有哪些成功的实际应用案例可以参考？",
                    "实践中最常遇到的挑战和解决方案是什么？",
                    "如何将理论转化为可执行的行动步骤？"
                ],
                comparativeAnalysis: [
                    "与其他相似方法或理论相比，这种方式的独特优势是什么？",
                    "在不同条件下，这种方法的适用性如何变化？",
                    "历史上类似的情况是如何发展和演变的？",
                    "跨领域来看，有哪些相似的模式或规律？"
                ],
                criticalThinking: [
                    "这个观点或方法可能存在哪些局限性或盲点？",
                    "反对或质疑的声音通常会提出什么论据？",
                    "在什么情况下这种方法可能不适用或失效？",
                    "如何客观评估这种方法的有效性和可靠性？"
                ],
                futureExploration: [
                    "这个领域未来可能的发展方向是什么？",
                    "技术进步对这个问题会带来什么新的解决思路？",
                    "长远来看，这种趋势可能产生什么深远影响？",
                    "新兴的相关概念或方法有哪些值得关注？"
                ],
                contextualUnderstanding: [
                    "在不同文化或社会背景下，这个问题如何被理解？",
                    "历史背景对当前问题的形成有什么影响？",
                    "相关的政策、法规或行业标准是如何规定的？",
                    "这个问题在全球化背景下呈现什么特点？"
                ]
            };
        }

        createKnowledgeExtractor() {
            this.keywordExtractor = {
                extractTopics: (text) => {
                    // 简化的主题提取逻辑
                    const topics = [];
                    const topicPatterns = [
                        /(?:关于|涉及|包括|方面|领域|概念)([^，。！？,.\!?]{2,10})/g,
                        /([A-Za-z]{3,}(?:\s+[A-Za-z]{3,})*)/g,
                        /([\u4e00-\u9fa5]{2,8})(?:技术|方法|理论|模式|系统)/g
                    ];
                    
                    topicPatterns.forEach(pattern => {
                        let match;
                        while ((match = pattern.exec(text)) !== null) {
                            if (match[1] && match[1].length > 2) {
                                topics.push(match[1].trim());
                            }
                        }
                    });
                    
                    return [...new Set(topics)].slice(0, 5);
                },

                extractKeyPhrases: (text) => {
                    // 提取关键短语
                    const phrases = [];
                    const phrasePatterns = [
                        /(?:主要|核心|重要|关键|基本|根本)(?:的)?([^，。！？,.\!?]{3,15})/g,
                        /([^，。！？,.\!?]{3,15})(?:很重要|是关键|是核心|是基础)/g
                    ];
                    
                    phrasePatterns.forEach(pattern => {
                        let match;
                        while ((match = pattern.exec(text)) !== null) {
                            phrases.push(match[1].trim());
                        }
                    });
                    
                    return [...new Set(phrases)].slice(0, 3);
                }
            };
        }

        setupEventListeners() {
            // 监听来自content script的消息
            window.addEventListener('message', (event) => {
                if (event.source !== window) return;
                
                if (event.data.type === 'ANALYZE_RESPONSE') {
                    this.analyzeResponse(event.data.content);
                }
                
                if (event.data.type === 'GENERATE_INTELLIGENT_PROMPT') {
                    const prompt = this.generateIntelligentPrompt(event.data.context);
                    window.postMessage({
                        type: 'INTELLIGENT_PROMPT_GENERATED',
                        prompt: prompt
                    }, '*');
                }

                // 处理自动导出请求
                if (event.data.type === 'AUTO_EXPORT_CONVERSATION') {
                    this.handleAutoExport(event.data.data);
                }
            });
        }

        handleAutoExport(data) {
            try {
                const blob = new Blob([data.content], { type: data.mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.filename;
                a.style.display = 'none';
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // 清理URL对象
                setTimeout(() => URL.revokeObjectURL(url), 100);
                
                console.log('自动导出对话成功:', data.filename);
            } catch (error) {
                console.error('自动导出失败:', error);
            }
        }

        analyzeResponse(content) {
            // 分析AI回复内容
            const topics = this.keywordExtractor.extractTopics(content);
            const keyPhrases = this.keywordExtractor.extractKeyPhrases(content);
            
            // 更新知识图谱
            topics.forEach(topic => {
                if (!this.knowledgeGraph.has(topic)) {
                    this.knowledgeGraph.set(topic, {
                        mentions: 1,
                        relatedTopics: new Set(),
                        keyPhrases: new Set()
                    });
                } else {
                    const topicData = this.knowledgeGraph.get(topic);
                    topicData.mentions++;
                }
                
                // 建立主题关联
                topics.forEach(otherTopic => {
                    if (otherTopic !== topic) {
                        this.knowledgeGraph.get(topic).relatedTopics.add(otherTopic);
                    }
                });
                
                // 关联关键短语
                keyPhrases.forEach(phrase => {
                    this.knowledgeGraph.get(topic).keyPhrases.add(phrase);
                });
            });
            
            this.lastTopics = topics;
            this.conversationDepth++;
        }

        generateIntelligentPrompt(context = {}) {
            const { explorationDirection, conversationHistory, settings } = context;
            
            // 基于对话深度选择策略
            let strategy = this.selectStrategy();
            
            // 基于知识图谱生成上下文相关提示
            if (this.lastTopics.length > 0 && settings?.contextAware) {
                return this.generateContextAwarePrompt(strategy);
            }
            
            // 选择对应策略的提示模板
            const templates = this.intelligentPrompts[strategy] || this.intelligentPrompts.deepAnalysis;
            const basePrompt = templates[Math.floor(Math.random() * templates.length)];
            
            return this.enhancePrompt(basePrompt, strategy);
        }

        selectStrategy() {
            // 基于对话深度和已探索主题智能选择策略
            const strategies = Object.keys(this.intelligentPrompts);
            
            if (this.conversationDepth < 3) {
                return 'deepAnalysis';
            } else if (this.conversationDepth < 6) {
                return Math.random() > 0.5 ? 'practicalApplication' : 'comparativeAnalysis';
            } else if (this.conversationDepth < 10) {
                return Math.random() > 0.5 ? 'criticalThinking' : 'contextualUnderstanding';
            } else {
                return 'futureExploration';
            }
        }

        generateContextAwarePrompt(strategy) {
            const recentTopic = this.lastTopics[0];
            const relatedTopics = this.knowledgeGraph.get(recentTopic)?.relatedTopics;
            
            const contextPrompts = {
                deepAnalysis: [
                    `结合${recentTopic}，能否深入分析其内在机理？`,
                    `从${recentTopic}的角度看，背后的核心逻辑是什么？`
                ],
                practicalApplication: [
                    `在${recentTopic}的实际应用中，如何处理复杂情况？`,
                    `${recentTopic}在不同行业中的具体实践有什么差异？`
                ],
                comparativeAnalysis: [
                    `${recentTopic}与相关概念相比有什么独特之处？`,
                    `在${recentTopic}领域，不同方法的效果对比如何？`
                ]
            };
            
            const prompts = contextPrompts[strategy] || contextPrompts.deepAnalysis;
            return prompts[Math.floor(Math.random() * prompts.length)];
        }

        enhancePrompt(basePrompt, strategy) {
            // 根据策略增强提示词
            const enhancements = {
                deepAnalysis: ['请详细说明', '能否系统性地'],
                practicalApplication: ['具体来说', '在实践中'],
                comparativeAnalysis: ['对比来看', '相较而言'],
                criticalThinking: ['客观地分析', '批判性地思考'],
                futureExploration: ['从发展趋势看', '展望未来'],
                contextualUnderstanding: ['从多角度理解', '在更广泛的背景下']
            };
            
            const enhancement = enhancements[strategy];
            if (enhancement && Math.random() > 0.5) {
                const prefix = enhancement[Math.floor(Math.random() * enhancement.length)];
                return `${prefix}，${basePrompt}`;
            }
            
            return basePrompt;
        }

        // 导出方法供content script使用
        getKnowledgeInsights() {
            const insights = {
                totalTopics: this.knowledgeGraph.size,
                conversationDepth: this.conversationDepth,
                mostDiscussedTopics: this.getMostDiscussedTopics(),
                suggestedExplorations: this.getSuggestedExplorations()
            };
            
            return insights;
        }

        getMostDiscussedTopics() {
            const topics = Array.from(this.knowledgeGraph.entries())
                .sort((a, b) => b[1].mentions - a[1].mentions)
                .slice(0, 5)
                .map(([topic, data]) => ({topic, mentions: data.mentions}));
            
            return topics;
        }

        getSuggestedExplorations() {
            // 基于知识图谱建议未探索的相关主题
            const suggestions = [];
            
            for (const [topic, data] of this.knowledgeGraph.entries()) {
                for (const relatedTopic of data.relatedTopics) {
                    if (!this.topicExplored.has(relatedTopic)) {
                        suggestions.push(`深入探讨${topic}与${relatedTopic}的关系`);
                    }
                }
            }
            
            return suggestions.slice(0, 3);
        }
    }

    // 全局实例
    window.advancedAIEngine = new AdvancedAIEngine();
    
    // 通知页面加载完成
    window.postMessage({
        type: 'ADVANCED_ENGINE_READY'
    }, '*');

})();