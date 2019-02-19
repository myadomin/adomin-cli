#! /usr/bin/env node
const program = require('commander')
const chalk = require('chalk')
const download = require('download-git-repo')
const pkg = require('./package.json')
const Spinner = require('cli-spinner').Spinner
const spinner = new Spinner('generating... %s')
const inquirer = require('inquirer');
const fs = require('fs-extra')
const metalsmith  = require('metalsmith')
const rm = require('rimraf').sync
const Handlebars = require('handlebars')
const url = {
  // gitlab私有库
  // const url = 'direct:http://192.xxx.0.xxx:8888/luominmin/caizhi-admin.git#qa'
  react: 'direct:https://github.com/myadomin/react-temp.git',
  vue: 'direct:https://github.com/myadomin/vue-temp.git'
}

const log = (str) => console.log(str)
const logSuccess = (str) => console.log(chalk.green(str))
const logError = (str) => console.log(chalk.red(str))

const promptArr = [
  {
    type: 'list',
    message: 'need example in scaffolding?',
    name: 'needExample',
    choices: [
      "no",
      "yes"
    ],
  }
  // {
  //   type: 'input',
  //   name: 'projectName',
  //   message: 'input projectName',
  //   default: 'myProject'
  // },
  // {
  //   type: 'input',
  //   name: 'projectVersion',
  //   message: 'input projectVersion',
  //   default: '1.0.0'
  // },
  // {
  //   type: 'input',
  //   name: 'projectDescription',
  //   message: 'input projectDescription',
  //   default: `A project named myProject`
  // }
]

// download file from git, save to downloadPath(从git下载模板 存到downloadPath)
const downloadFile = (projectType, generatePath, meta) => {
  log(`generate ${projectType} temp, to folder ${process.cwd()}\\${generatePath}`)
  spinner.start()
  const downloadPath = generatePath + '_temp'
  download(url[projectType], downloadPath, { clone: true }, function (err) {
    if (err) {
      logError('download error')
    } else {
      generate(downloadPath, generatePath, meta)
    }
  })
}

// use file downloadPath generate file generatePath(用metalsmith根据meta将文件downloadPath处理为文件generatePath)
const generate = (downloadPath, generatePath, meta) => {
  metalsmith(process.cwd())
  .metadata(meta)
  .source(downloadPath)
  .destination(generatePath)
  .clean(true)
  .use((files, metalsmith, done) => {
    const meta = metalsmith.metadata()
    Object.keys(files).forEach(fileName => {
      // 只对package.json做Handlebars的模板解析(根据meta解析)
      // if (fileName.indexOf('package.json') !== -1) {
      //   const t = files[fileName].contents.toString()
      //   files[fileName].contents = new Buffer.from(Handlebars.compile(t)(meta))
      // }
      // 根据meta.needExample 决定是否删除examples文件夹
      if (meta.needExample === 'no' && fileName.indexOf('examples') !== -1) {
        delete files[fileName]
      }
    })
    done()
  })
  .build(function(err) {
    rm(downloadPath)
    err ? log(err) : logSuccess('generate success')
    spinner.stop()
  });
}

program
.version(pkg.version, '-v, --version')
.command('init [projectType] [projectName]')
.action(function(projectType, projectName, options){
  if ((projectType === 'react' || projectType === 'vue') && projectName) {
    fs.pathExists(projectName).then(exists => {
      if (exists) {
        logError('folder existed')
      } else {
        inquirer.prompt(promptArr).then(answers => {
          downloadFile(projectType, projectName, answers)
        })
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