import React from "react";
import { User } from "./data/user";
import Nav from "./Nav";
import Editor from "./Editor";

export default function Home(props: { user: User | null }) {
  const { user } = props;
  const [preview, setPreview] = React.useState(false);
  return (
    <>
      <Nav user={user}>
        {preview ? (
          <li>
            <a onClick={() => setPreview(false)}>Edit</a>
          </li>
        ) : (
          <li>
            <a onClick={() => setPreview(true)}>Preview</a>
          </li>
        )}
      </Nav>
      <div className="horizontal-center">
        <div className="container">
          <Editor preview={preview} />
        </div>
      </div>
    </>
  );
}
