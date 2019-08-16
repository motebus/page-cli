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
    type: 'list',
    name: 'inputType',
    message: 'Please choose which ways for set config',
    choices: ['Question', 'JsonFile']
  });

  questions.push({
    type: 'input',
    name: 'jsonFile',
    message: 'Please enter JsonFilePath',
    when: function( answers ) {
      return answers.inputType === "JsonFile";
    }
  });

  questions.push({
    type: 'input',
    name: 'title',
    message: 'Please enter Title',
    when: function( answers ) {
      return answers.inputType === "Question";
    }
  });

  questions.push({
    type: 'confirm',
    name: 'icon',
    message: 'Do you want show icon?',
    when: function( answers ) {
      return answers.inputType === "Question";
    }
  });

  questions.push({
    type: 'confirm',
    name: 'header',
    message: 'Do you want show header?',
    when: function( answers ) {
      return answers.inputType === "Question";
    }
  });

  questions.push({
    type: 'confirm',
    name: 'footer',
    message: 'Do you want show footer?',
    when: function( answers ) {
      return answers.inputType === "Question";
    }
  });

  const answer = await inquirer.prompt(questions);
  return {
    ... options,
    template: options.template || answer.template,
    inputType: options.inputType || answer.inputType,
    jsonFile: options.jsonFile || answer.jsonFile,
    title: options.title || answer.title,
    icon: options.icon || answer.icon,
    header: options.header || answer.header,
    footer: options.footer || answer.footer,
  }
}
