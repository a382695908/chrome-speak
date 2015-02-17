'use strict';

var _ = require('lodash'),
	glob = require('glob'),
	path = require('path');

/**
 * App config
 */
//TODO: use path join for app/ or app and getBaseModulePattern
var appPath = './app',
	sections = {
		options: ['core', 'options'],
		popup: ['core', 'popup']
	};

/**
 * Functions
 * DO NOT MODIFY THIS
 */

function getBaseModulePattern(section) {
	if (_.has(sections, section)) {
		return appPath + '/modules/{' + sections[section].join(',') + '}';
	} else {
		return appPath + '/modules/*';
	}
}

function getJsPattern(section) {
	var basePattern = getBaseModulePattern(section);
	return [appPath + '/modules/*.js', basePattern + '/*.js', basePattern + '/*/*.js'];
}

function getStylesPattern(section, extension) {
	var basePattern = getBaseModulePattern(section);
	return [basePattern + '/styles/**.' + extension];
}

 
function getSassPattern(section) {
	return getStylesPattern(section, 'scss');
}



function getCssPattern(section) {
	return getStylesPattern(section, 'css');
}

function getGlobbedFiles(input) {
	if (typeof input === 'string') {
		return glob.sync(input);
	} else if (_.isArray(input)) {
		return _.flatten(_.map(input, getGlobbedFiles));
	} else {
		throw new Error('Invalid input file');
	}
}

function getJsFiles(section) {
	return getGlobbedFiles(getJsPattern(section));
}


function getSassFiles(section) {
	return getGlobbedFiles(getSassPattern(section));
}


function getCssFiles(section) {
	return getGlobbedFiles(getCssPattern(section));
}

function relativeToApp(input){
	if (typeof input === 'string'){
		return path.relative(appPath, input);
	} else if (_.isArray(input)) {
		return _.map(input, relativeToApp);
	} else {
		throw new Error('Invalid input type');
	}
}

module.exports = {
	appPath: appPath,
	sections: sections,
	getJsPattern: getJsPattern,
	getCssPattern: getCssPattern,
	getSassPattern: getSassPattern, 
	getJsFiles: getJsFiles,
	getCssFiles: getCssFiles,
	 getSassFiles: getSassFiles, 
	relativeToApp: relativeToApp,
};
