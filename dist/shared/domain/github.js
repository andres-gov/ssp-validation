export const DEFAULT_REPOSITORY = {
  owner: "18F",
  repository: "fedramp-automation",
  branch: "develop"
};
const SAMPLE_SSP_PATHS = [
  "src/validations/test/demo/FedRAMP-SSP-OSCAL-Template.xml"
];
export const getBranchTreeUrl = (github, useDefaultShortForm = true) => {
  if (useDefaultShortForm && github.branch === DEFAULT_REPOSITORY.branch) {
    return `https://github.com/${github.owner}/${github.repository}`;
  }
  return `https://github.com/${github.owner}/${github.repository}/tree/${github.branch}`;
};
export const getRepositoryRawUrl = (github, repositoryPath) => {
  return `https://raw.githubusercontent.com/${github.owner}/${github.repository}/${github.branch}/${repositoryPath}`;
};
export const getSampleSSPs = (github) => {
  return SAMPLE_SSP_PATHS.map((url) => {
    const urlParts = url.split("/");
    return {
      url: getRepositoryRawUrl(github, url),
      displayName: urlParts[urlParts.length - 1]
    };
  });
};
export const getDeveloperExampleUrl = (github) => {
  const branchTree = getBranchTreeUrl(github, false);
  return `${branchTree}/src/examples`;
};
