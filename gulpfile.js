/*global -$ */
'use strict';
var gulp = require('gulp'),
  debug = require('gulp-debug'),
	inject = require('gulp-inject'),
	series = require('stream-series'),
  del    = require('del'),
	bowerFiles = require('main-bower-files'),
	$ = require('gulp-load-plugins')(),
  log = $.util.log,
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	modRewrite = require('connect-modrewrite'),
	
	nodeEnv = process.env.NODE_ENV || "development";

gulp.task('styles', function(){
  return gulp.src('app/styles/*.sass')
  .pipe($.sourcemaps.init())
  .pipe($.sass({
    outputStyle: 'nested', // libsass doesn't support expanded yet
    precision: 10,
    includePaths: ['.'],
    indentedSyntax: true,
    onError: console.error.bind(console, 'Sass error:')
  }))
  .pipe($.postcss([
    require('autoprefixer-core')({browsers: ['last 1 version']})
  ]))
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest('.tmp/styles'))
  .pipe(reload({stream: true}));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
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
  return gulp.src(bowerFiles({filter: '**/*.{eot,svg,ttf,woff,woff2}'})
    .concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('injector', ['styles'], function(){
  var styles      = gulp.src(['.tmp/**/*.css', ], {read: false}),
      collections = gulp.src(['app/scripts/collections/**/*.js'], {read: false}),
      models      = gulp.src(['app/scripts/models/**/*.js'], {read: false}),
      views       = gulp.src(['app/scripts/views/**/*.js'], {read: false}),
      config      = gulp.src(['app/config/' + nodeEnv + '.js'], {read: false}),
      router      = gulp.src(['app/scripts/router.js'], {read: false}),
      main        = gulp.src(['app/scripts/main.js'], {read: false}),
      css         = gulp.src(['.tmp/styles/**/*.css']),
      bower       = gulp.src(bowerFiles(), {read: false});
  return gulp.src('app/index.html')
  .pipe(inject(bower, {name: 'bower'}))
  .pipe(inject(series(styles, main, config, views, models, collections, router), {ignorePath: ['.tmp','app']}))
  .pipe(gulp.dest('.tmp'));
});

gulp.task('clean', function(cb){
  del(['.tmp/**','dist/**'], cb);  
});

gulp.task('html', ['injector'], function () {
  var assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

  return gulp.src('.tmp/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: 'ie8'})))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('deploy', ['html', 'images', 'fonts'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
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
    'app/**/*.js'
  ]).on('change', reload);

  // watch for recompilation
  gulp.watch('app/styles/**/*.sass', ['styles']);
  gulp.watch('app/index.html', ['injector']);
  gulp.watch('app/fonts/**/*', ['fonts']);
});

gulp.task('build', ['clean'], function(){
  gulp.start('deploy')
});

gulp.task('default', ['clean'], function () {
  gulp.start('serve');
});
