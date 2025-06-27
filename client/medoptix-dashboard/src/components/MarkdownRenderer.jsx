import React from 'react';

// A simple markdown renderer component
// For a real application, you would use a library like react-markdown
const MarkdownRenderer = ({ markdown }) => {
  // Function to convert markdown to HTML (very basic implementation)
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    // Replace headers
    let html = text
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4 class="text-base font-bold my-2">$1</h4>');
    
    // Replace bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace lists
    html = html
      .replace(/^\s*-\s*(.*$)/gm, '<li class="ml-6 list-disc">$1</li>')
      .replace(/(<\/li>\n<li)/g, '$1');
    
    // Wrap lists in ul tags
    html = html.replace(/(<li.*?>.*?<\/li>)/gs, '<ul class="my-2">$1</ul>');
    
    // Replace paragraphs (any line that doesn't start with a special character)
    html = html
      .replace(/^(?!<[h|u|l])(.*$)/gm, '<p class="my-2">$1</p>')
      .replace(/(<\/p>\n<p)/g, '$1');
    
    return html;
  };

  return (
    <div 
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  );
};

export default MarkdownRenderer;