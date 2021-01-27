# Cursor Insight's Trap

Lightweight mouse movement tracker library for browsers.

## Examples

A few examples show the project's capabilities, API and its common use:

*   `examples/angular` -- `ci-trap`'s Angular integrations. Only Trap
    integration is provided.

*   `examples/esm` -- An example project that loads `ci-trap` via ES modules
    interface (e.g. `import ...`, etc.). It is best to develop new features in
    the library.

*   `examples/iife` -- A minimal project loading the `ci-trap` library via the
    IIFE interface, i.e. the way a browser usually does without any further
    support. It is best to present the project's vanilla JS API.

*   `examples/react` -- `ci-trap`'s React integrations. Only Trap integration
    is provided.

*   `examples/research` -- Integrated tracker example to fulfil special
    Research needs, e.g., saving collected chunks to files into a configurable
    directory.

*   `examples/snippet` -- A vanilla example project integrating the Tracker
    using the HTML snippet. It is created to present the Tracker project's API
    and integration issues.

### Usage

Examples are set up. Each can be installed and started with these simple
commands:

1.  Install the root project's dependencies (in the project's root):

    ```
    $ make install-deps
    ```

2.  Go into the example you want to start -- e.g. IIFE in this case -- and
    install the example's dependencies:

    ```
    $ cd examples/iife
    $ make install-deps
    ```

3.  Start the web server to start the example application:

    ```
    $ make server
    ```

The example of your choice is available at http://localhost:3000/.

## Configuration

You can configure `ci-trap` by specifying environment variables during build
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
    $ docker build --ssh default --build-arg GIT_USER=${GIT_USER} . -t ci-trap
    ```

    Replace `${GIT_USER}` with your Gerrit/Git user.

3.  Resulting assets are put into the container's `/opt/app/` directory which
    can be easily accessed after starting the container and using `curl` or
    directly copy the files out of it:

    -   Start the container:

        ```
        $ docker run --rm -p 8080:80 --name ci-trap ci-trap
        ```

    -   In a separate shell, use `curl` to fetch the asset:

        ```
        $ curl -O http://your-docker-server:8080/gt.min.js
        ```

    -   Or directly copy the file out of it:

        ```
        $ docker cp ci-trap:/opt/app/gt.min.js ./gt.min.js
        ```

## License

`ci-trap` is released under the [MIT license].

[MIT license]: https://github.com/cursorinsight/ci-trap/blob/master/LICENSE
