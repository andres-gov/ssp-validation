import {match} from "../../../../_snowpack/pkg/path-to-regexp.js";
export var Routes;
(function(Routes2) {
  Routes2.home = {
    type: "Home"
  };
  Routes2.validator = {
    type: "Validator"
  };
  Routes2.summary = {
    type: "Summary"
  };
  Routes2.assertion = (options) => {
    return {
      type: "Assertion",
      assertionId: options.assertionId
    };
  };
  Routes2.developers = {
    type: "Developers"
  };
  Routes2.notFound = {type: "NotFound"};
})(Routes || (Routes = {}));
const RouteUrl = {
  Home: () => "#/",
  Validator: () => "#/validator",
  Summary: () => "#/summary",
  Assertion: (route) => `#/assertions/${route.assertionId}`,
  Developers: () => "#/developers"
};
export const getUrl = (route) => {
  return RouteUrl[route.type](route);
};
const matchRoute = (urlPattern, createRoute) => {
  const matcher = match(urlPattern);
  return (url) => {
    const match2 = matcher(url);
    if (match2) {
      return createRoute(match2.params);
    }
  };
};
const RouteMatch = {
  Home: matchRoute("#/", () => Routes.home),
  Validator: matchRoute("#/validator", () => Routes.validator),
  Summary: matchRoute("#/summary", () => Routes.summary),
  Assertion: matchRoute("#/assertions/:assertionId", Routes.assertion),
  Developers: matchRoute("#/developers", () => Routes.developers)
};
export const getRoute = (url) => {
  for (const routeType of Object.keys(RouteMatch)) {
    const route = RouteMatch[routeType](url);
    if (route) {
      return route;
    }
  }
  return Routes.notFound;
};
export const breadcrumbs = {
  Home: (route) => {
    return [
      {
        text: "Home",
        linkUrl: route.type !== "Home" && getUrl(Routes.home)
      }
    ];
  },
  Validator: (route) => {
    return [
      ...breadcrumbs.Home(route),
      {
        text: "Validator",
        linkUrl: route.type !== "Validator" && getUrl(Routes.home)
      }
    ];
  },
  Summary: (route) => {
    return [
      ...breadcrumbs.Home(route),
      {
        text: "Document name",
        linkUrl: route.type !== "Summary" && getUrl(Routes.summary)
      }
    ];
  },
  Assertion: (route) => {
    return [
      ...breadcrumbs.Home(route),
      {
        text: "Assertion",
        linkUrl: route.type !== "Assertion" && getUrl(Routes.assertion({assertionId: route.assertionId}))
      }
    ];
  },
  Developers: (route) => {
    return [
      ...breadcrumbs.Home(route),
      {
        text: "Developer documentation",
        linkUrl: route.type !== "Developers" && getUrl(Routes.developers)
      }
    ];
  }
};
