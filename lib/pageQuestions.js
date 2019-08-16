const inquirer = require('inquirer')

module.exports = async function (options){

  const questions = [];

  questions.push({
      type: 'list',
      name: 'template',
      message: 'Please choose which project template to use',
      choices: ['View', 'Urt', 'Yp', 'Sticker', 'Button']
  });

  questions.push({
    type: 'input',
    name: 'einame',
    message: 'Please enter EiName'
  });

  questions.push({
    type: 'input',
    name: 'eitag',
    message: 'Please enter EiTag'
  });

  questions.push({
    type: 'input',
    name: 'eitoken',
    message: 'Please enter name of EiToken for cookie'
  });

  questions.push({
    type: 'input',
    name: 'stoken',
    message: 'Please enter name of SToken for cookie'
  });

  const answer = await inquirer.prompt(questions);
  return {
    ... options,
    template: options.template || answer.template,
    einame: options.einame || answer.einame,
    eitag: options.eitag || answer.eitag,
    eitoken: options.eitoken || answer.eitoken,
    stoken: options.stoken || answer.stoken,
  }
}
