var gulp = require('gulp');
var bower = require('gulp-bower');
var debug = require('gulp-debug');
var newer = require('gulp-newer');
var merge = require('merge-stream');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');
var babel = require('gulp-babel');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');


var app_base = './app';
var paths = {
  scripts: app_base + '/js',
  styles: app_base + '/less',
  html: app_base,
  maps: app_base + '/maps'
};

var target_base = './target';
var target = {
  scripts: target_base + '/assets/js',
  styles: target_base + '/assets/css',
  fonts: target_base + '/assets/fonts',
  maps: target_base + '/assets/maps',
  html: target_base
};

var bower_dir = './bower_components';

var on_error = function(err) {
  gutil.beep();
  gutil.log(gutil.colors.red('Found unhandled error:\n'), err.toString());
  this.emit('end');
}

gulp.task('copy', function() {
  var html = gulp.src(app_base + '/*.html')
    .pipe(newer(target.html))
    .pipe(gulp.dest(target.html));
  var fonts = gulp.src(bower_dir + '/font-awesome/fonts/**/*')
    .pipe(newer(target.fonts))
    .pipe(gulp.dest(target.fonts));
  var maps = gulp.src(paths.maps + '/**/*')
    .pipe(newer(target.maps))
    .pipe(gulp.dest(target.maps));
  return merge(html, fonts, maps)
    .pipe(connect.reload());
});

gulp.task('scripts', function() {
  return browserify({entries: paths.scripts + '/main.js', debug: true})
    .transform(babelify)
    .bundle()
    .on('error', on_error)
    .pipe(source('main.js'))
    .pipe(gulp.dest(target.scripts))
    .pipe(connect.reload());
});

gulp.task('styles', function() {
  return gulp.src(paths.styles + '/*.less')
    .pipe(newer({dest: target.styles, ext: '.css'}))
    .pipe(less({
      paths: [ paths.styles + '/includes', bower_dir + '/font-awesome/less']
    }))
    //.pipe(debug({title: 'styles-dbg'}))
    .pipe(gulp.dest(target.styles))
    .pipe(connect.reload());
});


gulp.task('run-server', function() {
  connect.server({
    root: target_base,
    livereload: true,
    port:80
  });
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts + '/**/*.js', ['scripts']);
  gulp.watch(paths.styles + '/*.less', ['styles']);
  gulp.watch(paths.html + '/*.html', ['copy']);
  gulp.watch(paths.maps + '/**/*', ['copy']);
});

gulp.task('serve', ['run-server', 'watch']);

gulp.task('build', ['copy', 'scripts', 'styles']);