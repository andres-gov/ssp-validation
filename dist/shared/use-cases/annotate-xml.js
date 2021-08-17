const spanWrapAssertionContexts = (highlightedXml) => {
  const assertionStart = /<span class="hljs-comment">&lt;!--ASSERTION-START:(.*?):ASSERTION-START--&gt;<\/span>/gm;
  const assertionEnd = /<span class="hljs-comment">&lt;!--ASSERTION-END:(.*?):ASSERTION-END--&gt;<\/span>/gm;
  return highlightedXml.replaceAll(assertionStart, (_, assertionId) => {
    return `<span id="${assertionId}">`;
  }).replaceAll(assertionEnd, "</span>");
};
export const AnnotateXMLUseCase = (ctx) => async (options) => {
  const doc = ctx.SaxonJS.getPlatform().parseXmlFromString(options.xmlString);
  for (let i = 0; i < options.annotations.length; i++) {
    const annotation = options.annotations[i];
    let xmlContext = ctx.SaxonJS.XPath.evaluate(annotation.xpath, doc, {
      namespaceContext: {svrl: "http://purl.oclc.org/dsdl/svrl"},
      resultForm: "array"
    });
    const node = xmlContext[0];
    if (node && node.parentNode) {
      node.parentNode.insertBefore(doc.createComment(`ASSERTION-START:${annotation.uniqueId}:ASSERTION-START`), node);
      node.parentNode.insertBefore(doc.createComment(`ASSERTION-END:${annotation.uniqueId}:ASSERTION-END`), node.nextSibling);
    }
  }
  const xmlString = ctx.SaxonJS.serialize(doc);
  const formattedXml = ctx.xml.formatXML(await ctx.xml.indentXml(xmlString));
  return spanWrapAssertionContexts(formattedXml);
};
