import * as __SNOWPACK_ENV__ from '../_snowpack/env.js';
import.meta.env = __SNOWPACK_ENV__;

import {runBrowserContext} from "./browser/index.js";
runBrowserContext({
  element: document.getElementById("root"),
  baseUrl: __SNOWPACK_ENV__.BASEURL,
  debug: true,
  importMetaHot: undefined /* [snowpack] import.meta.hot */ ,
  githubRepository: __SNOWPACK_ENV__.GITHUB
});
