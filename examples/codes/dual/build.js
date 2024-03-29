

let httpPlugin = {
    name: 'http',
    setup(build) {
        let https = require('https')
        let http = require('http')

        // Intercept import paths starting with "http:" and "https:" so
        // esbuild doesn't attempt to map them to a file system location.
        // Tag them with the "http-url" namespace to associate them with
        // this plugin.
        build.onResolve({ filter: /^https?:\/\// }, args => ({
            path: args.path,
            namespace: 'http-url',
        }))

        // We also want to intercept all import paths inside downloaded
        // files and resolve them against the original URL. All of these
        // files will be in the "http-url" namespace. Make sure to keep
        // the newly resolved URL in the "http-url" namespace so imports
        // inside it will also be resolved as URLs recursively.
        build.onResolve({ filter: /.*/, namespace: 'http-url' }, args => ({
            path: new URL(args.path, args.importer).toString(),
            namespace: 'http-url',
        }))

        // When a URL is loaded, we want to actually download the content
        // from the internet. This has just enough logic to be able to
        // handle the example import from unpkg.com but in reality this
        // would probably need to be more complex.
        build.onLoad({ filter: /.*/, namespace: 'http-url' }, async (args) => {
            let contents = await new Promise((resolve, reject) => {
                function fetch(url) {
                    console.log(`Downloading: ${url}`)
                    let lib = url.startsWith('https') ? https : http
                    let req = lib.get(url, res => {
                        if ([301, 302, 307].includes(res.statusCode)) {
                            fetch(new URL(res.headers.location, url).toString())
                            req.abort()
                        } else if (res.statusCode === 200) {
                            let chunks = []
                            res.on('data', chunk => chunks.push(chunk))
                            res.on('end', () => resolve(Buffer.concat(chunks)))
                        } else {
                            reject(new Error(`GET ${url} failed: status ${res.statusCode}`))
                        }
                    }).on('error', reject)
                }
                fetch(args.path)
            })
            return { contents }
        })
    },
}

require('esbuild').build({
    external: ['node:fs', 'readline', 'path', 'assert', 'util', 'fs', 'url'],
    entryPoints: ['./public/js/glue.js'],
    bundle: true,
    outfile: './public/main.js',
    plugins: [httpPlugin],
    sourcemap: true,
    platform: 'browser'
}).catch((err) => { console.error(err.message, err.stack); process.exit(1) })

