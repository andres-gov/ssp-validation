import React from "../../../../_snowpack/pkg/react.js";
import {useActions, useAppState} from "../hooks.js";
import {onFileInputChangeGetFile} from "../../util/file-input.js";
import {colorTokenForRole} from "../../util/styles.js";
import {SchematronReport} from "./SchematronReport.js";
export const ValidatorPage = () => {
  const {sourceRepository, schematron} = useAppState();
  const actions = useActions();
  return /* @__PURE__ */ React.createElement("div", {
    className: "grid-row grid-gap"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "mobile:grid-col-12 tablet:grid-col-4"
  }, /* @__PURE__ */ React.createElement("label", {
    className: "usa-label",
    htmlFor: "file-input-specific"
  }, "FedRAMP OSCAL SSP document"), /* @__PURE__ */ React.createElement("span", {
    className: "usa-hint",
    id: "file-input-specific-hint"
  }, "Select XML file"), /* @__PURE__ */ React.createElement("input", {
    id: "file-input-specific",
    className: "usa-file-input",
    type: "file",
    name: "file-input-specific",
    "aria-describedby": "file-input-specific-hint",
    accept: ".xml",
    onChange: onFileInputChangeGetFile((fileDetails) => {
      actions.validator.setXmlContents({
        fileName: fileDetails.name,
        xmlContents: fileDetails.text
      });
    }),
    disabled: schematron.validator.current === "PROCESSING"
  }), /* @__PURE__ */ React.createElement("div", {
    className: "margin-y-1"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "usa-hint"
  }, "Or use an example file, brought to you by FedRAMP:"), /* @__PURE__ */ React.createElement("ul", null, sourceRepository.sampleSSPs.map((sampleSSP, index) => /* @__PURE__ */ React.createElement("li", {
    key: index
  }, /* @__PURE__ */ React.createElement("button", {
    className: "usa-button usa-button--unstyled",
    onClick: () => actions.validator.setXmlUrl(sampleSSP.url),
    disabled: schematron.validator.current === "PROCESSING"
  }, sampleSSP.displayName))))), /* @__PURE__ */ React.createElement("form", {
    className: "usa-form"
  }, /* @__PURE__ */ React.createElement("fieldset", {
    className: "usa-fieldset"
  }, /* @__PURE__ */ React.createElement("legend", {
    className: "usa-legend usa-legend"
  }, "Select an assertion view"), /* @__PURE__ */ React.createElement("div", {
    className: "usa-radio"
  }, schematron.filterOptions.assertionViews.map((assertionView) => /* @__PURE__ */ React.createElement("div", {
    key: assertionView.id
  }, /* @__PURE__ */ React.createElement("input", {
    className: "usa-radio__input usa-radio__input--tile",
    id: `assertion-view-${assertionView.id}`,
    type: "radio",
    name: "assertion-view",
    value: assertionView.id,
    checked: schematron.filter.assertionViewId === assertionView.id,
    onChange: () => actions.schematron.setFilterAssertionView(assertionView.id)
  }), /* @__PURE__ */ React.createElement("label", {
    className: "usa-radio__label",
    htmlFor: `assertion-view-${assertionView.id}`
  }, assertionView.title)))), /* @__PURE__ */ React.createElement("div", {
    className: "usa-search usa-search--small",
    role: "search"
  }, /* @__PURE__ */ React.createElement("label", {
    className: "usa-sr-only",
    htmlFor: "search-field"
  }, "Search"), /* @__PURE__ */ React.createElement("div", {
    className: "usa-input-group"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "usa-input-prefix",
    "aria-hidden": "true"
  }, /* @__PURE__ */ React.createElement("svg", {
    "aria-hidden": "true",
    role: "img",
    focusable: "false",
    className: "usa-icon"
  }, /* @__PURE__ */ React.createElement("use", {
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    xlinkHref: actions.getAssetUrl("uswds/img/sprite.svg#search")
  }))), /* @__PURE__ */ React.createElement("input", {
    id: "search-field",
    type: "search",
    className: "usa-input",
    autoComplete: "off",
    onChange: (event) => {
      let text = "";
      if (event && event.target) {
        text = event.target.value;
      }
      actions.schematron.setFilterText(text);
    },
    placeholder: "Search text..."
  }))), /* @__PURE__ */ React.createElement("div", {
    className: "usa-radio"
  }, schematron.filterOptions.roles.map((filterRole, index) => /* @__PURE__ */ React.createElement("div", {
    key: index
  }, /* @__PURE__ */ React.createElement("input", {
    className: "usa-radio__input usa-radio__input--tile",
    id: `role-${filterRole}`,
    type: "radio",
    name: "role",
    value: filterRole,
    checked: schematron.filter.role === filterRole,
    onChange: () => actions.schematron.setFilterRole(filterRole)
  }), /* @__PURE__ */ React.createElement("label", {
    className: `usa-radio__label bg-${colorTokenForRole(filterRole)}-lighter`,
    htmlFor: `role-${filterRole}`
  }, /* @__PURE__ */ React.createElement("svg", {
    "aria-hidden": "true",
    role: "img",
    focusable: "false",
    className: "usa-icon usa-icon--size-3 margin-right-1 margin-bottom-neg-2px"
  }, /* @__PURE__ */ React.createElement("use", {
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    xlinkHref: actions.getAssetUrl(`uswds/img/sprite.svg#${colorTokenForRole(filterRole)}`)
  })), filterRole || "<not specified>"))))))), /* @__PURE__ */ React.createElement("div", {
    className: "mobile:grid-col-12 tablet:grid-col-8"
  }, /* @__PURE__ */ React.createElement(SchematronReport, null), schematron.validator.current === "PROCESSING" && /* @__PURE__ */ React.createElement("div", {
    className: "loader"
  })));
};
