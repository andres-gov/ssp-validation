export const initialize = ({effects, state}) => {
  Promise.all([
    effects.useCases.getAssertionViews(),
    effects.useCases.getSSPSchematronAssertions()
  ]).then(([assertionViews, schematronAsserts]) => {
    state.schematron.send("CONFIG_LOADED", {
      config: {
        assertionViews,
        schematronAsserts
      }
    });
  });
};
export const setFilterRole = ({state}, role) => {
  state.schematron.send("FILTER_ROLE_CHANGED", {role});
};
export const setFilterText = ({state}, text) => {
  state.schematron.send("FILTER_TEXT_CHANGED", {text});
};
export const setFilterAssertionView = ({state}, assertionViewId) => {
  state.schematron.send("FILTER_ASSERTION_VIEW_CHANGED", {assertionViewId});
};
