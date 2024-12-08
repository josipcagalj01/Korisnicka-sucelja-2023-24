'use client'

import {
	List,
	ListOrdered,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Code,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	AlignCenter,
	AlignLeft,
	AlignRight,
	Highlighter,
	Upload,
	Link,
} from "lucide-react";

import { BorderedButton } from '../../BorderedLink/button';
import { Editor } from "@tiptap/react";
import styles from './rich-text-editor-style.module.css'

export default function ToolBar({ editor }: { editor: Editor | null }) {
	if(!editor) return null
	const Options = [
		{
			icon: <Heading1 width={20} height={20}/>,
			onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
			pressed: editor.isActive("heading", { level: 1 }),
		},
		{
			icon: <Heading2 width={20} height={20}/>,
			onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
			pressed: editor.isActive("heading", { level: 2 }),
		},
		{
			icon: <Heading3 width={20} height={20}/>,
			onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
			pressed: editor.isActive("heading", { level: 3 }),
		},
		{
			icon: <Heading4 width={20} height={20}/>,
			onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
			pressed: editor.isActive("heading", { level: 4 }),
		},
		{
			icon: <Bold width={20} height={20}/>,
			onClick: () => editor.chain().focus().toggleBold().run(),
			pressed: editor.isActive("bold"),
		},
		{
			icon: <Italic width={20} height={20}/>,
			onClick: () => editor.chain().focus().toggleItalic().run(),
			pressed: editor.isActive("italic"),
		},
		{
			icon: <Underline width={20} height={20}/>,
			onClick: () => editor.chain().focus().toggleUnderline().run(),
			pressed: editor.isActive("underline"),
		},
		{
			icon: <Strikethrough width={20} height={20}/>,
			onClick: () => editor.chain().focus().toggleStrike().run(),
			pressed: editor.isActive("strike"),
		},
		{
			icon: <AlignLeft width={20} height={20}/>,
			onClick: () => editor.chain().focus().setTextAlign("left").run(),
			pressed: editor.isActive({ textAlign: "left" }),
		},
		{
			icon: <AlignCenter width={20} height={20}/>,
			onClick: () => editor.chain().focus().setTextAlign("center").run(),
			pressed: editor.isActive({ textAlign: "center" }),
		},
		{
			icon: <AlignRight width={20} height={20}/>,
			onClick: () => editor.chain().focus().setTextAlign("right").run(),
			pressed: editor.isActive({ textAlign: "right" }),
		},
		{
			icon: <List width={20} height={20}/>,
			onClick: () => editor.chain().focus().toggleBulletList().run(),
			pressed: editor.isActive("bulletList"),
		},
		{
			icon: <ListOrdered width={20} height={20}/>,
			onClick: () => editor.chain().focus().toggleOrderedList().run(),
			pressed: editor.isActive("orderedList"),
		},
		{
			icon: <Code width={20} height={20}/>,
			onClick: () => editor.chain().focus().toggleCodeBlock().run(),
			pressed: editor.isActive("code"),
		},
		/*{
			icon: <Link width={20} height={20}/>
			onClick: () => {}
			pressed: editor.isActive("link")
		}*/
		/*{
			icon: <Highlighter width={20} height={20}/>,
			onClick: () => editor.chain().focus().toggleHighlight().run(),
			pressed: editor.isActive("highlight"),
		},*/
	];

	return (
		<div className={styles.editorToolbar + " editor-toolbar"}>
			{Options.map((option, i) => (
				<BorderedButton type='button'
					key={i}
					className={`${styles.borderedButton} ${option.pressed ? 'current' : ''}`}
					
					onClick={option.onClick}
				>
					{option.icon}
				</BorderedButton>
			))}
		</div>
	);
}