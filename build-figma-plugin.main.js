module.exports = function (buildOptions) {
	const options = {
		...buildOptions,
	};
	delete options.manifest;
	return options;
};
