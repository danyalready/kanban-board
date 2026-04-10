import ReactQuill from "react-quill";

import "react-quill/dist/quill.snow.css";

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export default function RichTextEditor(props: Props) {
    return (
        <ReactQuill theme="snow" value={props.value} onChange={props.onChange} className="mb-10" />
    );
}
