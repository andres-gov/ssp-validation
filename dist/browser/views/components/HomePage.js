import React from "../../../../_snowpack/pkg/react.js";
import {getUrl, Routes} from "../../presenter/state/router.js";
import {useActions} from "../hooks.js";
export const HomePage = () => {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(HomeContent, null), /* @__PURE__ */ React.createElement(PartiesGrid, null));
};
const ProcessList = () => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", null, "How does it work?"), /* @__PURE__ */ React.createElement("ol", {
  className: "usa-process-list"
}, /* @__PURE__ */ React.createElement("li", {
  className: "usa-process-list__item padding-bottom-4"
}, /* @__PURE__ */ React.createElement("h4", {
  className: "usa-process-list__heading line-height-sans-1"
}, "Submit with confidence"), /* @__PURE__ */ React.createElement("p", {
  className: "margin-top-1 text-light"
}, "Creation of compliant FedRAMP OSCAL System Security Plans is enhanced with timely and context-sensitive validation errors.")), /* @__PURE__ */ React.createElement("li", {
  className: "usa-process-list__item padding-bottom-4"
}, /* @__PURE__ */ React.createElement("h4", {
  className: "usa-process-list__heading line-height-sans-1"
}, "Streamlined FedRAMP Review"), /* @__PURE__ */ React.createElement("p", {
  className: "margin-top-1 text-light"
}, "High-quality submissions lead to efficient FedRAMP audit reviews. Additionally, FedRAMP Audit Review Team efforts are further streamlined by a friendly presentation of complex business rule validations.")), /* @__PURE__ */ React.createElement("li", {
  className: "usa-process-list__item"
}, /* @__PURE__ */ React.createElement("h4", {
  className: "usa-process-list__heading line-height-sans-1"
}, "Lower-cost agency ATO"), /* @__PURE__ */ React.createElement("p", {
  className: "margin-top-1 text-light"
}, "FedRAMP-approved Cloud Service Providers (CSPs) with structured OSCAL System Security Plans are more cost-effective for agencies to evaluate as part of their own Approval To Operate (ATO) process."))));
const PartiesGrid = () => {
  const {getAssetUrl} = useActions();
  return /* @__PURE__ */ React.createElement("div", {
    className: "grid-container"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "grid-row"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "desktop:grid-col-12"
  }, /* @__PURE__ */ React.createElement("h2", {
    className: "text-center"
  }, "Who will use the SSP Validator?", /* @__PURE__ */ React.createElement("br", null), "Our stakeholders are:"))), /* @__PURE__ */ React.createElement("div", {
    className: "grid-row"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "desktop:grid-col-4"
  }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("img", {
    className: "float-left margin-2",
    src: getAssetUrl("partners-cloud.svg"),
    alt: ""
  }), /* @__PURE__ */ React.createElement("h3", null, "Cloud Service Providers"), /* @__PURE__ */ React.createElement("p", {
    className: "margin-bottom-4"
  }, "Submit your FedRAMP-compliant OSCAL System Security Plan with confidence."))), /* @__PURE__ */ React.createElement("div", {
    className: "desktop:grid-col-4"
  }, /* @__PURE__ */ React.createElement("img", {
    className: "float-left margin-2",
    src: getAssetUrl("partners-assessors.svg"),
    alt: ""
  }), /* @__PURE__ */ React.createElement("h3", null, "FedRAMP Reviewers"), /* @__PURE__ */ React.createElement("p", {
    className: "margin-bottom-4"
  }, "Evaluate CSP submissions with an efficient workflow.", " ", /* @__PURE__ */ React.createElement("a", {
    href: getUrl(Routes.developers)
  }, "Read more..."))), /* @__PURE__ */ React.createElement("div", {
    className: "desktop:grid-col-4"
  }, /* @__PURE__ */ React.createElement("img", {
    className: "float-left margin-2",
    src: getAssetUrl("partners-agencies.svg"),
    alt: ""
  }), /* @__PURE__ */ React.createElement("h3", null, "Federal Agencies"), /* @__PURE__ */ React.createElement("p", {
    className: "margin-bottom-4"
  }, "Evaluate FedRAMP-approved cloud service providers with the aid of structured OSCAL documentation."))));
};
const HomeContent = () => {
  return /* @__PURE__ */ React.createElement("div", {
    className: "usa-prose padding-top-3"
  }, /* @__PURE__ */ React.createElement("h1", null, "Accelerate approvals"), /* @__PURE__ */ React.createElement("p", null, "Welcome to Automated Security Authorization Processing (ASAP), the upcoming FedRAMP audit validation tool. Funded by", " ", /* @__PURE__ */ React.createElement("a", {
    href: "https://10x.gsa.gov/"
  }, "10x"), ", ASAP is comprised of the following components:"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", {
    href: "https://pages.nist.gov/OSCAL/"
  }, "Open Security Controls Assessment Language (OSCAL)"), " ", "validation rules written in", " ", /* @__PURE__ */ React.createElement("a", {
    href: "https://schematron.com/"
  }, "Schematron"), " format"), /* @__PURE__ */ React.createElement("li", null, "This user interface, which will apply validations to a FedRAMP OSCAL System Security Plan and display validation errors in-browser.", " ", /* @__PURE__ */ React.createElement("a", {
    href: getUrl(Routes.validator)
  }, "Try it out"), "."), /* @__PURE__ */ React.createElement("li", null, "Compiled Schematron rules (XSLT), which may be integrated with third-party OSCAL creation/validation tools. Read our", " ", /* @__PURE__ */ React.createElement("a", {
    href: getUrl(Routes.developers)
  }, "developer documentation"), " for more information.")), /* @__PURE__ */ React.createElement(ProcessList, null), /* @__PURE__ */ React.createElement("h2", null, "Why should I care?"), /* @__PURE__ */ React.createElement("p", null, "FedRAMP audit approvals are expensive for both FedRAMP and CSPs (Cloud Service Providers). The ASAP validation tool helps CSPs craft correct System Security Plans, and helps the FedRAMP Audit Review Team evaluate them efficiently."), /* @__PURE__ */ React.createElement("h2", null, "What's next?"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, "User feedback"), /* @__PURE__ */ React.createElement("li", null, "In addition to SSP, support for Plan of Actions and Milestones (POA&M), Security Assessment Plan (SAP), and Security Assessment Report (SAR) validations")), /* @__PURE__ */ React.createElement("h2", null, "Contact us"), /* @__PURE__ */ React.createElement("p", null, "Please give us your feedback via a", " ", /* @__PURE__ */ React.createElement("a", {
    href: "https://github.com/GSA/fedramp-automation/issues"
  }, "Github issue"), "."));
};
