'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
//import Highlight from "@tiptap/extension-highlight";
//import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import { UseFormSetValue } from 'react-hook-form';
import { Form } from '../../../../lib/manage-announcments/add-update-announcment-lib';
//import ImageResize from "tiptap-extension-resize-image";
import ToolBar from './toolbar';
import { useEffect } from 'react';
import '../../../obavijesti/[announcmentId]/newsPageStyle.css'

export default function NewsRichTextEditor({ content, onChange, field, setValue }: { content: any, onChange: any, field: 'content', setValue: UseFormSetValue<Form> }) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure(),
			TextAlign.configure({ types: ['paragraph', 'heading'] }),
			Heading.configure({ levels: [1, 2, 3, 4] }),
			BulletList.configure(),
			OrderedList.configure(),
			Underline
		],
		content: content,
		editorProps: {
			attributes: {
				class: 'editor announcmentContainer'
			},
		},
		parseOptions: {
			preserveWhitespace: true
		},
		onUpdate: ({ editor }) => {
			setValue(field, editor.getJSON(), {shouldValidate: false})
		},
	})

	useEffect(()=>{
		if(!content && !editor?.isEmpty) editor?.commands.clearContent() 
		else if(content && JSON.stringify(editor?.getJSON())!==JSON.stringify(content)) editor?.commands.setContent(content)
	}, [content])

	return (
		<div className='editor-wrapper'>
			<ToolBar editor={editor}/>
			<EditorContent editor={editor} />
		</div>
	)
}



function Button({ children }: { children?: React.ReactNode }) {
	return (<button>{children}</button>)
}