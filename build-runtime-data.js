

/*

builds the "build/runtime-data.js" file

run with: "node build-runtime-data.js" (run from the top-level
    Mogli directory, only!)

This takes the runtime files and reads their contents.

Then it outputs a single
js file exporting that string.
The string contains all the code
the runtime needs.
Then we can inject all of this code
into the iframe. Since we run client-side,
we have to do it like this, there is no way
(at least no way I know of) to incrementally
push scripts into the iframe.

Of course you only need node installed to build
the app, the finished deployed app is client-side.

*/

let files = [
    "runtime/index.html-template",
    "runtime/main.js",
    "runtime/moglimanager.js",
    "runtime/ink-full.js",
    "runtime/style.css",
]

let out = "build/runtime-data.js"


let fs = require('fs')
let path = require('path')

let total = {}

for (let file of files) {
    let d = path.resolve(__dirname, file)
    console.log("PROCESSING", d)

    let res = fs.readFileSync(d, 'UTF-8')
    total[file] = {
        name: file,
        content: res + "",
    }
}

let json = JSON.stringify(total)

let js = `$_RUNTIME_DATA = ` + json

let d2 = path.resolve(__dirname, out)

fs.writeFileSync(d2, js)

