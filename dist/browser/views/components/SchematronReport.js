import React from "../../../../_snowpack/pkg/react.js";
import {Routes, getUrl} from "../../presenter/state/router.js";
import {colorTokenForRole} from "../../util/styles.js";
import {useActions, useAppState} from "../hooks.js";
export const SchematronReport = () => {
  const {schematronReport} = useAppState().schematron;
  const {getAssetUrl} = useActions();
  return /* @__PURE__ */ React.createElement("div", {
    className: "grid-row grid-gap"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "tablet:grid-col"
  }, /* @__PURE__ */ React.createElement("h1", {
    className: "font-heading-lg"
  }, schematronReport.summary.title, /* @__PURE__ */ React.createElement("span", {
    className: "font-heading-sm text-secondary-light",
    style: {float: "right"}
  }, /* @__PURE__ */ React.createElement("span", {
    className: `text-blue`
  }, schematronReport.summary.counts.assertions, " concerns and", " ", schematronReport.summary.counts.reports, " notes"))), schematronReport.groups.map((group, index) => /* @__PURE__ */ React.createElement("details", {
    key: index,
    className: "border-top-1px border-accent-cool-light padding-1",
    open: false
  }, /* @__PURE__ */ React.createElement("summary", null, /* @__PURE__ */ React.createElement("span", {
    className: "font-heading-sm text-secondary-light",
    style: {float: "right"}
  }, /* @__PURE__ */ React.createElement("span", {
    className: `text-${group.checks.summaryColor}`
  }, group.checks.summary)), /* @__PURE__ */ React.createElement("span", {
    className: "font-heading-lg text-primary border-base-light padding-top-1"
  }, group.title)), /* @__PURE__ */ React.createElement("ul", {
    className: "usa-icon-list margin-top-1"
  }, group.checks.checks.map((check, index2) => /* @__PURE__ */ React.createElement("li", {
    key: index2,
    className: `usa-icon-list__item padding-1 bg-${colorTokenForRole(check.role)}-lighter`
  }, /* @__PURE__ */ React.createElement("div", {
    className: `usa-icon-list__icon text-${check.icon.color}`
  }, /* @__PURE__ */ React.createElement("svg", {
    className: "usa-icon",
    "aria-hidden": "true",
    role: "img"
  }, /* @__PURE__ */ React.createElement("use", {
    xlinkHref: getAssetUrl(`uswds/img/sprite.svg#${check.icon.sprite}`)
  }))), /* @__PURE__ */ React.createElement("div", {
    className: "usa-icon-list__content"
  }, check.message, check.fired.length ? /* @__PURE__ */ React.createElement("ul", {
    className: "usa-icon-list__title"
  }, check.fired.map((firedCheck, index3) => /* @__PURE__ */ React.createElement("li", {
    key: index3
  }, firedCheck.diagnosticReferences.length > 0 ? firedCheck.diagnosticReferences.join(", ") : firedCheck.text, /* @__PURE__ */ React.createElement("a", {
    className: "usa-tooltip",
    "data-position": "bottom",
    href: getUrl(Routes.assertion({
      assertionId: firedCheck.uniqueId
    })),
    title: "Show source document context"
  }, /* @__PURE__ */ React.createElement("svg", {
    className: "usa-icon",
    "aria-hidden": "true",
    focusable: "false",
    role: "img"
  }, /* @__PURE__ */ React.createElement("use", {
    xlinkHref: getAssetUrl("uswds/img/sprite.svg#link")
  })))))) : null))))))));
};
