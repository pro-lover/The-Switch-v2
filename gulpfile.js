const fs 		= require('fs');
const path 		= require('path');
const del		= require('del');
const gulp		= require('gulp');
const gutil		= require('gulp-util');

const buildDir = './dist/bapp-backend';
const buildApiDir = './dist/bapp-backend/api';
const buildDashboardDir = './dist/bapp-dashboard';

/**
 * Clean Server/API distribution folder
 *
 */
 function cleanDist ( done ) {
	del.sync(buildDir);
	done();
}


/**
 * Copy Server/API to distribution folder
 *
 */
function copyServerFilesApi () {
	return gulp.src([
				'api/**/*.+(js|js|yaml|json|html)'
			])
			.pipe(gulp.dest(buildApiDir));
}

function copyServerFilesRoot () {
	return gulp.src([
				'server.js',
				'package.json'
			])
			.pipe(gulp.dest(buildDir));
}

function copyHtaccess () {
	return gulp.src([
				'.htaccess'
			])
			.pipe(gulp.dest(buildDashboardDir));
}

function copWebWorkers () {
	return gulp.src([
				'src/gif.worker.js'
			])
			.pipe(gulp.dest(buildDashboardDir));
}

function copyFavicons () {
	return gulp.src([
				'src/*.+(png|ico)',
				'src/manifest.json',
				'src/browserconfig.xml'
			])
			.pipe(gulp.dest(buildDashboardDir));
}

let prebuild = gulp.series(
	cleanDist
);

let buildProdAPI = gulp.series(
	copyServerFilesApi,
	copyServerFilesRoot
);

let buildProdApp = gulp.series(
	copyHtaccess,
	copWebWorkers,
	copyFavicons
);

exports.buildapi = gulp.series(
	prebuild,
	buildProdAPI );

exports.buildapp = gulp.series(
	//prebuild,
	buildProdApp );
