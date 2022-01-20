'use strict';

const gulp = require('gulp');
const jest = require('gulp-jest');

gulp.task('watch', function (cb) {
    gulp.watch([`${SRC_DIR}/!**`], function (cb) {
        try {
            gulp.task('compile')();
            cb();
        } catch (e) {
            console.log(e);
        }
    });
});
