# sbtool

## A collection of Starbound modding command-line tools.

sbtool is a small suite of useful command-line tools for use during an automated build process.

For help, use the command `sbtool -h`

### Usage

Currently available are the following commands:

`sbtool genpatch $assets $modifiedDir $dest` - generates JSON patch files, given a set of original files at **$asset** and set of modified files at **$modifiedDir**, outputting to **$dest**

`sbtool pngpack $target` - compress png assets in **$target** to save space

`sbtool checkjson $target` - validates all files in **$target** for JSON validity (works around JSON spec violations by Starbound)

### License

Licensed under the MIT license.  See ./LICENSE for the license text.
