var gulp=require('gulp'),
    gulputil=require('gulp-util'),
    path=require('path'),
    fs = require('fs-extra'),
    concat=require('gulp-concat'),
    uglify = require('gulp-uglify'),
    merge = require('merge-stream'),
    build=require('./build.json'),
    release=require('./build/dist.json'),
    buildSass=require('./sass.json'),
    buildTemplate=require('./template.json'),
    src='./src',
    dist='./dist',
    sass='./sass',
    template='./template';





gulp.task('default',function(){
    console.log('elliptical elements build..."tasks: gulp build|minify|sass|template"');
});

gulp.task('build',function(){

    var build_=srcStream(build)
        .pipe(concat('elliptical-elements.js'))
        .pipe(gulp.dest(src));

    var release_=srcStream(release)
        .pipe(concat('elliptical-elements.js'))
        .pipe(gulp.dest(dist));

    return merge(build_, release_);

});

gulp.task('minify',function(){

    var build_=srcStream(build)
        .pipe(concat('elliptical-elements.js'))
        .pipe(gulp.dest(src));

    var minify_=srcStream(release)
        .pipe(concat('elliptical-elements.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dist));

    return merge(build_, minify_);
});

gulp.task('sass',function(){

    var build_=srcStream(buildSass)
        .pipe(gulp.dest(sass));

});

gulp.task('template',function(){

    var build_=srcStream(buildTemplate)
        .pipe(gulp.dest(template));

});

function srcStream(src){
    return gulp.src(src);
}


