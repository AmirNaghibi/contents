var pkg = require('./package.json'),
    karma = require('karma').server,
    gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    header = require('gulp-header'),
    jshint = require('gulp-jshint'),
    jsdoc = require('gulp-jsdoc'),
    browserify = require('gulp-browserify'),
    fs = require('fs'),
    del = require('del'),
    exec = require('child_process').exec;

gulp.task('lint', function () {
    return gulp
        .src('./src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('clean', ['lint'], function (cb) {
    del(['dist'], cb);
});

gulp.task('bundle', ['clean'], function () {
    return gulp
        .src('./src/contents.js')
        .pipe(browserify({
            //debug : true
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('version', ['bundle'], function () {
    var bower = require('./bower.json');

    gulp
        .src('./dist/contents.js')
        .pipe(header('/**\n* @version <%= version %>\n* @link https://github.com/gajus/contents for the canonical source repository\n* @license https://github.com/gajus/contents/blob/master/LICENSE BSD 3-Clause\n*/\n', {version: pkg.version}))
        .pipe(gulp.dest('./dist/'))
        .pipe(uglify())
        .pipe(rename('contents.min.js'))
        .pipe(header('/**\n* @version <%= version %>\n* @link https://github.com/gajus/contents for the canonical source repository\n* @license https://github.com/gajus/contents/blob/master/LICENSE BSD 3-Clause\n*/\n', {version: pkg.version}))
        .pipe(gulp.dest('./dist/'));

    bower.name = pkg.name;
    bower.description = pkg.description;
    bower.version = pkg.version;
    bower.keywords = pkg.keywords;

    fs.writeFile('./bower.json', JSON.stringify(bower, null, 4));
});

gulp.task('readme', function () {
    exec('ruby ./.readme/github_toc.rb ./.readme/README.md ./README.md', {cwd: __dirname});
});

gulp.task('watch', function () {
    gulp.watch('./src/*', ['default']);
    gulp.watch('./.readme/README.md', ['readme']);
});

gulp.task('travis', ['default'], function (cb) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, cb);
});

gulp.task('default', ['version']);