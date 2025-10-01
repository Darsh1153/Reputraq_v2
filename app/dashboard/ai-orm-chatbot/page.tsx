'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/lib/hooks/redux';
import { 
  Bot, 
  Send, 
  Loader2,
  Trash2,
  Sparkles,
  MessageCircle,
  BarChart3,
  Database,
  Brain,
  Zap
} from 'lucide-react';
import { StructuredDataRenderer } from '@/components/StructuredDataRenderer';
import styles from './page.module.scss';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIORMChatbotPage() {
  const { user } = useAppSelector((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${btoa(JSON.stringify({ userId: user.id }))}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
  };

  const suggestedQuestions = [
    "Create a comprehensive analysis of my keyword performance",
    "Show me a detailed breakdown of sentiment trends",
    "Analyze my top performing content sources",
    "Generate a weekly performance report",
    "What are the key insights from my data?"
  ];

  if (!user) {
    return (
      <div className={styles.error}>
        <h2>Access Denied</h2>
        <p>Please sign in to access the AI ORM Chatbot.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div className={styles.title}>
              <Bot size={32} />
              <div>
                <h1>AI ORM Chatbot</h1>
                <p>Intelligent data analysis and insights powered by AI</p>
              </div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button 
              onClick={clearConversation}
              className={styles.clearButton}
              title="Clear conversation"
            >
              <Trash2 size={20} />
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <Database size={24} />
          <h3>Data Analysis</h3>
          <p>Analyze your collected data with AI-powered insights</p>
        </div>
        <div className={styles.featureCard}>
          <BarChart3 size={24} />
          <h3>Performance Metrics</h3>
          <p>Get detailed performance reports and trending data</p>
        </div>
        <div className={styles.featureCard}>
          <Brain size={24} />
          <h3>Sentiment Analysis</h3>
          <p>Understand brand sentiment and public perception</p>
        </div>
        <div className={styles.featureCard}>
          <Zap size={24} />
          <h3>Real-time Insights</h3>
          <p>Get instant answers about your reputation data</p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <div className={styles.chatTitle}>
            <MessageCircle size={20} />
            <span>Chat with AI Assistant</span>
            <Sparkles size={16} className={styles.sparkle} />
          </div>
        </div>

        <div className={styles.chatContent}>
          {/* Messages */}
          <div className={styles.messages}>
            {messages.length === 0 ? (
              <div className={styles.welcomeMessage}>
                <div className={styles.welcomeIcon}>
                  <Bot size={48} />
                </div>
                <h3>Hello! I'm your AI Assistant</h3>
                <p>I can help you analyze your reputation monitoring data with **rich visualizations** and *beautiful formatting*. Ask me about:</p>
                <ul>
                  <li>📊 **Data tables** and performance metrics</li>
                  <li>🎯 **Sentiment analysis** with detailed breakdowns</li>
                  <li>📈 **Trending insights** and engagement data</li>
                  <li>📋 **Source analysis** and recommendations</li>
                </ul>
                <div className={styles.suggestedQuestions}>
                  <p>Try asking:</p>
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      className={styles.suggestedQuestion}
                      onClick={() => setInputMessage(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`${styles.message} ${styles[message.role]}`}
                >
                  <div className={styles.messageAvatar}>
                    {message.role === 'user' ? <MessageCircle size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={styles.messageContent}>
                    <div className={styles.messageText}>
                      {message.role === 'assistant' ? (
                        <StructuredDataRenderer content={message.content} />
                      ) : (
                        message.content
                      )}
                    </div>
                    <div className={styles.messageTime}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.messageAvatar}>
                  <Bot size={16} />
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <Loader2 size={16} className={styles.spinner} />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your data..."
                className={styles.input}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={styles.sendButton}
              >
                {isLoading ? (
                  <Loader2 size={20} className={styles.spinner} />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
