import React from "../../../../_snowpack/pkg/react.js";
export const CodeViewer = ({codeHTML}) => {
  return /* @__PURE__ */ React.createElement("pre", {
    style: {whiteSpace: "pre-wrap"}
  }, /* @__PURE__ */ React.createElement("code", {
    dangerouslySetInnerHTML: {__html: codeHTML}
  }));
};
