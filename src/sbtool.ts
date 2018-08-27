#!/usr/bin/env node

//
// sbtool - A collection of Starbound modding command-line tools.
//
// @copyright (c) 2018 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/sbtool>
//

import * as app from 'commander'

const pkg = require('../package.json')

app
  .version(pkg.version, '-v, --version')
  .command('genpatch <assets> <modifiedDir> <dest>', 'generate JSON patch files, given a set of original and set of modified files')
  .command('pngpack <target>', 'compress png assets in the target directory to save space')
  .command('checkjson <target>', 'validates all files for JSON validity (works around JSON spec violations by Starbound)')
  .parse(process.argv)
