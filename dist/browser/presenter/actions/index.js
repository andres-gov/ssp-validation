export * as schematron from "./schematron.js";
export * as validator from "./validator.js";
import * as router from "../state/router.js";
export const onInitializeOvermind = ({actions, effects}) => {
  actions.setCurrentRoute(window.location.hash);
  effects.location.listen((url) => {
    actions.setCurrentRoute(url);
  });
  actions.schematron.initialize();
};
export const setCurrentRoute = ({effects, state}, url) => {
  const route = router.getRoute(url);
  if (route.type !== "NotFound") {
    state.router.send("ROUTE_CHANGED", {route});
  }
  effects.location.replace(router.getUrl(state.router.currentRoute));
};
export const getAssetUrl = ({state}, assetPath) => {
  return `${state.baseUrl}/${assetPath}`;
};
