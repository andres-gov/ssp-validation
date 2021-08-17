export const ValidateSSPUseCase = (ctx) => (oscalXmlString) => {
  return ctx.generateSchematronValidationReport(oscalXmlString);
};
export const ValidateSSPUrlUseCase = (ctx) => (xmlUrl) => {
  let xmlText;
  return ctx.fetch(xmlUrl).then((response) => response.text()).then((text) => {
    xmlText = text;
    return xmlText;
  }).then(ctx.generateSchematronValidationReport).then((validationReport) => {
    return {
      validationReport,
      xmlText
    };
  });
};
