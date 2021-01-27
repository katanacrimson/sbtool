#!/usr/bin/env node
"use strict";
//
// sbtool - A collection of Starbound modding command-line tools.
//
// @copyright (c) 2018 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/sbtool>
//
Object.defineProperty(exports, "__esModule", { value: true });
const app = require("commander");
const fs = require("fs");
const path = require("path");
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')).toString());
app
    .version(pkg.version, '-v, --version')
    .command('genpatch <assets> <modifiedDir> <dest>', 'generate JSON patch files, given a set of original and set of modified files')
    .command('pngpack <target>', 'compress png assets in the target directory to save space')
    .command('checkjson <target>', 'validates all files for JSON validity (works around JSON spec violations by Starbound)')
    .parse(process.argv);
//# sourceMappingURL=sbtool.js.map