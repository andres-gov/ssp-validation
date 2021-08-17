import React from "../../../../_snowpack/pkg/react.js";
import {getUrl, Routes} from "../../presenter/state/router.js";
import {useActions, useAppState} from "../hooks.js";
import classnames from "../../../../_snowpack/pkg/classnames.js";
export const Header = () => {
  const {getAssetUrl} = useActions();
  const {currentRoute} = useAppState().router;
  return /* @__PURE__ */ React.createElement("header", {
    className: "usa-header usa-header--basic usa-header--megamenu"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "usa-nav-container"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "usa-navbar"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "usa-logo",
    id: "basic-mega-logo"
  }, /* @__PURE__ */ React.createElement("em", {
    className: "usa-logo__text"
  }, /* @__PURE__ */ React.createElement("a", {
    href: getUrl(Routes.home),
    title: "Home",
    "aria-label": "Home"
  }, "FedRAMP ASAP"))), /* @__PURE__ */ React.createElement("button", {
    className: "usa-menu-btn"
  }, "Menu")), /* @__PURE__ */ React.createElement("nav", {
    "aria-label": "Primary navigation",
    className: "usa-nav"
  }, /* @__PURE__ */ React.createElement("button", {
    className: "usa-nav__close"
  }, /* @__PURE__ */ React.createElement("img", {
    src: getAssetUrl("uswds/img/usa-icons/close.svg"),
    role: "img",
    alt: "close"
  })), /* @__PURE__ */ React.createElement("ul", {
    className: "usa-nav__primary usa-accordion"
  }, /* @__PURE__ */ React.createElement("li", {
    className: "usa-nav__primary-item"
  }, /* @__PURE__ */ React.createElement("a", {
    className: classnames("usa-nav__link", {
      "usa-current": currentRoute.type === Routes.home.type
    }),
    href: "#/"
  }, /* @__PURE__ */ React.createElement("span", null, "Home"))), /* @__PURE__ */ React.createElement("li", {
    className: "usa-nav__primary-item"
  }, /* @__PURE__ */ React.createElement("a", {
    className: classnames("usa-nav__link", {
      "usa-current": currentRoute.type === Routes.validator.type
    }),
    href: getUrl(Routes.validator)
  }, /* @__PURE__ */ React.createElement("span", null, "SSP Validator"))), /* @__PURE__ */ React.createElement("li", {
    className: "usa-nav__primary-item"
  }, /* @__PURE__ */ React.createElement("button", {
    className: classnames("usa-accordion__button", "usa-nav__link", {
      "usa-current": currentRoute.type === Routes.developers.type
    }),
    "aria-expanded": "false",
    "aria-controls": "extended-documentation"
  }, /* @__PURE__ */ React.createElement("span", null, "Documentation")), /* @__PURE__ */ React.createElement("ul", {
    id: "extended-documentation",
    className: "usa-nav__submenu"
  }, /* @__PURE__ */ React.createElement("li", {
    className: "usa-nav__submenu-item"
  }, /* @__PURE__ */ React.createElement("a", {
    href: getUrl(Routes.developers)
  }, "Developers"))))))));
};
