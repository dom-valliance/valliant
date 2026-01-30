module.exports = function (options, webpack) {
  return {
    ...options,
    externals: [],
    output: {
      ...options.output,
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    },
  };
};
