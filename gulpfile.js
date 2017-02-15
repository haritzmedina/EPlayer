// generated on 2016-05-24 using generator-chrome-extension 0.5.6
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const del = require('del');
const runSequence = require('run-sequence');
const source = require('vinyl-source-stream');
const browserify = require('browserify');
const uglify = require('gulp-uglify');
const pump = require('pump');
const babel  = require("gulp-babel");
const jsdoc = require('gulp-jsdoc3');
const electron = require('electron-connect').server.create();



const $ = gulpLoadPlugins();


gulp.task('electron', ()=>{
  "use strict";
  // Start browser process
  electron.start();

  // Reload renderer process
  gulp.watch('app/scripts.babel/**/*.js', ['lint', 'browserify', electron.reload]);

});


gulp.task('extras', () => {
  return gulp.src([
    'app/**/*.*',
    'app/_locales/**',
    '!app/scripts',
    '!app/scripts/**/*',
    '!app/scripts.babel',
    '!app/scripts.babel/**/*',
    '!app/images',
    '!app/images/**/*',
    '!app/*.json',
    '!app/*.html',
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('doc', function (cb) {
  let config = require('./jsdoc.json');
  gulp.src(['README.md', './app/scripts.babel/**/*.js'], {read: false})
    .pipe(jsdoc(config, cb));
});


gulp.task('scripts', (cb)=>{
  "use strict";
  pump([
    gulp.src([
      'app/scripts/**/*.js',
      '!app/scripts/chromereload.js'
    ]),
      babel({presets: ['es2015'], compact: false}),
      uglify(),
      gulp.dest('dist/scripts')
  ],
  cb);
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe($.eslint(options))
      .pipe($.eslint.format());
  };
}

gulp.task('lint', lint('app/scripts.babel/**/*.js', {
  parserOptions: { sourceType : 'module'},
  env: {
    es6: true
  }
}));

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('html',  () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.sourcemaps.init())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cleanCss({compatibility: '*'})))
    .pipe($.sourcemaps.write())
    .pipe($.if('*.html', $.htmlmin({removeComments: true, collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('chromeManifest', () => {
  return gulp.src('app/manifest.json')
    .pipe($.chromeManifest({
      buildnumber: false,
      background: {
        target: 'scripts/background.js',
        exclude: [
          'scripts/chromereload.js'
        ]
      }
  }))
  .pipe($.if('*.css', $.cleanCss({compatibility: '*'})))
  .pipe($.if('*.js', $.sourcemaps.init()))
  .pipe($.if('*.js', $.uglify()))
  .pipe($.if('*.js', $.sourcemaps.write('.')))
  .pipe(gulp.dest('dist'));
});

gulp.task('browserify', function() {
  return browserify('./app/scripts.babel/Window.js', {
    insertGlobalVars : {process: ()=>{}
    },
    builtins: false
  })
  .bundle()
    //Pass desired output filename to vinyl-source-stream
    .pipe(source('Window.js'))
    // Start piping stream to tasks!
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('watch', ['lint', 'browserify', 'html'], () => {
  $.livereload.listen();

  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*',
    'app/styles/**/*',
    'app/_locales/**/*.json'
  ]).on('change', $.livereload.reload);

  gulp.watch('app/scripts.babel/**/*.js', ['lint', 'browserify']);
});

gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('package', function () {
  var manifest = require('./app/manifest.json');
  return gulp.src('dist/**')
      .pipe($.zip('GCPlayer-' + manifest.version + '.zip'))
      .pipe(gulp.dest('package'));
});

gulp.task('build', (cb) => {
  runSequence(
    'lint', 'chromeManifest',
    ['html', 'images', 'extras', 'scripts'],
    'size', cb);
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});
