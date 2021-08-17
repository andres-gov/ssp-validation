import React from "../../../../_snowpack/pkg/react.js";
import {useAppState} from "../hooks.js";
import {Banner} from "./Banner.js";
import {DevelopersPage} from "./DevelopersPage.js";
import {Footer} from "./Footer.js";
import {Header} from "./Header.js";
import {HomePage} from "./HomePage.js";
import {InnerPageLayout} from "./InnerPageLayout.js";
import {SummaryPage} from "./SummaryPage.js";
import {ValidatorPage} from "./ValidatorPage.js";
import {ViewerPage} from "./ViewerPage.js";
const CurrentPage = () => {
  const {currentRoute} = useAppState().router;
  if (currentRoute.type === "Home") {
    return /* @__PURE__ */ React.createElement(HomePage, null);
  } else if (currentRoute.type === "Validator") {
    return /* @__PURE__ */ React.createElement(InnerPageLayout, null, /* @__PURE__ */ React.createElement(ValidatorPage, null));
  } else if (currentRoute.type === "Summary") {
    return /* @__PURE__ */ React.createElement(InnerPageLayout, null, /* @__PURE__ */ React.createElement(SummaryPage, null));
  } else if (currentRoute.type === "Assertion") {
    return /* @__PURE__ */ React.createElement(InnerPageLayout, null, /* @__PURE__ */ React.createElement(ViewerPage, {
      assertionId: currentRoute.assertionId
    }));
  } else if (currentRoute.type === "Developers") {
    return /* @__PURE__ */ React.createElement(InnerPageLayout, null, /* @__PURE__ */ React.createElement(DevelopersPage, null));
  } else {
    const _exhaustiveCheck = currentRoute;
    return /* @__PURE__ */ React.createElement(React.Fragment, null);
  }
};
export const App = () => {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Banner, null), /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement("div", {
    className: "grid-container"
  }, /* @__PURE__ */ React.createElement(CurrentPage, null)), /* @__PURE__ */ React.createElement(Footer, null));
};
