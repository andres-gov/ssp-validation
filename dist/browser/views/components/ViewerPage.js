import React, {createRef, useEffect} from "../../../../_snowpack/pkg/react.js";
import {useAppState} from "../hooks.js";
import {CodeViewer} from "./CodeViewer.js";
export const ViewerPage = (props) => {
  const validator = useAppState().schematron.validator;
  let ref = createRef();
  useEffect(() => {
    if (ref.current && props.assertionId) {
      const target = ref.current.querySelector(`#${props.assertionId}`);
      if (target) {
        target.scrollIntoView({
          behavior: "auto",
          block: "start",
          inline: "start"
        });
        target.style.backgroundColor = "lightgray";
      }
    }
  });
  return /* @__PURE__ */ React.createElement("div", {
    className: "grid-row grid-gap"
  }, /* @__PURE__ */ React.createElement("div", {
    ref,
    className: "mobile:grid-col-12"
  }, validator.current === "VALIDATED" ? /* @__PURE__ */ React.createElement(CodeViewer, {
    codeHTML: validator.annotatedSSP
  }) : /* @__PURE__ */ React.createElement("p", null, "No report validated.")));
};
