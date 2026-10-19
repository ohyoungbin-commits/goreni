import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Simple yet robust line-by-line markdown and formatted text renderer
  const lines = content.split('\n');

  const renderInline = (text: string) => {
    // Replace bold **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-700">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={index} className="h-1.5" />;
        }

        // H3: ###
        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={index}
              className="text-base font-semibold text-slate-900 pt-3 pb-1 border-b border-slate-100 flex items-center gap-2"
            >
              {renderInline(trimmed.replace(/^###\s+/, ''))}
            </h3>
          );
        }

        // H2: ##
        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={index}
              className="text-lg font-bold text-slate-900 pt-4 pb-1.5 border-b border-slate-200"
            >
              {renderInline(trimmed.replace(/^##\s+/, ''))}
            </h2>
          );
        }

        // H1: #
        if (trimmed.startsWith('# ')) {
          return (
            <h1
              key={index}
              className="text-xl font-bold text-slate-900 pt-4 pb-2"
            >
              {renderInline(trimmed.replace(/^#\s+/, ''))}
            </h1>
          );
        }

        // Divider: ---
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={index} className="my-3 border-slate-200" />;
        }

        // Blockquote: >
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-amber-500 pl-3 py-1 my-2 bg-amber-50/60 rounded-r text-amber-950 text-xs italic"
            >
              {renderInline(trimmed.replace(/^>\s*/, ''))}
            </blockquote>
          );
        }

        // Bullet point: - or *
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={index} className="flex items-start gap-2 pl-2">
              <span className="text-teal-600 font-bold select-none leading-5">·</span>
              <span className="flex-1">{renderInline(itemText)}</span>
            </div>
          );
        }

        // Numbered list: 1. 2. etc
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={index} className="flex items-start gap-2 pl-2">
              <span className="text-teal-700 font-medium select-none tabular-nums text-xs leading-5">
                {numMatch[1]}.
              </span>
              <span className="flex-1">{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <p key={index} className="text-slate-800">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
};
