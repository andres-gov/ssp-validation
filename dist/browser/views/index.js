import "../../../_snowpack/pkg/uswds.js";
import {Provider} from "../../../_snowpack/pkg/overmind-react.js";
import React from "../../../_snowpack/pkg/react.js";
import ReactDOM from "../../../_snowpack/pkg/react-dom.js";
import {App} from "./components/App.js";
import "./index.css.proxy.js";
export const createAppRenderer = (rootElement, presenter) => () => {
  ReactDOM.render(/* @__PURE__ */ React.createElement(React.StrictMode, null, /* @__PURE__ */ React.createElement(Provider, {
    value: presenter
  }, /* @__PURE__ */ React.createElement(App, null))), rootElement);
};
