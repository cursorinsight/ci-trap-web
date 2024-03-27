# ci-trap-web [![test](https://github.com/cursorinsight/ci-trap-web/actions/workflows/test.yaml/badge.svg?branch=main)](https://github.com/cursorinsight/ci-trap-web/actions?query=workflow%3Atest)

Lightweight mouse movement tracker library for browsers.

## Quickstart

In order to collect mouse, pointer, touch and various other browser events from
a website do the following in your ES6 or CommonJS compatible project:

**1. Install:**

```shell
$ npm install ci-trap-web
```

**2. Import `trap` client using ES6 module syntax:**

```javascript
import trap from 'ci-trap-web';
```

**... or using CommonJS syntax:**

```javascript
const { trap } = require('ci-trap-web');
```

**3. Set up data collection server and start collecting events:**

```javascript
trap.url('https://your.server.com');
trap.mount(document.body);
```

**4. Check for Trap submissions in your network communications, e.g. using your
browser's development tools.**

## Examples

There are working examples in the `examples/` directory:

*   **ES6** (in `examples/es6/`) provides a fully configured ES6 compatible
    example to start integrating Trap into a modern Javascript framework, e.g.
    React.

*   **Vanilla** (in `examples/vanilla/`) contains a precompiled Javascript
    bundle and the necessary steps to integrate Trap into a bare-bone HTML
    document -- without the need to set up a complex build framework.

*   **Sandbox** (in `examples/sandbox/`) is our experimental sandbox to test
    and validate new features, execute various research tasks, e.g., saving
    collected chunks to files into a configurable directory.

## Develop

You may want to develop new features or reproduce bugs in a working
environment, for this we recommend using our "Sandbox" example in the
`examples/sandbox/` directory.

Examples are set up. They can be installed and started with these simple
commands:

1.  Install the root project's dependencies (in the project's root):

    ```
    $ make install-deps
    ```

2.  Go into the example you want to start -- e.g. "Sandbox" in this case -- and
    install its dependencies:

    ```
    $ cd examples/sandbox/
    $ make install-deps
    ```

3.  Start the web server to start the example application:

    ```
    $ make server
    ```

The UI of the example is available at http://localhost:3000/.

## Configuration

You can configure `ci-trap-web` by specifying environment variables during build
time. These environment variables act as configuration parameters.

You can find the configuration parameters in `src/constants.js`. Each
configuration parameter has a `process.env.<name>` reference in `constants.js`.

See the *How to generate `gt.min.js`* section for an example that overrides the
`APP_DEFAULT_TRAP_API_KEY_VALUE` configuration parameter.

## How to generate `gt.min.js`

1.  Install the root project's dependencies (in the project's root):

    ```
    $ make install-deps
    ```

2.  Generate a UUID that you will use as the API key (optional):

    ```
    $ uuidgen
    aa34677e-a3ee-445c-8483-a30924ebc5d9
    ```

3.  Build a release (replace the API key):

    ```
    $ APP_DEFAULT_TRAP_API_KEY_VALUE=aa34677e-a3ee-445c-8483-a30924ebc5d9 \
          make release
    ```

4.  You can find your customized `gt.min.js` as `dist/gt.min.js`.

## How to generate `gt.min.js` with Docker

You can build assets in a dockerized environment, without the need to install
Node.js and its dependencies.

1.  Generate a UUID that you will use as the API key (optional):

    ```
    $ uuidgen
    aa34677e-a3ee-445c-8483-a30924ebc5d9
    ```

2.  Build JavaScript asset files with the Docker environment provided:

    ```
    $ docker build --ssh default --build-arg GIT_USER=${GIT_USER} . \
        -t ci-trap-web
    ```

    Replace `${GIT_USER}` with your Gerrit/Git user.

3.  Resulting assets are put into the container's `/opt/app/` directory which
    can be easily accessed after starting the container and using `curl` or
    directly copy the files out of it:

    -   Start the container:

        ```
        $ docker run --rm -p 8080:80 --name ci-trap-web ci-trap-web
        ```

    -   In a separate shell, use `curl` to fetch the asset:

        ```
        $ curl -O http://your-docker-server:8080/gt.min.js
        ```

    -   Or directly copy the file out of it:

        ```
        $ docker cp ci-trap-web:/opt/app/gt.min.js ./gt.min.js
        ```

## License

`ci-trap-web` is released under the [MIT license].

[MIT license]: https://github.com/cursorinsight/ci-trap/blob/master/LICENSE
