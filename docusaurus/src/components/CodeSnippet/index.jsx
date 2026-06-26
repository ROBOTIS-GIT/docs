import React from 'react';

export default function CodeSnippet({
  className = '',
  language = 'text',
  accentTokens = [],
  lines = [],
}) {
  const renderLine = (line, lineIndex) => {
    const parts = [];
    let cursor = 0;
    let tokenIndex = 0;

    while (cursor < line.length) {
      let matchToken = null;
      let matchIndex = -1;

      for (const token of accentTokens) {
        const index = line.indexOf(token, cursor);
        if (index !== -1 && (matchIndex === -1 || index < matchIndex)) {
          matchToken = token;
          matchIndex = index;
        }
      }

      if (matchIndex === -1) {
        parts.push(line.slice(cursor));
        break;
      }

      if (matchIndex > cursor) {
        parts.push(line.slice(cursor, matchIndex));
      }

      parts.push(
        <span className="docs-code-snippet__accent" key={`${lineIndex}-${tokenIndex}`}>
          {matchToken}
        </span>,
      );
      tokenIndex += 1;
      cursor = matchIndex + matchToken.length;
    }

    return parts;
  };

  return (
    <pre className={`docs-code-snippet language-${language} ${className}`.trim()}>
      <code className={`language-${language}`}>
        {lines.map((line, index) => (
          <span className="docs-code-snippet__line" key={index}>
            {renderLine(line, index)}
          </span>
        ))}
      </code>
    </pre>
  );
}
