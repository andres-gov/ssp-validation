export const browserController = ({
  importMetaHot,
  renderApp
}) => {
  renderApp();
  if (importMetaHot) {
    importMetaHot.accept();
  }
};
