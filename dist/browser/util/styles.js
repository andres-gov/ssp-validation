export const colorTokenForRole = (role) => {
  const roleLower = (role || "").toLowerCase();
  if (roleLower.includes("warn")) {
    return "warning";
  }
  if (roleLower.includes("error") || roleLower.includes("fatal")) {
    return "error";
  }
  return "info";
};
