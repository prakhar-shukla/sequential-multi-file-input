const { src, dest, series, parallel } = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css')
const rename = require('gulp-rename');
const del = require('del');


const source = {
    js: 'src/js/*.js',
    css: 'src/css/*.css',
    html: '*.html'
}
const destination = {
    js: 'dist/js',
    css: 'dist/css',
    html: ''
}

function clean() {
    return del([destination.js])
}

function scripts() {
    return src(source.js)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe((dest(destination.js)))
}
function styles() {
    return src(source.css)
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe((dest(destination.css)))
}

exports.default = series(clean, parallel(styles, scripts))