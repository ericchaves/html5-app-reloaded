/*global -$ */
'use strict';
var gulp = require('gulp'),
  series = require('stream-series'),
  del    = require('del'),
  bowerFiles = require('main-bower-files'),
  $ = require('gulp-load-plugins')(),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	modRewrite = require('connect-modrewrite'),
	
	nodeEnv = process.env.NODE_ENV || "development";

var onError = function (err) {  
  $.util.beep();
  console.log(err);
};

gulp.task('styles', function(){
  return gulp.src(['app/styles/*.less','!app/styles/_*.less'])
  .pipe($.plumber({ errorHandler: onError }))
  .pipe($.sourcemaps.init())
  .pipe($.less())
  .pipe($.postcss([
    require('autoprefixer-core')({browsers: ['last 1 version']})
  ]))
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest('.tmp/styles'))
  .pipe(reload({stream: true}));
});
gulp.task('templates', function(){
  gulp.src('app/templates/*.jst')
    .pipe($.plumber({ errorHandler: onError }))
    .pipe($.dotjsPacker({
      fileName: "templates.js"
    }))
    .pipe(gulp.dest('.tmp/scripts/'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.plumber({ errorHandler: onError }))
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  return gulp.src(bowerFiles({
    filter: '**/*.{eot,svg,ttf,woff,woff2}'
  }).concat('app/fonts/**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe($.plumber({ errorHandler: onError }))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('injector', ['styles','templates'], function(){
  var styles      = gulp.src(['.tmp/**/*.css', ], {read: false}),
      templates   = gulp.src(['.tmp/scripts/templates.js'], {read: false}),
      services    = gulp.src(['app/scripts/services/**/*.js'], {read: false}),
      collections = gulp.src(['app/scripts/collections/**/*.js'], {read: false}),
      models      = gulp.src(['app/scripts/models/**/*.js'], {read: false}),
      views       = gulp.src(['app/scripts/views/**/*.js'], {read: false}),
      config      = gulp.src(['app/config/' + nodeEnv + '.js'], {read: false}),
      router      = gulp.src(['app/scripts/router.js'], {read: false}),
      main        = gulp.src(['app/scripts/main.js'], {read: false}),
      bower       = gulp.src(bowerFiles(), {read: false});
  var ordered = series(styles, templates, main, config, services, views, models, collections, router);
  return gulp.src('app/index.html')
    .pipe($.plumber({ errorHandler: onError }))
    .pipe($.inject(bower, {name: 'bower'}))
    .pipe($.inject(ordered, {ignorePath: ['.tmp','app']}))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('html', ['injector'], function () {
  var assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

  return gulp.src('.tmp/*.html')
    .pipe($.plumber({ errorHandler: onError }))
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: 'ie8'})))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function(cb){
  del(['.tmp/**','dist/**'], cb);  
});

gulp.task('deploy', ['html', 'images', 'fonts'], function () {
  return gulp.src('dist/**/*')
    .pipe($.plumber({ errorHandler: onError }))
    .pipe($.size({title: 'build', gzip: true}));
});

gulp.task('serve', ['injector'], function(){
  browserSync({
    notify: false,
    port: 9001,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      },
      middleware: [
        modRewrite([
          '!\\.\\w+$ /index.html [L]' 
        ])
      ]
    }
  });

  // watch for changes
  gulp.watch([
    '.tmp/*.html',
    '.tmp/styles/**/*.css',
    'app/**/*.js',
    'app/index.html'
  ]).on('change', reload);

  // watch for recompilation
  gulp.watch('app/styles/**/*.less', ['injector']);
  gulp.watch('app/scripts/**/*.js', ['injector']);
  gulp.watch('app/templates/**/*.jst', ['templates']);
  gulp.watch('app/index.html', ['injector']);
});

gulp.task('build', ['clean'], function(){
  gulp.start('deploy')
});

gulp.task('default', ['clean'], function () {
  gulp.start('serve');
});
