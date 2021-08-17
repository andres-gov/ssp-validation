import React from "../../../../_snowpack/pkg/react.js";
import {useAppState} from "../hooks.js";
export const Breadcrumbs = () => {
  const {breadcrumbs} = useAppState().router;
  return /* @__PURE__ */ React.createElement("nav", {
    className: "usa-breadcrumb",
    "aria-label": "Breadcrumbs"
  }, /* @__PURE__ */ React.createElement("ol", {
    className: "usa-breadcrumb__list"
  }, breadcrumbs.map((breadcrumb, index) => {
    const contentNode = /* @__PURE__ */ React.createElement("span", null, breadcrumb.text);
    return /* @__PURE__ */ React.createElement("li", {
      key: index,
      className: "usa-breadcrumb__list-item",
      "aria-current": !breadcrumb.linkUrl && "page"
    }, breadcrumb.linkUrl ? /* @__PURE__ */ React.createElement("a", {
      href: breadcrumb.linkUrl,
      className: "usa-breadcrumb__link"
    }, contentNode) : contentNode);
  })));
};
