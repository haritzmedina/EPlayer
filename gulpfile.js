const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence');
const source = require('vinyl-source-stream');
const size = require('gulp-size');
const esLint = require('gulp-eslint');
const browserify = require('browserify');
const jsdoc = require('gulp-jsdoc3');

// Electron stuff
const electron = require('electron-connect').server.create({
  stopOnClose: true, // To stop the gulp task on window close
});
const packager = require('electron-packager');

gulp.task('electron', ()=>{
  "use strict";
  // Start browser process
  electron.start((electronProcState) => {
    if (electronProcState == 'stopped') {
      process.exit(); // Close the process if window is closed
    }
  });
  // Reload renderer process
  gulp.watch('app/scripts.babel/**/*.js', ['lint', 'browserify', electron.reload]);
});

gulp.task('doc', function (cb) {
  let config = require('./jsdoc.json');
  gulp.src(['README.md', './app/scripts.babel/**/*.js'], {read: false})
    .pipe(jsdoc(config, cb));
});

gulp.task('lint', ()=>{
  "use strict";
  return gulp.src('app/scripts.babel/**/*.js')
    .pipe(esLint({
      parserOptions: { sourceType : 'module'},
      env: {
        es6: true
      }
    }))
    .pipe(esLint.format());
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

gulp.task('cleanDev', del.bind(null, ['./node_modules']));

gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe(size({title: 'build', gzip: true}));
});

gulp.task('build', (cb) => {
  runSequence('lint', 'size', cb);
});

gulp.task('package', (cb)=>{
  packager({
    dir: './app',
    icon: './app/icon.png',
    overwrite: true,
    out: './package'
  }, function done_callback (err, appPaths) {});
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});
