exports.default = function ({ orig }) {
  if (orig.startsWith("from '@buf/") && !orig.endsWith(".js'")) {
    return orig.slice(0, -1) + ".js'";
  }
  return orig;
};
