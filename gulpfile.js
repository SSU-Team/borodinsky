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

const svgstore = require("gulp-svgstore");

const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");


const clean = () => {
    return del("./build");
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
const scssAddEventListener = () => gulp.watch("./source/scss/*.scss", scss);


const html = () => {
    return gulp.src("./source/*.html")
        .pipe(posthtml([include()]))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest("./build"));
}
const htmlAddEventListener = () => gulp.watch(
    "./source/*.html").on('change', 
    gulp.series(html, browserSync.reload)
);


const sprite = () => {
    return gulp.src("./source/images/icons/icon-*.svg")
        .pipe(svgstore())
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("./build/images"));
}
const spriteAddEventListener = () => gulp.watch(
    "./source/images/icons/icon-*.svg", 
    gulp.series(sprite, html, browserSync.reload)
);


const images = () => {
    return gulp.src([
        "./source/images/**/*.{jpg,jpeg,png,gif}",
        "!source/images/icons",
        "!source/images/sprite.svg",
      ], {
        base: "./source/images"
      })
        .pipe(changed("./build/images"))
        
        .pipe(imagemin([
            imagemin.mozjpeg({quality: 100, progressive: true}),
            imagemin.optipng({optimizationLevel: 1}),
          ]))
        .pipe(gulp.dest("./build/images"))
        
        .pipe(webp())
        .pipe(gulp.dest("./build/images"));
}
const imagesAddEventListener = () => gulp.watch(
    "./source/images/**/*.{jpg,jpeg,png,svg}", 
    gulp.series(images)
);


const sync = () => {
    browserSync.init({
        server: {
            baseDir: "./build",
            proxy: "borodinsky.local"
        }
    });

    imagesAddEventListener();
    scssAddEventListener();
    spriteAddEventListener();
    htmlAddEventListener();
}

exports.clean = gulp.series(clean);
exports.images = gulp.series(images);
exports.sprite = gulp.series(sprite);
exports.build = gulp.series(clean, gulp.parallel(images, sprite, scss), html);
exports.default = gulp.series(sync);










//

// const images = () => {
//     return gulp.src([
//         "./source/images/**/*.{jpg,jpeg,png,gif}",
//         "!source/_compressed",
//         "!source/images/icons",
//         "!source/images/sprite.svg",
//       ], {
//         base: "./source/images"
//       })
//         .pipe(changed("./source/images/_compressed"))
//         .pipe(imagemin([
//             imagemin.mozjpeg({quality: 100, progressive: true}),
//             imagemin.optipng({optimizationLevel: 1}),
//           ]))
//         .pipe(gulp.dest("./source/images/_compressed"));
// }