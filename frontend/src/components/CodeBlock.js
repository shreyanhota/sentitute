import React from "react";

const CodeBlock = ({ code }) => {
  return (
    <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
      {code}
    </pre>
  );
};

export default CodeBlock;
