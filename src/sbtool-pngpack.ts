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
import * as sharp from 'sharp'

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')).toString())

app
  .version(pkg.version, '-v, --version')
  .arguments('<target>')
  .action(async (destDir: string) => {
    try {
      const target = path.resolve(process.cwd(), destDir)

      try {
        await fs.promises.access(target, fs.constants.R_OK)
      } catch (err) {
        throw new Error('The specified target directory does not exist or is not readable.')
      }

      const evaluator = (file: string, stats: fs.Stats): boolean => {
        return (stats.isFile() && path.extname(file) !== '.png')
      }

      const files = await readdir(target, [evaluator])

      let failed = false
      let totalSaved = 0
      for (const filePath of files) {
        // sanity check
        if (!filePath.startsWith(target)) {
          return
        }

        try {
          await sharp(filePath)
            .png({ compressionLevel: 6 })
            .toFile(filePath + '.crushed')
        } catch (err) {
          console.error(`failed to crush ${filePath}`)
          console.error(err)
          failed = true
          continue
        }

        const originalStat = await fs.promises.stat(filePath)
        const crushedStat = await fs.promises.stat(filePath + '.crushed')

        if (originalStat.size <= crushedStat.size) {
          console.log(`not crushing ${filePath}, original is smaller than crushed variant`)
          try {
            await fs.promises.unlink(filePath + '.crushed')
          } catch (err) {
            console.error(`failed to remove crushed file ${filePath + '.crushed'}`)
            console.error(err)
            failed = true
            continue
          }
        } else {
          try {
            await fs.promises.copyFile(filePath + '.crushed', filePath)
            await fs.promises.unlink(filePath + '.crushed')
          } catch (err) {
            console.error(`failed to replace file ${filePath}`)
            console.error(err)
            failed = true
            continue
          }

          const savedBytes = originalStat.size - crushedStat.size
          totalSaved += savedBytes

          console.log(`crushed ${filePath} down to ${crushedStat.size} bytes, saved ${savedBytes} bytes`)
        }
      }

      if (failed) {
        console.log('failed')
        process.exit(1)
      }

      console.log('done')
      console.log(`saved ${totalSaved} bytes in total`)
      process.exit(0)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })
  .parse(process.argv)
