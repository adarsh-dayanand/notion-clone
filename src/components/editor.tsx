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

const Editor = ({ data, onChange, holder }: EditorProps) => {
  const ref = useRef<EditorJS>();

  useEffect(() => {
    if (!ref.current) {
      const editor = new EditorJS({
        holder: holder,
        tools: EDITOR_TOOLS,
        data,
        async onChange(api) {
          const savedData = await api.saver.save();
          onChange(savedData);
        },
        autofocus: true,
        placeholder: "Let's write an awesome story!",
      });
      ref.current = editor;
    }

    return () => {
      if (ref.current && ref.current.destroy) {
        ref.current.destroy();
      }
    };
    // We only want to initialize the editor once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id={holder} className="prose prose-stone dark:prose-invert max-w-none" />;
};

export default memo(Editor);
