import React from "../../../../_snowpack/pkg/react.js";
import {useAppState} from "../hooks.js";
export const DevelopersPage = () => {
  const {developerExampleUrl} = useAppState().sourceRepository;
  return /* @__PURE__ */ React.createElement("div", {
    className: "usa-prose"
  }, /* @__PURE__ */ React.createElement("h1", null, "Developers"), /* @__PURE__ */ React.createElement("p", null, "As a third-party developer, you may evaluate the FedRAMP ASAP rules with an XSLT 3.0 processor."), /* @__PURE__ */ React.createElement("p", null, "Developer examples are available in our", " ", /* @__PURE__ */ React.createElement("a", {
    href: developerExampleUrl
  }, "Github repository"), "."));
};
