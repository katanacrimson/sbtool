"use strict";
//
// sbtool - A collection of Starbound modding command-line tools.
//
// @copyright (c) 2018 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/sbtool>
//
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const os = require("os");
const app = require("commander");
const readdir = require("recursive-readdir");
const stripComments = require("strip-json-comments");
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')).toString());
app
    .version(pkg.version, '-v, --version')
    .arguments('<target>')
    .action(async (destDir) => {
    try {
        const target = path.resolve(process.cwd(), destDir);
        try {
            await fs.promises.access(target, fs.constants.R_OK);
        }
        catch (err) {
            throw new Error('The specified target directory does not exist or is not readable.');
        }
        // these should let us ignore files that should not be JSON.
        const ignoredFiles = [
            // .disabled and .objectdisabled exist in the Starbound asset files
            //   we're ignoring them for now, because we probably shouldn't care about these files
            '*.disabled',
            '*.objectdisabled',
            '*.ase',
            '*.md',
            '*.png',
            '*.PNG',
            '*.wav',
            '*.ogg',
            '*.ttf',
            '*.lua',
            '*.txt',
            '*.psd',
            '*.pdn',
            '*.broken',
            '*.db',
            '_metadata',
            '.metadata',
            '.gitignore',
            '.git',
            '.buildinfo',
            '_previewimage'
        ];
        const files = await readdir(target, ignoredFiles);
        let failed = false;
        const errors = [];
        for (const filePath of files) {
            // sanity check
            if (!filePath.startsWith(target)) {
                return;
            }
            let json = null;
            const originalJSON = stripComments(await fs.promises.readFile(filePath, 'utf8'));
            try {
                // trying to work around Starbound's use of multiline strings (in violation of the JSON spec)
                json = originalJSON.replace(/\r?\n|\r/g, '');
                json = JSON.parse(json);
            }
            catch (_err) {
                try {
                    json = JSON.parse(originalJSON);
                }
                catch (err) {
                    err.message = `Failed to parse file "${filePath}"` + os.EOL + err.message; // eslint-disable-line @typescript-eslint/restrict-plus-operands
                    errors.push(err);
                    continue;
                }
            }
        }
        if (errors.length > 0) {
            failed = true;
            for (const error of errors) {
                console.log(error.message);
            }
        }
        console.log(failed ? 'failed' : 'done');
        process.exit(failed ? 1 : 0);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
})
    .parse(process.argv);
//# sourceMappingURL=sbtool-checkjson.js.map