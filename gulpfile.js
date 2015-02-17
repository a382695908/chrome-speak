'use strict';

var gulp = require('gulp'),
	config = require('./config'),
	htmlreplace = require('gulp-html-replace'),
	rename = require('gulp-rename'),
	 sass = require('gulp-ruby-sass'), 
	_ = require('lodash'),
	wiredep = require('wiredep').stream,
	path = require('path'),
	gwatch = require('gulp-watch');

function watch(expr, tasks, callback){
             console.log('STARTING WATCH', expr);
             if (_.isArray(tasks)) {
                          return  gwatch(expr, function(){
                                       gulp.start(tasks);
                                       if (typeof callback === 'function') {
                                                    callback.apply(this, arguments);
                                       }
                          });
             } else {
                          return gwatch(expr, callback);
             }
}

function getBuild(section) {
	//TODO: not dependency in a section
	return function buildSpecific() {
		var cssFiles = config.relativeToApp(config.getCssFiles(section)),
			jsFiles = config.relativeToApp(config.getJsFiles(section));

		console.log('BUILD STARTED', cssFiles, jsFiles);

		return gulp.src(path.join(config.appPath, section + '.ejs'))
			.pipe(htmlreplace({
				'css': cssFiles,
				'js': jsFiles
			}))
			.pipe(wiredep())
			.pipe(rename(function(path) {
				path.extname = '.html';
			}))
			.pipe(gulp.dest(config.appPath));
	};
}


	function getSass(section) {
		return function sassSpecific() {
			return gulp.src(config.getSassPattern(section))
				.pipe(sass())
				.on('error', function(err) {
					console.error(err.message);
				})
				.pipe(gulp.dest(path.join(config.appPath, 'modules/')));
		};
	} 

function prepend(str) {
	return function(item) {
		return str + item;
	};
}

_.forIn(config.sections, function(deps, section) {
	gulp.task('build:' + section, getBuild(section));  gulp.task('sass:' + section, getSass(section)); 
});



gulp.task('watch', function() {
	var sections = Object.keys(config.sections);

	//TODO: remove common files
	_.forIn(config.sections, function(deps, section) {
		watch(_.union([path.join(config.appPath, section + '.ejs')], config.getJsPattern(section)), ['build:' + section]);

		 watch(config.getSassPattern(section), ['sass:' + section, 'build:' + section]); 
	});

	watch('bower.json', _.map(sections, prepend('build:')));
});

gulp.task('build', _.map(Object.keys(config.sections), prepend('build:')));

gulp.task('default', ['watch']);
