import hljs from "../../../_snowpack/pkg/highlightjs/lib/core.js";
import xml from "../../../_snowpack/pkg/highlightjs/lib/languages/xml.js";
hljs.registerLanguage("xml", xml);
export const highlightXML = (xmlString) => {
  return hljs.highlight(xmlString, {
    language: "xml"
  }).value;
};
