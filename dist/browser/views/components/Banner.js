import React from "../../../../_snowpack/pkg/react.js";
import {useActions} from "../hooks.js";
export const Banner = () => {
  const {getAssetUrl} = useActions();
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("section", {
    className: "beta-banner"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "grid-container"
  }, /* @__PURE__ */ React.createElement("p", {
    className: "grid-col-auto"
  }, /* @__PURE__ */ React.createElement("strong", null, "BETA SITE:"), " We are testing a new validation automation system for FedRAMP audit reviews."))), /* @__PURE__ */ React.createElement("section", {
    className: "usa-banner",
    "aria-label": "Official government website"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "usa-accordion"
  }, /* @__PURE__ */ React.createElement("header", {
    className: "usa-banner__header"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "usa-banner__inner"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "grid-col-auto"
  }, /* @__PURE__ */ React.createElement("img", {
    className: "usa-banner__header-flag",
    src: getAssetUrl("uswds/img/us_flag_small.png"),
    alt: "U.S. flag"
  })), /* @__PURE__ */ React.createElement("div", {
    className: "grid-col-fill tablet:grid-col-auto"
  }, /* @__PURE__ */ React.createElement("p", {
    className: "usa-banner__header-text"
  }, "An official website of the United States government"), /* @__PURE__ */ React.createElement("p", {
    className: "usa-banner__header-action",
    "aria-hidden": "true"
  }, "Here’s how you know")), /* @__PURE__ */ React.createElement("button", {
    className: "usa-accordion__button usa-banner__button",
    "aria-expanded": "false",
    "aria-controls": "gov-banner-default"
  }, /* @__PURE__ */ React.createElement("span", {
    className: "usa-banner__button-text"
  }, "Here’s how you know")))), /* @__PURE__ */ React.createElement("div", {
    className: "usa-banner__content usa-accordion__content",
    id: "gov-banner-default"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "grid-row grid-gap-lg"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "usa-banner__guidance tablet:grid-col-6"
  }, /* @__PURE__ */ React.createElement("img", {
    className: "usa-banner__icon usa-media-block__img",
    src: getAssetUrl("uswds/img/icon-dot-gov.svg"),
    role: "img",
    alt: "",
    "aria-hidden": "true"
  }), /* @__PURE__ */ React.createElement("div", {
    className: "usa-media-block__body"
  }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Official websites use .gov"), /* @__PURE__ */ React.createElement("br", null), "A ", /* @__PURE__ */ React.createElement("strong", null, ".gov"), " website belongs to an official government organization in the United States."))), /* @__PURE__ */ React.createElement("div", {
    className: "usa-banner__guidance tablet:grid-col-6"
  }, /* @__PURE__ */ React.createElement("img", {
    className: "usa-banner__icon usa-media-block__img",
    src: getAssetUrl("uswds/img/icon-https.svg"),
    role: "img",
    alt: "",
    "aria-hidden": "true"
  }), /* @__PURE__ */ React.createElement("div", {
    className: "usa-media-block__body"
  }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Secure .gov websites use HTTPS"), /* @__PURE__ */ React.createElement("br", null), "A ", /* @__PURE__ */ React.createElement("strong", null, "lock"), " (", /* @__PURE__ */ React.createElement("span", {
    className: "icon-lock"
  }, /* @__PURE__ */ React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "52",
    height: "64",
    viewBox: "0 0 52 64",
    className: "usa-banner__lock-image",
    role: "img",
    "aria-labelledby": "banner-lock-title-default banner-lock-description-default",
    focusable: "false"
  }, /* @__PURE__ */ React.createElement("title", {
    id: "banner-lock-title-default"
  }, "Lock"), /* @__PURE__ */ React.createElement("desc", {
    id: "banner-lock-description-default"
  }, "A locked padlock"), /* @__PURE__ */ React.createElement("path", {
    fill: "#000000",
    fillRule: "evenodd",
    d: "M26 0c10.493 0 19 8.507 19 19v9h3a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V32a4 4 0 0 1 4-4h3v-9C7 8.507 15.507 0 26 0zm0 8c-5.979 0-10.843 4.77-10.996 10.712L15 19v9h22v-9c0-6.075-4.925-11-11-11z"
  }))), ") or ", /* @__PURE__ */ React.createElement("strong", null, "https://"), " means you’ve safely connected to the .gov website. Share sensitive information only on official, secure websites."))))))));
};
