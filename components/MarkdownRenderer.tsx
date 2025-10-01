'use client';

import { marked } from 'marked';
import { useState, useEffect } from 'react';
import styles from './MarkdownRenderer.module.scss';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: false,
      mangle: false,
      tables: true,
      sanitize: false,
    });

    // Convert markdown to HTML
    const html = marked(content);
    setHtmlContent(html);
  }, [content]);

  return (
    <div 
      className={styles.markdownContent}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
