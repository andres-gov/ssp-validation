import {derived, statemachine} from "../../../../_snowpack/pkg/overmind.js";
import {createValidatorMachine} from "./validator-machine.js";
const checkCircleIcon = {sprite: "check_circle", color: "green"};
const navigateNextIcon = {sprite: "navigate_next", color: "blue"};
const cancelIcon = {
  sprite: "cancel",
  color: "red"
};
const schematronMachine = statemachine({
  UNINITIALIZED: {
    CONFIG_LOADED: ({config}) => {
      return {
        current: "INITIALIZED",
        config
      };
    }
  },
  INITIALIZED: {
    FILTER_TEXT_CHANGED: ({text}, state) => {
      return {
        current: "INITIALIZED",
        config: state.config,
        filter: {
          role: state.filter.role,
          text,
          assertionViewId: state.filter.assertionViewId
        }
      };
    },
    FILTER_ROLE_CHANGED: ({role}, state) => {
      return {
        current: "INITIALIZED",
        config: state.config,
        filter: {
          role,
          text: state.filter.text,
          assertionViewId: state.filter.assertionViewId
        }
      };
    },
    FILTER_ASSERTION_VIEW_CHANGED: ({assertionViewId}, state) => {
      return {
        current: "INITIALIZED",
        config: state.config,
        filter: {
          ...state.filter,
          assertionViewId
        }
      };
    }
  }
});
export const createSchematronMachine = () => {
  return schematronMachine.create({current: "UNINITIALIZED"}, {
    config: {
      assertionViews: [],
      schematronAsserts: []
    },
    _assertionsById: derived((state) => {
      const assertions = {};
      state._schematronChecksFiltered.forEach((assert) => {
        assertions[assert.id] = assert;
      });
      return assertions;
    }),
    filter: {
      role: "all",
      text: "",
      assertionViewId: 0
    },
    filterOptions: derived((state) => {
      return {
        assertionViews: state.config.assertionViews.map((view, index) => {
          return {
            id: index,
            title: view.title
          };
        }),
        roles: [
          "all",
          ...Array.from(new Set(state.config.schematronAsserts.map((assert) => assert.role))).sort()
        ]
      };
    }),
    schematronReport: derived(({
      _assertionsById,
      _schematronChecksFiltered,
      config,
      filter,
      filterOptions,
      validator
    }) => {
      const assertionView = filterOptions.assertionViews.filter((view) => view.id === filter.assertionViewId).map(() => {
        return config.assertionViews[filter.assertionViewId];
      })[0] || {
        title: "",
        groups: []
      };
      const isValidated = validator.current === "VALIDATED";
      const reportCount = _schematronChecksFiltered.filter((c) => c.isReport).length;
      return {
        summary: {
          title: isValidated ? "FedRAMP Package Concerns" : "FedRAMP Package Concerns (unprocessed)",
          counts: {
            assertions: _schematronChecksFiltered.length - reportCount,
            reports: reportCount
          }
        },
        groups: assertionView.groups.map((assertionGroup) => {
          const checks = assertionGroup.assertionIds.map((assertionGroupAssert) => {
            const assert = _assertionsById[assertionGroupAssert];
            if (!assert) {
              return null;
            }
            const fired = validator.assertionsById[assert.id] || [];
            return {
              ...assert,
              icon: !isValidated ? navigateNextIcon : fired.length ? cancelIcon : checkCircleIcon,
              fired
            };
          }).filter((assert) => assert !== null);
          const firedCount = checks.filter((assert) => assert.fired.length > 0).length;
          return {
            title: assertionGroup.title,
            checks: {
              summary: (() => {
                if (isValidated) {
                  return `${firedCount} / ${checks.length} triggered`;
                } else {
                  return `${checks.length} checks`;
                }
              })(),
              summaryColor: firedCount === 0 ? "green" : "red",
              checks
            }
          };
        })
      };
    }),
    _schematronChecksFiltered: derived(({config, filter, filterOptions}) => {
      const filterRoles = filter.role === "all" ? filterOptions.roles : filter.role;
      let assertions = config.schematronAsserts.filter((assertion) => {
        return filterRoles.includes(assertion.role || "");
      });
      if (filter.text.length > 0) {
        assertions = assertions.filter((assert) => {
          const searchText = assert.message.toLowerCase();
          return searchText.includes(filter.text.toLowerCase());
        });
      }
      return assertions;
    }),
    validator: createValidatorMachine()
  });
};
