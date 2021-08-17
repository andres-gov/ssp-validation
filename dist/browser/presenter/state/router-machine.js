import {derived, statemachine} from "../../../../_snowpack/pkg/overmind.js";
import * as router from "./router.js";
export const routerMachine = statemachine({
  VALID_PAGE: {
    ROUTE_CHANGED: ({route}) => {
      return {
        current: "VALID_PAGE",
        currentRoute: route
      };
    }
  }
});
export const createRouterMachine = () => {
  return routerMachine.create({current: "VALID_PAGE"}, {
    currentRoute: router.Routes.home,
    breadcrumbs: derived((state) => {
      const what = router.breadcrumbs[state.currentRoute.type];
      const test = what(state.currentRoute);
      return test;
    })
  });
};
