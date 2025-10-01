'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks/redux';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2,
  Minimize2,
  Maximize2,
  Trash2,
  Sparkles
} from 'lucide-react';
import { StructuredDataRenderer } from './StructuredDataRenderer';
import styles from './AIChatbot.module.scss';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AIChatbot({ isOpen, onToggle }: AIChatbotProps) {
  const { user } = useAppSelector((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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

  if (!isOpen) {
    return (
      <button 
        className={styles.chatToggle}
        onClick={onToggle}
        title="Open AI Assistant"
      >
        <MessageCircle size={24} />
        <span className={styles.notificationDot}></span>
      </button>
    );
  }

  return (
    <div className={`${styles.chatbot} ${isMinimized ? styles.minimized : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.title}>
            <Bot size={20} />
            <span>AI Assistant</span>
            <Sparkles size={16} className={styles.sparkle} />
          </div>
          <div className={styles.controls}>
            <button 
              onClick={clearConversation}
              className={styles.clearButton}
              title="Clear conversation"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className={styles.minimizeButton}
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button 
              onClick={onToggle}
              className={styles.closeButton}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className={styles.messages}>
            {messages.length === 0 ? (
              <div className={styles.welcomeMessage}>
                <div className={styles.welcomeIcon}>
                  <Bot size={32} />
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
                    {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
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
                  <Loader2 size={16} className={styles.spinner} />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
