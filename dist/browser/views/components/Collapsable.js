import React from "../../../../_snowpack/pkg/react.js";
export const Collapsable = ({children, title}) => {
  return /* @__PURE__ */ React.createElement("div", {
    className: "usa-accordion"
  }, React.Children.map(children, (child, index) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h4", {
    className: "usa-accordion__heading"
  }, /* @__PURE__ */ React.createElement("button", {
    className: "usa-accordion__button",
    "aria-expanded": "false",
    "aria-controls": `id-${index}`
  }, title)), /* @__PURE__ */ React.createElement("div", {
    id: `id-${index}`,
    className: "usa-accordion__content usa-prose",
    style: {maxHeight: "30em"}
  }, child))));
};
