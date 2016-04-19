var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('browser-sync', function () {
    browserSync({
        proxy: "localhost:8081"
    });
});

gulp.task('default', ['browser-sync'], function () {
    gulp.watch(['views/**/*.pug'], browserSync.reload);
    gulp.watch(['public/css/**/*.css'], browserSync.reload);
})