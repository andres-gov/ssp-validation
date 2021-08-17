import React from "../../../../_snowpack/pkg/react.js";
import {useActions, useAppState} from "../hooks.js";
export const Footer = () => {
  const {getAssetUrl} = useActions();
  const {sourceRepository} = useAppState();
  return /* @__PURE__ */ React.createElement("footer", {
    className: "usa-footer usa-footer--slim"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "grid-container usa-footer__return-to-top"
  }, /* @__PURE__ */ React.createElement("a", {
    href: "#"
  }, "Return to top")), /* @__PURE__ */ React.createElement("div", {
    className: "usa-footer__primary-section"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "usa-footer__primary-container grid-row"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "mobile-lg:grid-col-12"
  }, /* @__PURE__ */ React.createElement("nav", {
    className: "usa-footer__nav",
    "aria-label": "Footer navigation,"
  }, /* @__PURE__ */ React.createElement("ul", {
    className: "grid-row grid-gap"
  }, /* @__PURE__ */ React.createElement("li", {
    className: "mobile-lg:grid-col-4 desktop:grid-col-auto usa-footer__primary-content"
  }, /* @__PURE__ */ React.createElement("a", {
    className: "usa-footer__primary-link",
    href: "https://www.fedramp.gov/"
  }, "FedRAMP")), /* @__PURE__ */ React.createElement("li", {
    className: "mobile-lg:grid-col-4 desktop:grid-col-auto usa-footer__primary-content"
  }, /* @__PURE__ */ React.createElement("a", {
    className: "usa-footer__primary-link",
    href: "https://10x.gsa.gov/"
  }, "10x")), /* @__PURE__ */ React.createElement("li", {
    className: "mobile-lg:grid-col-4 desktop:grid-col-auto usa-footer__primary-content"
  }, /* @__PURE__ */ React.createElement("a", {
    className: "usa-footer__primary-link",
    href: sourceRepository.treeUrl
  }, "Source code"))))))), /* @__PURE__ */ React.createElement("div", {
    className: "usa-footer__secondary-section"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "grid-container"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "usa-footer__logo grid-row grid-gap-2"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "grid-col-auto"
  }, /* @__PURE__ */ React.createElement("img", {
    className: "usa-footer__logo-img",
    src: getAssetUrl("uswds/img/logo-img.png"),
    alt: ""
  })), /* @__PURE__ */ React.createElement("div", {
    className: "grid-col-auto"
  }, /* @__PURE__ */ React.createElement("p", {
    className: "usa-footer__logo-heading"
  }, "General Services Administration"))))));
};
