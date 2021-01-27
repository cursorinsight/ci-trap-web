import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import rollupDotenv from 'rollup-plugin-dotenv';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const env = dotenv.config();
dotenvExpand.expand(env);

const babelOptions = {
  // Including JS files in the `node_modules/` directory introduces a
  // large variety of cryptic errors for the CommonJS plugin.  For more
  // details, see:
  //
  // https://github.com/rollup/rollup-plugin-commonjs/issues/361#issuecomment-462943527
  exclude: /node_modules/,
  babelHelpers: 'runtime',
  plugins: ['@babel/plugin-transform-runtime'],
  presets: ['@babel/env'],
};

const commonjsOptions = {
  include: /node_modules/,
};

const resolveOptions = {
  // Let rollup select browser specific module versions that are
  // implemented in the browser _and_ in `node` too.  E.g. `crypto`.
  browser: true,
};

const terserOptions = {
  format: {
    // Remove all comments from minified output
    comments: false,
  },
};

// Include sourcemaps during development
const sourcemap = process.env.NODE_ENV === 'development' ? 'inline' : false;

// Disable Tracker on MSIE 11 and below -- this banner-footer pair wraps the
// entire Tracker code which is not evaluated on MSIE 11 and below.
const banner = 'var tracker=((typeof window.document.documentMode'
  + '===\'undefined\')?(function(){';
const footer = '})():{});';

export default [{
  // Browser friendly IIFE and UMD build
  input: 'src/trap.js',

  output: [{
    file: 'dist/trap-iife.min.js',
    exports: 'named',
    format: 'iife',
    name: 'trap',
    sourcemap,
  }, {
    file: 'dist/trap-umd.min.js',
    exports: 'named',
    format: 'umd',
    name: 'trap',
    sourcemap,
  }],

  plugins: [
    resolve(resolveOptions),
    commonjs(commonjsOptions),
    babel(babelOptions),
    terser(terserOptions),
  ],
}, {
  // CommonJS (for Node) and ES module (for bundlers) build
  input: 'src/trap.js',

  external: ['fflate', 'js-cookie', 'platform', 'uuid'],

  output: [{
    file: 'dist/trap.min.js',
    format: 'es',
    sourcemap,
  }, {
    file: 'dist/trap-cjs.min.js',
    exports: 'named',
    format: 'cjs',
    sourcemap,
  }],

  plugins: [
    terser(terserOptions),
  ],
}, {
  // Browser friendly, preconfigured, IIFE tracker module
  input: 'src/tracker.js',

  output: [{
    file: 'dist/gt.min.js',
    exports: 'default', // a Tracker instance is simply available as `tracker`
    format: 'iife',
    name: 'tracker', // this became irrelevant, since banner/footer replaces it!
    sourcemap,

    // Disable MSIE 11 -- see code above
    banner,
    footer,
  }],

  plugins: [
    rollupDotenv(),
    resolve(resolveOptions),
    commonjs(commonjsOptions),
    babel(babelOptions),
    terser(terserOptions),
  ],
}];
