const chalk = require('chalk')

module.exports = {
  v2SuffixTemplatesDeprecated (template, name) {
    const initCommand = 'page init ' + template.replace('-2.0', '') + ' ' + name

    console.log(chalk.red('  This template is deprecated, as the original template now uses Page 2.0 by default.'))
    console.log()
    console.log(chalk.yellow('  Please use this command instead: ') + chalk.green(initCommand))
    console.log()
  },
  v2BranchIsNowDefault (template, name) {
    const page1InitCommand = 'page init ' + template + '#1.0' + ' ' + name

    console.log(chalk.green('  This will install Page 2.x version of the template.'))
    console.log()
    console.log(chalk.yellow('  For Page 1.x use: ') + chalk.green(page1InitCommand))
    console.log()
  }
}
