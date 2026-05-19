import React, { useEffect, useRef, useState } from "react"
import "react-quill-new/dist/quill.snow.css"
import ReactQuill from "react-quill-new"


const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string
  onChange: (content: string) => void
}) => {
  const [editorValue, setEditorValue] = useState(value || "") // Single state
  const quillRef = useRef(false)

  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = true // Mark as mounted

      setTimeout(() => {
        document
          .querySelectorAll(".ql-toolbar")
          .forEach((toolbar, index) => {
            if (index > 0) {
              toolbar.remove() // Remove extra toolbars
            }
          })
      }, 100) // Short delay ensures Quill is fully initialized
    }
  }, [])

  return (
    <div className="relative">
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={(content) => {
          setEditorValue(content)
          onChange(content)
        }}
        modules={{
          toolbar: [
            [{ font: [] }],                                // Font picker
            [{ header: [1, 2, 3, 4, 5, 6, false] }],       // Headers
            [{ size: ["small", false, "large", "huge"] }], // Font sizes
            ["bold", "italic", "underline", "strike"],     // Basic text styling
            [{ color: [] }, { background: [] }],           // Font & Background colors
            [{ script: "sub" }, { script: "super" }],      // Subscript / Superscript
            [{ list: "ordered" }, { list: "bullet" }],     // Lists
            [{ indent: "-1" }, { indent: "+1" }],          // Indentation
            [{ align: [] }],                               // Text alignment
            ["blockquote", "code-block"],                  // Blockquote & Code Block
            ["link", "image", "video"],                    // Insert Link, Image, Video
            ["clean"],                                     // Remove formatting
          ],
        }}
        placeholder="Product Details..."
        className="bg-transparent border border-gray-700 text-white rounded-md"
        style={{ minHeight: "250px" }}
      />
      <style>
        {`
          .ql-toolbar {
            background: transparent;
            border-color: #444 !important;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 6px;
            padding: 8px !important;
          }
          .ql-toolbar.ql-snow .ql-formats {
            margin-right: 0 !important;
            display: flex;
            align-items: center;
            gap: 2px;
          }
          .ql-container {
            background: transparent !important;
            border-color: #444 !important;
            color: white;
          }
          .ql-picker {
            color: white !important;
            margin-right: 0 !important;
          }
          .ql-snow .ql-picker.ql-font {
            width: 90px !important;
          }
          .ql-snow .ql-picker.ql-header {
            width: 80px !important;
          }
          .ql-snow .ql-picker.ql-size {
            width: 75px !important;
          }
          .ql-font .ql-picker-label,
          .ql-size .ql-picker-label,
          .ql-header .ql-picker-label {
            padding-left: 4px !important;
            padding-right: 18px !important;
          }
          .ql-snow .ql-picker.ql-color,
          .ql-snow .ql-picker.ql-background {
            width: 28px !important;
          }
          .ql-snow .ql-color .ql-picker-label,
          .ql-snow .ql-background .ql-picker-label {
            padding: 2px 4px !important;
          }
          .ql-snow .ql-color .ql-picker-label svg,
          .ql-snow .ql-background .ql-picker-label svg {
            display: none !important;
          }
          .ql-snow .ql-color .ql-picker-label::before {
            content: "" !important;
            display: inline-block !important;
            width: 16px !important;
            height: 16px !important;
            vertical-align: middle !important;
            background-repeat: no-repeat !important;
            background-size: contain !important;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 20h9'/%3E%3Cpath d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'/%3E%3Cpath d='m15 5 3 3'/%3E%3C/svg%3E") !important;
          }
          .ql-snow .ql-background .ql-picker-label::before {
            content: "" !important;
            display: inline-block !important;
            width: 16px !important;
            height: 16px !important;
            vertical-align: middle !important;
            background-repeat: no-repeat !important;
            background-size: contain !important;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 11-6 6v3h9l3-3'/%3E%3Cpath d='m22 12-4.6 4.6a2%202%200%200%201-2.8%200l-5.2-5.2a2%202%200%200%201%200-2.8L14%204'/%3E%3C/svg%3E") !important;
          }

          .ql-editor {
            min-height: 200px;
          }
          .ql-snow {
            border-color: #444 !important;
          }
          .ql-editor.ql-blank::before {
            color: #aaa !important;
          }
          .ql-picker-options {
            background: #333 !important;
            color: white !important;
          }
          .ql-picker-item {
            color: white !important;
          }
          .ql-stroke:not(.ql-color-label) {
            stroke: white !important;
          }
          .ql-fill:not(.ql-color-label) {
            fill: white !important;
          }
          .ql-picker-label {
            color: white !important;
          }
        `}
      </style>
    </div>
  )
}

export default RichTextEditor