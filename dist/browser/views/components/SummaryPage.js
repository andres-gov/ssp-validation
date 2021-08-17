import React from "../../../../_snowpack/pkg/react.js";
import {useAppState} from "../hooks.js";
export const SummaryPage = () => {
  const {validator} = useAppState().schematron;
  if (validator.current !== "VALIDATED") {
    return /* @__PURE__ */ React.createElement("div", null, "Not loaded.");
  }
  return /* @__PURE__ */ React.createElement("h1", null, "Found ", validator.validationReport.failedAsserts.length, " assertions.");
};
