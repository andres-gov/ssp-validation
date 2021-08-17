import * as github from "../shared/domain/github.js";
import {AnnotateXMLUseCase} from "../shared/use-cases/annotate-xml.js";
import {
  ValidateSSPUseCase,
  ValidateSSPUrlUseCase
} from "../shared/use-cases/validate-ssp-xml.js";
import {highlightXML} from "../shared/adapters/highlight-js.js";
import {SaxonJsSchematronValidatorGateway} from "../shared/adapters/saxon-js-gateway.js";
import {browserController} from "./browser-controller.js";
import {createPresenter} from "./presenter/index.js";
import {createAppRenderer} from "./views/index.js";
export const runBrowserContext = ({
  element,
  baseUrl,
  debug,
  importMetaHot,
  githubRepository
}) => {
  const generateSchematronValidationReport = SaxonJsSchematronValidatorGateway({
    sefUrl: `${baseUrl}/ssp.sef.json`,
    SaxonJS: window.SaxonJS,
    baselinesBaseUrl: `${baseUrl}/baselines`,
    registryBaseUrl: `${baseUrl}/xml`
  });
  browserController({
    importMetaHot,
    renderApp: createAppRenderer(element, createPresenter({
      debug,
      baseUrl,
      sourceRepository: {
        treeUrl: github.getBranchTreeUrl(githubRepository),
        sampleSSPs: github.getSampleSSPs(githubRepository),
        developerExampleUrl: github.getDeveloperExampleUrl(githubRepository)
      },
      location: {
        listen: (listener) => {
          window.addEventListener("hashchange", (event) => {
            listener(`#${event.newURL.split("#")[1]}`);
          });
        },
        replace: (url) => window.history.replaceState(null, "", url)
      },
      useCases: {
        annotateXML: AnnotateXMLUseCase({
          xml: {
            formatXML: highlightXML,
            indentXml: (s) => Promise.resolve(s)
          },
          SaxonJS: window.SaxonJS
        }),
        getAssertionViews: async () => fetch(`${baseUrl}/assertion-views.json`).then((response) => response.json()),
        getSSPSchematronAssertions: async () => fetch(`${baseUrl}/ssp.json`).then((response) => response.json()),
        validateSSP: ValidateSSPUseCase({
          generateSchematronValidationReport
        }),
        validateSSPUrl: ValidateSSPUrlUseCase({
          generateSchematronValidationReport,
          fetch: window.fetch.bind(window)
        })
      }
    }))
  });
};
