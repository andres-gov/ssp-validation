import {createOvermind, createOvermindMock} from "../../../_snowpack/pkg/overmind.js";
import * as actions from "./actions/index.js";
import {state} from "./state/index.js";
export const getPresenterConfig = (location, useCases, initialState = {}) => {
  return {
    actions,
    state: {
      ...state,
      ...initialState
    },
    effects: {
      location,
      useCases
    }
  };
};
export const createPresenter = (ctx) => {
  const presenter = createOvermind(getPresenterConfig(ctx.location, ctx.useCases, {
    baseUrl: ctx.baseUrl,
    sourceRepository: ctx.sourceRepository
  }), {
    devtools: ctx.debug,
    strict: true
  });
  return presenter;
};
const getUseCasesShim = () => {
  const stub = jest.fn();
  return {
    annotateXML: stub,
    getAssertionViews: stub,
    getSSPSchematronAssertions: stub,
    validateSSP: stub,
    validateSSPUrl: stub
  };
};
export const createPresenterMock = (ctx = {}) => {
  const presenter = createOvermindMock(getPresenterConfig({listen: jest.fn(), replace: jest.fn()}, getUseCasesShim(), ctx.initialState), {
    useCases: ctx.useCases
  });
  return presenter;
};
