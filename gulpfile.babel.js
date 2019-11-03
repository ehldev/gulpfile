import { src, dest, parallel, series, watch } from 'gulp'
import browserSync from 'browser-sync'
import plumber from 'gulp-plumber'
import pug from 'gulp-pug'
import sass from 'gulp-sass'
import sourcemaps from 'gulp-sourcemaps'
import autoprefixer from 'gulp-autoprefixer'
import wait from 'gulp-wait'
import babel from 'gulp-babel'
import concat from 'gulp-concat'
import uglify from 'gulp-uglify'
import cachebust from 'gulp-cache-bust'
import rename from 'gulp-rename'

const dev = './dev/',
	prod = './public/',
	server = browserSync.create()

const bSync = () => {
	return server.init({
        server: {
            baseDir: prod,
            index: "index.html"
        },
        open: true,
        notify: true
    })
}

const html = () => {
	return src(dev + 'pug/*.pug')
		.pipe(plumber())
		.pipe(pug({
			pretty: true, // https://pugjs.org/api/reference.html
            basedir: dev + 'pug'
		}))
		.pipe(dest(prod))
}

const stylesDev = () => {
	return src(dev + 'scss/app.scss')
        .pipe(wait(500))
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(plumber())
        .pipe(sass({
            outputStyle: 'expanded',
            errLogToConsole: true
        }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(dest(prod + 'css'))
}

const stylesProd = () => {
    return src(dev + 'scss/app.scss')
        .pipe(wait(500))
        .pipe(plumber())
        .pipe(sass({
            outputStyle: 'compressed',
            errLogToConsole: true
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(rename("app.min.css"))
        .pipe(dest(prod + 'css'))
}

const scriptsDev = () => {
	return src([
			// Especificar el orden de los archivos para evitar problemas, el último es el principal
			dev + 'js/modules/*.js',
			dev + 'js/app.js'
		])
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(concat('app.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('.'))
		.pipe(dest(prod + 'js/'))
}

const scriptsProd = () => {
    return src([
            // Especificar el orden de los archivos para evitar problemas, el último es el principal
            dev + 'js/modules/*.js',
            dev + 'js/app.js'
        ])
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(rename('app.min.js'))
        .pipe(dest(prod + 'js/'))
}

const watchFiles = done => {
	watch(dev + "pug/**/**").on('all', series(html, server.reload));
    watch(dev + "scss/**/**").on('all', series(stylesDev, server.reload));
    watch(dev + "js/**/**").on('all', series(scriptsDev, server.reload));
    done()
}

// Tasks production

const cache = () => {
	return src(prod + '**/*.html')
        .pipe(cachebust({
            type: 'timestamp'
        }))
        .pipe(dest(prod))
}

// Aquí se generan los archivos listos para desarrollo, ejecutar gulp o npm start
exports.default = parallel(html, stylesDev, scriptsDev, bSync, watchFiles)

// Aquí se generan los archivos listos para producción, ejecutar gulp build o npm run build
exports.build = parallel(html, stylesProd, scriptsProd, cache)