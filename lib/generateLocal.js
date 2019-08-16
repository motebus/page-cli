const chalk = require('chalk')
const Metalsmith = require('metalsmith')
const render = require('consolidate').handlebars.render
const path = require('path')
const logger = require('./logger')
const async = require('async')
const metadata = require('read-metadata')
const transform = require('metalsmith-transform')
const exists = require('fs').existsSync


module.exports = function generate (name, src, dest, options, done) {
  if(options.inputType == 'JsonFile')
  {
    if (exists(options.jsonFile)) {
      options = metadata.sync(options.jsonFile);
    }
  }
  const metalsmith = Metalsmith(path.join(src))
  const data = Object.assign(metalsmith.metadata(), {
    destDirName: name,
    inPlace: dest === process.cwd(),
    noEscape: true
  })

  metalsmith
    .use(transform(function(fileObject, metalsmithData) {
      return fileObject;
    }))
    .use(askOptions(options))
    .use(renderTemplateFiles())

  metalsmith.clean(false)
    .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
    .destination(dest)
    .build((err, files) => {
      done(err)
      if (typeof options.complete === 'function') {
        const helpers = { chalk, logger, files }
        options.complete(data, helpers)
      } else {
        logMessage(options.completeMessage, data)
      }
    })

  return data
}

function askOptions(options) {
    return (files, metalsmith, done) => {
      var prompts = Object.keys(options);
      var metadata = metalsmith.metadata();

      async.eachSeries(prompts, run, done);

      function run(key, done){
        metadata[key] = options[key];
        done();
      }
    }
}


function renderTemplateFiles () {
  return (files, metalsmith, done) => {
    const keys = Object.keys(files)
    const metalsmithMetadata = metalsmith.metadata()
    async.each(keys, (file, next) => {

      const str = files[file].contents.toString()
      // do not attempt to render files that do not have mustaches
      if (!/{{([^{}]+)}}/g.test(str)) {
        return next()
      }
      render(str, metalsmithMetadata, (err, res) => {
        if (err) {
          err.message = `[${file}] ${err.message}`
          return next(err)
        }
        files[file].contents = new Buffer.from(res)
        next()
      })
    }, done)
  }
}

/**
 * Display template complete message.
 *
 * @param {String} message
 * @param {Object} data
 */

function logMessage (message, data) {
  if (!message) return
  render(message, data, (err, res) => {
    if (err) {
      console.error('\n   Error when rendering template complete message: ' + err.message.trim())
    } else {
      console.log('\n' + res.split(/\r?\n/g).map(line => '   ' + line).join('\n'))
    }
  })
}
