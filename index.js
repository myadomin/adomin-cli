#! /usr/bin/env node
const program = require('commander')
const chalk = require('chalk')
const download = require('download-git-repo')
const pkg = require('./package.json')
const Spinner = require('cli-spinner').Spinner
const spinner = new Spinner('downloading... %s')
const inquirer = require('inquirer');
const fs = require('fs-extra')
const url = {
  // gitlab私有库
  // const url = 'direct:http://192.xxx.0.xxx:8888/luominmin/caizhi-admin.git#qa'
  react: 'direct:https://github.com/myadomin/react-temp.git',
  vue: 'direct:https://github.com/myadomin/vue-temp.git'
}

const log = (str) => console.log(str)
const logSuccess = (str) => console.log(chalk.green(str))
const logError = (str) => console.log(chalk.red(str))

const downloadFile = (projectType, projectName, needExample) => {
  log(`download ${projectType} temp, to folder ${__dirname + '\\' + projectName}`)
  spinner.start()
  download(url[projectType], projectName, { clone: true }, function (err) {
    if (err) {
      logError('download error')
    } else {
      logSuccess('download success')
    }
    spinner.stop()
  })
}
program
.version(pkg.version, '-v, --version')
.command('init [projectType] [projectName]')
.action(function(projectType, projectName, options){
  if ((projectType === 'react' || projectType === 'vue') && projectName) {
    fs.pathExists(__dirname + '\\' + projectName).then(exists => {
      if (!exists) {
        downloadFile(projectType, projectName)
        // TODO 根据answers.example下载不同模板
        // inquirer.prompt([
        //   {
        //     type: 'list',
        //     message: '脚手架中是否需要example:',
        //     name: 'example',
        //     choices: [
        //       "no",
        //       "yes"
        //     ],
        //   }
        // ]).then(answers => {
        //   downloadFile(projectType, projectName, answers.example)
        // });
      } else {
        logError('folder existed')
      }
    }).catch(err => {
      log(err)
    })
  } else {
    logError('input error')
    log('react project input: adomin-cli init react projectName')
    log('vue project input: adomin-cli init vue projectName')
  }
})
program.parse(process.argv)