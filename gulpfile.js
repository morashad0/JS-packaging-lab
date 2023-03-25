const gulp = require("gulp");
//this line importing necessary packages 
const { src, dest, watch, parallel, series } = require("gulp")

//Defining a JavaScript object called globs 
//that contains file paths for HTML, CSS, images, and JS files.
var globs={
  html:"project/*.html",
  css:"project/css/**/*.css",
  img:'project/pics/*',
  js:'project/js/**/*.js'
}


//Creating a task imgMinify to minify images using the gulp-imagemin plugin.
const imagemin = require('gulp-imagemin');
function imgMinify() {
    return gulp.src(globs.img)
        .pipe(imagemin())
        // copy them to the dist/images directory
        .pipe(gulp.dest('dist/images'));
}

//Exporting the imgMinify task as the img task, it can be run by typing gulp img
exports.img = imgMinify

//Creating a task minifyHTML to minify HTML files using the gulp-htmlmin plugin.
const htmlmin = require('gulp-htmlmin');
function minifyHTML() {
    return src(globs.html)
    //using collapseWhitespace to remove spaces between the code and removeComments to remove all comments from html file
    //this are two methods in gulp-htmlmin plugin 
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        //copy them to the dist directory.
        .pipe(gulp.dest('dist'))
}

exports.html = minifyHTML

const concat = require('gulp-concat');
const terser = require('gulp-terser');

//using task jsMinify to concatenate 
//and minify JS files using the gulp-concat and gulp-terser plugins, then copy the result and the source map to the dist/assets/js directory.
function jsMinify() {
    return src(globs.js,{sourcemaps:true}) 
        .pipe(concat('all.min.js'))
        .pipe(terser())
        .pipe(dest('dist/assets/js',{sourcemaps:'.'}))
}
exports.js = jsMinify


//usnig task cssMinify to concatenate and minify CSS files using the gulp-concat and gulp-clean-css plugins, 
//then copy the result to the dist/assets/css directory.
var cleanCss = require('gulp-clean-css');
function cssMinify() {
    return src(globs.css)
        .pipe(concat('style.min.css'))
        .pipe(cleanCss())
        .pipe(dest('dist/assets/css'))
}
exports.css = cssMinify


//Creating a task serve to start a web server using the browser-sync plugin, which will serve the dist directory.
var browserSync = require('browser-sync');
function serve (cb){
  browserSync({
    server: {
      baseDir: 'dist/'
    }
  });
  cb()
}


function reloadTask(done) {
  browserSync.reload()
  done()
}

//Creating a task watchTask to watch for changes in the files defined in globs.
function watchTask() {
    watch(globs.html,series(minifyHTML, reloadTask))
    watch(globs.js,series(jsMinify, reloadTask))
    watch(globs.css, series(cssMinify,reloadTask));
    watch(globs.img, series(imgMinify,reloadTask));
}

//Exporting a default task that runs all the tasks in parallel using the parallel method 
//and starts the web server and watches for changes using the series and watchTask methods.
exports.default = series( parallel(imgMinify, jsMinify, cssMinify, minifyHTML), serve , watchTask)