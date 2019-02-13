#! /usr/bin/env node
const program = require('commander')
const chalk = require('chalk')
const download = require('download-git-repo')
const pkg = require('./package.json')
const Spinner = require('cli-spinner').Spinner
const spinner = new Spinner('下载中.. %s')
const url = {
  // gitlab私有库
  // const url = 'direct:http://192.xxx.0.xxx:8888/luominmin/caizhi-admin.git#qa'
  react: 'direct:https://github.com/myadomin/react-temp.git',
  vue: 'direct:https://github.com/myadomin/vue-temp.git'
}

program
.version(pkg.version, '-v, --version')
.command('init [projectType]')
.action(function(projectType, options){
  if (projectType === 'react' || projectType === 'vue') {
    const toPath = './'
    console.log(`开始下载${projectType}模板`)
    spinner.start()
    download(url[projectType], toPath, { clone: true }, function (err) {
      if (err) {
        console.log(chalk.red('\n下载失败: 当前目录必须是空目录\n'), err)
      } else {
        console.log(chalk.green('\n下载成功'))
      }
      spinner.stop()
    })
  } else {
    console.log('请选择初始化react项目还是vue项目')
    console.log('react项目请用命令：' + chalk.green('adomin-cli init react'))
    console.log('vue项目请用命令：' + chalk.green('adomin-cli init vue'))
  }
})
program.parse(process.argv)