import {
  createSchematronMachine
} from "./schematron-machine.js";
import {createRouterMachine} from "./router-machine.js";
export const state = {
  baseUrl: "",
  router: createRouterMachine(),
  sourceRepository: {
    sampleSSPs: []
  },
  schematron: createSchematronMachine()
};
