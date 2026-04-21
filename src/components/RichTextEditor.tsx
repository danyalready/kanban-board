import ReactQuill, { ReactQuillProps } from "react-quill";

import "react-quill/dist/quill.snow.css";

export default function RichTextEditor(props: ReactQuillProps) {
    return <ReactQuill theme="snow" value={props.value} onChange={props.onChange} {...props} />;
}
