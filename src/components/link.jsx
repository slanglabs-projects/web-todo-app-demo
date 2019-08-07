import React from "react";

const Link = () => {
  const href = "https://github.com/SlangLabs/web-todo-app-demo";
  return (
    <div className="center-text link">
      <a href={href} target="_blank">
        Check code on Github!
      </a>
      <br />
    </div>
  );
};

export default Link;
