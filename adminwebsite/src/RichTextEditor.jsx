import { useRef, useCallback, useEffect } from 'react';

/* ═══════════════════════════════════════════════
   RichTextEditor — Lightweight WYSIWYG component
   Uses contentEditable + execCommand for formatting.
   ═══════════════════════════════════════════════ */

const TOOLBAR_GROUPS = [
  {
    label: 'Text Style',
    buttons: [
      { cmd: 'bold', icon: 'B', title: 'Bold (Ctrl+B)', style: { fontWeight: 700 } },
      { cmd: 'italic', icon: 'I', title: 'Italic (Ctrl+I)', style: { fontStyle: 'italic' } },
      { cmd: 'underline', icon: 'U', title: 'Underline (Ctrl+U)', style: { textDecoration: 'underline' } },
      { cmd: 'strikeThrough', icon: 'S', title: 'Strikethrough', style: { textDecoration: 'line-through' } },
    ],
  },
  {
    label: 'Headings',
    buttons: [
      { cmd: 'formatBlock', arg: 'h3', icon: 'H2', title: 'Heading' },
      { cmd: 'formatBlock', arg: 'h4', icon: 'H3', title: 'Sub-heading' },
      { cmd: 'formatBlock', arg: 'p', icon: '¶', title: 'Paragraph' },
    ],
  },
  {
    label: 'Lists',
    buttons: [
      { cmd: 'insertUnorderedList', icon: '•', title: 'Bullet List', style: { fontSize: 18, lineHeight: '14px' } },
      { cmd: 'insertOrderedList', icon: '1.', title: 'Numbered List', style: { fontSize: 12, fontWeight: 700 } },
    ],
  },
  {
    label: 'Align',
    buttons: [
      {
        cmd: 'justifyLeft', title: 'Align Left',
        iconSvg: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" />
          </svg>
        ),
      },
      {
        cmd: 'justifyCenter', title: 'Align Center',
        iconSvg: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        ),
      },
      {
        cmd: 'justifyRight', title: 'Align Right',
        iconSvg: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="6" y1="18" x2="21" y2="18" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Insert',
    buttons: [
      { cmd: 'createLink', icon: '🔗', title: 'Insert Link', isPrompt: true },
      { cmd: 'removeFormat', icon: '⊘', title: 'Clear Formatting', style: { fontSize: 16 } },
    ],
  },
];

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 160 }) {
  const editorRef = useRef(null);
  const isInternalUpdate = useRef(false);

  // Sync external value → editor (only when value truly changes from outside)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== value) {
      editor.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    isInternalUpdate.current = true;
    const html = editorRef.current.innerHTML;
    // Treat empty editor as empty string
    const cleaned = html === '<br>' || html === '<div><br></div>' ? '' : html;
    onChange(cleaned);
  }, [onChange]);

  const execCmd = useCallback((cmd, arg) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg || null);
    // Trigger change after command
    handleInput();
  }, [handleInput]);

  const handleToolbarClick = useCallback((btn) => {
    if (btn.isPrompt) {
      const url = prompt('Enter URL:');
      if (url) execCmd(btn.cmd, url);
    } else {
      execCmd(btn.cmd, btn.arg);
    }
  }, [execCmd]);

  const handleKeyDown = useCallback((e) => {
    // Tab inserts indent instead of moving focus
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
    }
  }, []);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    // Paste as clean HTML (strip scripts, styles, etc.)
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    if (html) {
      // Sanitize: remove scripts, styles, event handlers
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      doc.querySelectorAll('script, style, link').forEach(el => el.remove());
      // Remove all inline styles and event handlers
      doc.querySelectorAll('*').forEach(el => {
        el.removeAttribute('style');
        el.removeAttribute('class');
        el.removeAttribute('id');
        [...el.attributes].forEach(attr => {
          if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
        });
      });
      document.execCommand('insertHTML', false, doc.body.innerHTML);
    } else {
      document.execCommand('insertText', false, text);
    }
    handleInput();
  }, [handleInput]);

  return (
    <div className="rte-wrapper">
      {/* Toolbar */}
      <div className="rte-toolbar">
        {TOOLBAR_GROUPS.map((group, gi) => (
          <div className="rte-toolbar-group" key={gi}>
            {group.buttons.map((btn) => (
              <button
                key={btn.cmd + (btn.arg || '')}
                type="button"
                className="rte-toolbar-btn"
                title={btn.title}
                style={btn.style || {}}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent editor blur
                  handleToolbarClick(btn);
                }}
              >
                {btn.iconSvg || btn.icon}
              </button>
            ))}
            {gi < TOOLBAR_GROUPS.length - 1 && <div className="rte-toolbar-sep" />}
          </div>
        ))}
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        className="rte-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        data-placeholder={placeholder || 'Start typing...'}
        style={{ minHeight }}
      />
    </div>
  );
}
