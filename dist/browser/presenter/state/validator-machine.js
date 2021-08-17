import {derived, statemachine} from "../../../../_snowpack/pkg/overmind.js";
export const validatorMachine = statemachine({
  PROCESSING_ERROR: {
    RESET: () => {
      return {
        current: "UNLOADED"
      };
    }
  },
  VALIDATED: {
    RESET: () => {
      return {
        current: "UNLOADED"
      };
    }
  },
  UNLOADED: {
    PROCESSING_URL: ({xmlFileUrl}) => {
      return {
        current: "PROCESSING",
        message: `Processing ${xmlFileUrl}...`
      };
    },
    PROCESSING_STRING: ({fileName}) => {
      return {
        current: "PROCESSING",
        message: `Processing local file...`
      };
    },
    PROCESSING_ERROR: () => {
    }
  },
  PROCESSING: {
    PROCESSING_ERROR: ({errorMessage}) => {
      return {
        current: "PROCESSING_ERROR",
        errorMessage
      };
    },
    VALIDATED: ({validationReport, xmlText}) => {
      return {
        current: "VALIDATED",
        validationReport,
        annotatedSSP: "",
        xmlText
      };
    }
  }
});
export const createValidatorMachine = () => {
  return validatorMachine.create({current: "UNLOADED"}, {
    assertionsById: derived((state) => {
      const validatedState = state.matches("VALIDATED");
      if (!validatedState) {
        return {};
      }
      return validatedState.validationReport.failedAsserts.reduce((acc, assert) => {
        if (acc[assert.id] === void 0) {
          acc[assert.id] = [];
        }
        acc[assert.id].push(assert);
        return acc;
      }, {});
    })
  });
};
