'use client';

import React, { memo, useEffect, useRef } from 'react';
import EditorJS, { type OutputData, type EditorConfig } from '@editorjs/editorjs';

// Using require for now to avoid potential CJS/ESM import issues with these plugins.
const Checklist = require('@editorjs/checklist');
const Embed = require('@editorjs/embed');
const Header = require('@editorjs/header');
const LinkTool = require('@editorjs/link');
const List = require('@editorjs/list');
const Paragraph = require('@editorjs/paragraph');
const Quote = require('@editorjs/quote');
const SimpleImage = require('@editorjs/simple-image');
const Table = require('@editorjs/table');

interface EditorProps {
  data?: OutputData;
  onChange(data: OutputData): void;
  holder: string;
  readOnly?: boolean;
}

const EDITOR_TOOLS: EditorConfig['tools'] = {
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
  },
  checklist: Checklist,
  embed: Embed,
  header: Header,
  linkTool: LinkTool,
  list: List,
  quote: Quote,
  simpleImage: SimpleImage,
  table: Table,
};

const Editor = ({ data, onChange, holder, readOnly = false }: EditorProps) => {
  const ref = useRef<EditorJS>();

  useEffect(() => {
    if (!ref.current) {
      const editor = new EditorJS({
        holder: holder,
        tools: EDITOR_TOOLS,
        data,
        readOnly: readOnly,
        async onChange(api) {
          const isReadOnly = await api.readOnly.isEnabled;
          if (!isReadOnly) {
            const savedData = await api.saver.save();
            onChange(savedData);
          }
        },
        autofocus: true,
        placeholder: readOnly ? "This note is read-only." : "Let's write an awesome story!",
      });
      ref.current = editor;
    }

    return () => {
      if (ref.current && ref.current.destroy) {
        ref.current.destroy();
        ref.current = undefined;
      }
    };
    // We only want to initialize the editor once.
    // The key on the parent component handles re-initialization on note change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id={holder} className="prose prose-stone dark:prose-invert max-w-none" />;
};

export default memo(Editor);
