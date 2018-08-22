#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app = require("commander");
const pkg = require('../package.json');
app
    .version(pkg.version, '-v, --version')
    // .command('files <pak>', 'get the list of all files in a pak', {
    //   isDefault: true
    // })
    .command('genpatch <assets> <modifiedDir> <dest>', 'generate JSON patch files, given a set of original and set of modified files')
    .command('pngpack <target>', 'compress png assets in the target directory to save space')
    // .command('pack <directory> <pak>', 'create a new pak file')
    // .command('unpack <pak> <directory>', 'unpack a pak file in the given directory')
    .parse(process.argv);
//# sourceMappingURL=sbtool.js.map