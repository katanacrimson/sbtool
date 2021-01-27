//
// sbtool - A collection of Starbound modding command-line tools.
//
// @copyright (c) 2018 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/sbtool>
//

import * as fs from 'fs'
import * as path from 'path'

import * as app from 'commander'

import * as readdir from 'recursive-readdir'
import * as stripComments from 'strip-json-comments'
import * as patch from 'fast-json-patch'

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')).toString())

app
  .version(pkg.version, '-v, --version')
  .arguments('<assets> <workingDir> <dest>')
  .action(async (assetPath: string, workingDir: string, destDir: string) => {
    try {
      const source = path.resolve(process.cwd(), workingDir)
      const target = path.resolve(process.cwd(), destDir)

      try {
        await fs.promises.access(assetPath, fs.constants.R_OK)
        await fs.promises.access(path.join(assetPath, '/player.config'), fs.constants.R_OK)
      } catch (err) {
        await fs.promises.access(target, fs.constants.R_OK)
        throw new Error('The assets path either does not exist or is not correctly unpacked.')
      }

      try {
        await fs.promises.access(source, fs.constants.R_OK)
      } catch (err) {
        throw new Error('The specified working directory does not exist or is not readable.')
      }

      try {
        await fs.promises.access(target, fs.constants.R_OK)
      } catch (err) {
        throw new Error('The specified destination directory does not exist or is not readable.')
      }

      // these should let us ignore files that can't be JSON-patched.
      const ignoredExtensions = [
        // .disabled and .objectdisabled exist in the Starbound asset files
        //   we're ignoring them for now, because we probably shouldn't be JSON patching a disabled file o_O
        '*.disabled', // ignored for now. @todo: reconsider?
        '*.objectdisabled', // ignored for now. @todo: reconsider?
        '*.ase' // no idea why an ASE file is in the Starbound assets...lol Chucklefish.
      ]

      const unpatchableExtensions = [
        '.md',
        '.png',
        '.wav',
        '.ogg',
        '.ttf',
        '.lua',
        '.txt',
        '.psd',
        '.pdn',
        '.broken',
        '.db'
      ]

      const unpatchableFiles = [
        '_metadata',
        '.metadata',
        '.gitignore',
        '.git',
        '_previewimage'
      ]

      const files = await readdir(source, ignoredExtensions)

      let failed = false
      for (const filePath of files) {
        // sanity check
        if (!filePath.startsWith(source)) {
          return
        }

        const relFilepath = filePath.substring(source.length)
        const assetFilepath = path.join(assetPath, relFilepath)
        let destFilepath = path.join(target, relFilepath)

        // unpatchable files fall into this case
        if (unpatchableExtensions.includes(path.extname(filePath).toLowerCase()) || unpatchableFiles.includes(path.basename(filePath).toLowerCase())) {
          try {
            await fs.promises.mkdir(path.dirname(destFilepath), { recursive: true }) // using recursive:true to ignore if it already existed
            await fs.promises.copyFile(filePath, destFilepath)
          } catch (err) {
            console.error(`failed to copy mod file to ${destFilepath}`)
            console.error(err)
            failed = true
          }
          console.log(`sucessfully copied mod file to ${destFilepath}`)
          continue
        }

        // newly introduced files fall into this case
        try {
          await fs.promises.access(assetFilepath, fs.constants.R_OK)
        } catch (_err) {
          console.log(`asset ${relFilepath} does not seem to exist in Starbound asset files...`)
          console.log(`copying file to ${destFilepath}`)

          try {
            await fs.promises.mkdir(path.dirname(destFilepath), { recursive: true }) // using recursive:true to ignore if it already existed
            await fs.promises.copyFile(filePath, destFilepath)
          } catch (err) {
            console.error('failed to copy mod file to ' + destFilepath)
            console.error(err)
            failed = true
          }
          console.log(`sucessfully copied mod file to ${destFilepath}`)
          continue
        }

        // assume this is a json-patchable file from here on
        destFilepath += '.patch'

        let originalFile = null
        let modifiedFile = null

        try {
          originalFile = JSON.parse(stripComments(await fs.promises.readFile(assetFilepath, 'utf8')))
        } catch (err) {
          console.error(`failed to load ${relFilepath} from Starbound asset files`)
          console.error(err)
          failed = true
          continue
        }

        try {
          modifiedFile = JSON.parse(stripComments(await fs.promises.readFile(filePath, 'utf8')))
        } catch (err) {
          console.error(`failed to load ${relFilepath} from modded asset files`)
          console.error(err)
          failed = true
          continue
        }

        const diff = patch.compare(originalFile, modifiedFile)
        try {
          const jsonDiff = JSON.stringify(diff, null, 2).replace('\n', '\r\n')
          await fs.promises.writeFile(destFilepath, jsonDiff)
        } catch (err) {
          console.error(`failed to write mod patch file to ${destFilepath}`)
          console.error(err)
          failed = true
          continue
        }

        console.log(`successfully created mod patch file at ${destFilepath}`)
      }

      console.log(failed ? 'failed' : 'done')
      process.exit(failed ? 1 : 0)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })
  .parse(process.argv)
