import React from 'react';

type MarkdownRendererProps = {
  text: string;
  className?: string;
};

export function MarkdownRenderer({ text, className = '' }: MarkdownRendererProps) {
  const renderMarkdown = (text: string) => {
    // Split text by lines to preserve line breaks
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      if (!line.trim()) {
        return <br key={lineIndex} />;
      }
      
      // Find all formatting patterns
      const patterns = [
        { regex: /\*\*(.*?)\*\*/g, tag: 'strong' },
        { regex: /__(.*?)__/g, tag: 'u' },
        { regex: /\*(.*?)\*/g, tag: 'em' },
      ];
      const replacements: Array<{start: number, end: number, element: React.ReactNode, original: string}> = [];
      
      patterns.forEach(({ regex, tag }) => {
        let match;
        regex.lastIndex = 0; // Reset regex
        while ((match = regex.exec(line)) !== null) {
          const element = React.createElement(tag, { key: `${tag}-${match.index}` }, match[1]);
          replacements.push({
            start: match.index,
            end: match.index + match[0].length,
            element,
            original: match[0]
          });
        }
      });
      
      // Sort replacements by start position (descending to replace from end to start)
      replacements.sort((a, b) => b.start - a.start);
      
      // Apply replacements
      const elements: React.ReactNode[] = [];
      let lastEnd = line.length;
      
      replacements.forEach(({ start, end, element }) => {
        // Add text after this replacement
        if (lastEnd > end) {
          elements.unshift(line.substring(end, lastEnd));
        }
        // Add the formatted element
        elements.unshift(element);
        lastEnd = start;
      });
      
      // Add remaining text at the beginning
      if (lastEnd > 0) {
        elements.unshift(line.substring(0, lastEnd));
      }
      
      return (
        <div key={lineIndex} className="leading-relaxed">
          {elements.length > 0 ? elements : line}
        </div>
      );
    });
  };

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {renderMarkdown(text)}
    </div>
  );
}