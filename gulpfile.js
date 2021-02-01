const browserSync = require("browser-sync").create();
const del = require("del");

const gulp = require("gulp");
const changed = require("gulp-changed");
const rename = require("gulp-rename");

const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps");

const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");

const htmlmin = require("gulp-htmlmin");
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");

const imagemin = require("gulp-imagemin");

const clean = () => {
    return del("./build/**/*.*");
}

const scss = () => {
    return gulp.src("./source/scss/main.scss")
        .pipe(plumber())

        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(csso())
        .pipe(rename( {suffix: '.min'} ))
        
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("./build/css"))
        .pipe(browserSync.stream());
}

const html = () => {
    return gulp.src("./source/*.html")
        .pipe(posthtml([include()]))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest("./build"));
}

const images = () => {
    return gulp.src([
        "./source/images/**/*.*",
        "!source/images/icons",
        "!source/images/sprite.svg"
      ], {
        base: "./source/img"
      })
        .pipe(changed("./build/images"))
        .pipe(imagemin([
            imagemin.mozjpeg({quality: 95, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
          ]))
        .pipe(gulp.dest("./build"));
}

const sprite = () => {
    return gulp.src("./source/images/icons/icon-*.svg")
        .pipe(svgstore())
        .pipe(gulp.rename("sprite.svg"))
        .pipe(gulp.dest("./source/images"));
}

const sync = () => {
    browserSync.init({
        server: {
            baseDir: "./build",
            proxy: "borodinsky.local"
        }
    });

    gulp.watch("./source/images/icons/icon-*.svg", gulp.series(sprite, html, browserSync.reload));
    gulp.watch("./source/images/**.*.{jpg,jpeg,png,svg}", gulp.series(images));
    gulp.watch("./source/scss/*.scss", scss);
    gulp.watch("./source/*.html").on('change', gulp.series(html, browserSync.reload));
}

exports.clean = gulp.series(clean);
exports.build = gulp.series(clean, scss, html);
exports.default = gulp.series(sync);