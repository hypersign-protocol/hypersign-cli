import {Args, Command, Flags, ux} from '@oclif/core'
import  dockerComponseTemplate from './docker-compose-template.json'
const YAMLFormatter = require('json-to-pretty-yaml');
import fs from 'fs';
import path from 'path'
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
import { randomUUID } from 'crypto';

const homedir = require('os').homedir();
const execa = require('execa')
const Listr = require('listr')

type Task = {title: string; task: Function}

console.log(homedir)

const WORKDIR= `${homedir}/.studio-cli`
const NGINXDIR = `${WORKDIR}/nginx`
const STUDIOFRONT = `${WORKDIR}/studio-frontend`

// if(fs.existsSync(WORKDIR)){
//   fs.rmdir(WORKDIR,  {recursive: true}, (err) => {
//     if(err) throw err
//   })
// }

if(!fs.existsSync(WORKDIR)){
  console.log(WORKDIR + ' does not exist')
  fs.mkdir(WORKDIR, (err) => {
    if(!err) console.log(WORKDIR + ' created')

    fs.mkdir(NGINXDIR, (err) => {
      if(err) throw err
       
        console.log(NGINXDIR + ' created')
        const oldPath = './nginx/nginx.conf'
        const newPath = NGINXDIR + '/nginx.conf'
        fs.rename(oldPath, newPath, function (err) {
          if (err) throw err
          console.log('nginx.conf Successfully renamed - AKA moved!')
        })
      
    })
  
    fs.mkdir(STUDIOFRONT, (err) => {
      if(!err) console.log(STUDIOFRONT + ' created')
  
      const oldPathNginxConf = './studio-frontend/nginx.conf'
      const newPathNginxConf = STUDIOFRONT + '/nginx.conf'
      fs.rename(oldPathNginxConf, newPathNginxConf, function (err) {
        if (err) throw err
        console.log('studio-/nginx.conf Successfully renamed - AKA moved!')
      })
  
  
      const oldPathDocker = './studio-frontend/Dockerfile'
      const newPathDocker = STUDIOFRONT + '/Dockerfile'
      fs.rename(oldPathDocker, newPathDocker, function (err) {
        if (err) throw err
        console.log('studio-/Dockerfile Successfully renamed - AKA moved!')
      })
    })
  })

 
}
const dockerComposeFilePath = path.join(WORKDIR, 'docker-compose.yml')
console.log(dockerComposeFilePath)

export default class Setup extends Command {
  static description = 'Setup configurations for Hypersign issuer node infrastructure'

  configParams = {
    database: {
      isDbSetup: true,
      dbUri: ''
    },
    hidNode: {
      isHidNodeSetup: false,
      hidNetRPC: '',
      hidNetREST: '',
      nameSpace: 'testnet',
    },
    edv: {
      isEdvSetup: true, 
      edvUrl: '',
    },
    ssi: {
      mnemonic: '',
    },
    secrets: {
      jwtSecret: '',
      sessionSecret: '',
      superAdminUsername: '',
      superAdminPassword: '',
    }
  }

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    environment: Flags.string({options: ['testnet', 'mainnet']}),
    networks: Flags.string({options: ['testnet', 'mainnet', 'custom']}),
    isHidNodeSetup: Flags.string({options: ['y', 'N']}),
    isEdvSetup: Flags.string({options: ['y', 'N']}),
    isDbSetup: Flags.string({options: ['y', 'N']}),
    mnemonicSetup: Flags.string({options: ['enter', 'generate']}),
    words: Flags.string({options: ['12', '24']})
  }

  setupConfigurationForDatabase(){

  }


  async generateWallet(words = 24) {
    const offlineSigner = await DirectSecp256k1HdWallet.generate(words);
    return offlineSigner.mnemonic
  }


  async setupConfigurationForHidNode(flag: string, context: Setup){
    
    const { default: inquirer } = await import("inquirer")
    
    let isBlockchainNode = flag
    if(!isBlockchainNode) {
      let response: any = await inquirer.prompt([{
        name: 'isHidNodeSetup',
        message: 'Do you want to setup Hypersign Blockchain node?',
        type: 'list',
        choices: [{name: 'y'}, {name: 'n'}]
      }])
      isBlockchainNode = response.isHidNodeSetup
    }

    if(isBlockchainNode === 'n' ){
      /// skip hid-node container..
      context.configParams.hidNode.hidNetRPC = await ux.prompt('Provide HID Node RPC endpoint')
      context.configParams.hidNode.hidNetREST = await ux.prompt('Provide HID Node REST endpoint')
      context.configParams.hidNode.isHidNodeSetup = false
    } else {
      /// TODO: Ask params to setup hypersign node container
      context.configParams.hidNode.isHidNodeSetup = true
      ux.action.start('Setting HID-node configurations')
      ux.action.stop() 
    }

    
  }

  async setupConfigurationForEdv(flag: string, context: Setup){
    
    const { default: inquirer } = await import("inquirer")
    let isEDV = flag
    if(!isEDV) {
      let response: any = await inquirer.prompt([{
        name: 'isEdvSetup',
        message: 'Do you want to setup Encrypted Data Vault service?',
        type: 'list',
        choices: [{name: 'y'}, {name: 'n'}]
      }])
      isEDV = response.isEdvSetup
    }

    if(isEDV === 'n' ){
      // skip edv service container..
      context.configParams.edv.edvUrl = await ux.prompt('Provide Data Vault Service Endpoint')
      context.configParams.edv.isEdvSetup = false
      // delete dockerComponseTemplate.services['edv.entity.id']
    } else {
      /// TODO: We need to setup edv service container..
      ux.action.start('Setting Data Vault Service configurations')
      ux.action.stop() 
    }
     


  }

  async setupSSIApiConfigration(flag: string, context: Setup){
    ux.action.start('Setting EDV configurations', 'initializing', { stdout: true });

    const { flags } = await this.parse(Setup)
    if(!this.configParams.hidNode.isHidNodeSetup){
      dockerComponseTemplate.services['ssi-api'].environment.HID_NETWORK_API = this.configParams.hidNode.hidNetREST
      dockerComponseTemplate.services['ssi-api'].environment.HID_NETWORK_RPC = this.configParams.hidNode.hidNetRPC      
    }

    if(!this.configParams.edv.isEdvSetup) {
      dockerComponseTemplate.services['ssi-api'].environment.EDV_BASE_URL = this.configParams.edv.edvUrl
    }

    this.configParams.ssi.mnemonic = await ux.prompt('Enter your mnemonic to control master edv')
    this.configParams.secrets.superAdminUsername = await ux.prompt('Enter super admin username')
    this.configParams.secrets.superAdminPassword = await ux.prompt('Enter super admin password', {type: 'hide'})
    this.configParams.secrets.jwtSecret = flags.jwtSecret ? flags.jwtSecret: dockerComponseTemplate.services['ssi-api'].environment.JWT_SECRET;
    this.configParams.secrets.sessionSecret = flags.sessionSecret ? flags.sessionSecret: dockerComponseTemplate.services['ssi-api'].environment.SESSION_SECRET_KEY;
    

    dockerComponseTemplate.services['ssi-api'].environment.JWT_SECRET = this.configParams.secrets.jwtSecret
    dockerComponseTemplate.services['ssi-api'].environment.MNEMONIC = this.configParams.ssi.mnemonic
    dockerComponseTemplate.services['ssi-api'].environment.SESSION_SECRET_KEY = this.configParams.secrets.sessionSecret
    dockerComponseTemplate.services['ssi-api'].environment.SUPER_ADMIN_PASSWORD = this.configParams.secrets.superAdminPassword
    dockerComponseTemplate.services['ssi-api'].environment.SUPER_ADMIN_USERNAME = this.configParams.secrets.superAdminUsername
    
    ux.action.stop('Finished.') 
    
  }

  getTask(taskTitle: string, task: Function, flag?: any): Task {
    return {
      title: taskTitle,
      task: () => task(flag),
    }
  }

  delayedTask(){
    return new Promise((resolve, reject) =>{
      setTimeout(() => {
        resolve('true')
      }, 1500)
    })
  }

  dockerComposePull(serviceName: string){
    return execa('docker-compose', [
      '-f',
      dockerComposeFilePath,
      'pull',
      serviceName,
    ])
  }

  dockerComposeBuild(serviceName: string){
    return execa('docker-compose', [
      '-f',
      dockerComposeFilePath,
      'build',
      serviceName,
    ])
  }

  public async run(): Promise<void> {    
    { 

      // fs.mkdir(WORKDIR, (err) => {
      //   if(!err){
      //     console.log(WORKDIR + ' created')
      //   }
      // });
      

      

      // was trying with listr, but did not work..
      // let allTasks;
      // const that = this;
      // const dockerTasks = new Listr([
      //   this.getTask(`Setting up hid-node configuration`, this.setupConfigurationForHidNode, flags.isHidNodeSetup, that),
      //   // this.getTask(`Setting up edv configuration`, this.setupConfigurationForEdv, flags.isEdvSetup, that),
      //   // this.getTask(`Setting up SSI API configuration`, this.setupSSIApiConfigration),
      // ])

      // allTasks = new Listr([
      //   this.getTask(`Setting configurations`, () => { return dockerTasks  }),
      // ],  {concurrent: false},);

      // allTasks.run()
      // .then(async () => {
      //   const dockerCompose = YAMLFormatter.stringify(dockerComponseTemplate)
      //   const dockerComposeFilePath = path.join(__dirname,'docker-compose.yml')
      //   this.log(dockerComposeFilePath)
      //   this.log(dockerCompose)
      //   await fs.writeFileSync(dockerComposeFilePath, dockerCompose)
      //   this.log('Configuration setup successfully')
      // })
      // .catch((err: any) => {
      //   console.error(err)
      // })
    }

    let tasks = [];

    // tasks.push(this.getTask(`Setting up workdir`, () => fs.mkdir(WORKDIR, (err) => { if(!err) { console.log('Created workdir')} }) ))
    const { flags } = await this.parse(Setup)

    { // hid-node configuration
      const { default: inquirer } = await import("inquirer")
    
      let networks = flags.networks
      if(!networks) {
        let response: any = await inquirer.prompt([{
          name: 'networks',
          message: 'Select Hypersign network',
          type: "list",
          choices: [{name: 'testnet' },  {name: 'custom', disabled: true}, {name: 'mainnet', disabled: true} ]
        }])
        networks = response.networks
      }

      if(networks == 'testnet'){
        this.configParams.hidNode.hidNetRPC = 'https://rpc.jagrat.hypersign.id/' //await ux.prompt(`[${networks}] Enter Hypersign Node RPC Endpoint`)
        this.configParams.hidNode.hidNetREST = 'https://api.jagrat.hypersign.id/' //await ux.prompt(`[${networks}] Enter Hypersign Node REST Endpoint`)
        this.configParams.hidNode.isHidNodeSetup = false
      } else if (networks === 'mainnet'){
        throw new Error("Network not supported, supported networks ['testnet']")
      } else if (networks === 'custom'){
        throw new Error("Network not supported, supported networks ['testnet']")
      }

      tasks.push(this.getTask(`Hypersign Node Configuration`, this.delayedTask))
    }


    // { // hid-node configuration
    //   const { default: inquirer } = await import("inquirer")
    
    //   let isBlockchainNode = flags.isHidNodeSetup
    //   if(!isBlockchainNode) {
    //     let response: any = await inquirer.prompt([{
    //       name: 'isHidNodeSetup',
    //       message: 'Do you want to setup Hypersign Blockchain node?',
    //       type: "confirm",
    //       choices: [{name: 'Y'}, {name: 'n'}]
    //     }])
    //     isBlockchainNode = response.isHidNodeSetup
    //   }


    //   this.log(isBlockchainNode)

    //   if(!isBlockchainNode){
    //     /// skip hid-node container..
    //     this.configParams.hidNode.hidNetRPC = await ux.prompt('Provide HID Node RPC endpoint')
    //     this.configParams.hidNode.hidNetREST = await ux.prompt('Provide HID Node REST endpoint')
    //     this.configParams.hidNode.isHidNodeSetup = false
    //   } else {
    //     /// TODO: Ask params to setup hypersign node container
    //     this.configParams.hidNode.isHidNodeSetup = true
    //     ux.action.start('Setting HID-node configurations')
    //     ux.action.stop() 
    //   }
    // }

    { //// edv configuration
      /// Disabling this option in first version of cli. Everyone has to setup edv
      // const { default: inquirer } = await import("inquirer")
      // let isEDV = flags.isEdvSetup
      // if(!isEDV) {
      //   let response: any = await inquirer.prompt([{
      //     name: 'isEdvSetup',
      //     message: 'Want to setup Encrypted Data Vault service?',
      //     type: "confirm",
      //     choices: [{name: 'y'}, {name: 'n'}]
      //   }])
      //   isEDV = response.isEdvSetup
      // }

      // if(!isEDV){
      //   // skip edv service container..
      //   this.configParams.edv.edvUrl = await ux.prompt('Provide Data Vault Service Endpoint')
      //   this.configParams.edv.isEdvSetup = false
      // } 

    }

    { // SSI API configuration
      const { default: inquirer } = await import("inquirer")
      
      let mnemonicSetup = flags.mnemonicSetup
      if(!mnemonicSetup) {
        let response: any = await inquirer.prompt([{
          name: 'mnemonicSetup',
          message: 'Choose mnemonic setup',
          type: "list",
          choices: [{name: 'enter' },  {name: 'generate' } ]
        }])
        mnemonicSetup = response.mnemonicSetup
      }
      if(mnemonicSetup === 'generate') {

        let words = flags.words
        if(!words) {
          let response: any = await inquirer.prompt([{
            name: 'words',
            message: 'Mnemonic length',
            type: "list",
            choices: [{name: '12' },  {name: '24' } ]
          }])
          words = response.words
        } 

        let mnemonic; 
        if(words === '12'){
          mnemonic = await this.generateWallet(12);  
        } else {
          mnemonic = await this.generateWallet(24);
        }
        
          this.log('  '+mnemonic)
          this.configParams.ssi.mnemonic  = mnemonic;
      } else if (mnemonicSetup === 'enter'){
        this.configParams.ssi.mnemonic = await ux.prompt('  Enter 24 or 12 words mnemonic')
      }

      
      /// we will use this feature in the next version
      this.configParams.secrets.superAdminUsername = 'root' //await ux.prompt('Enter super admin username')
      this.configParams.secrets.superAdminPassword = randomUUID() //await ux.prompt('Enter super admin password', {type: 'hide'})
      
      this.configParams.secrets.jwtSecret = randomUUID() //flags.jwtSecret ? flags.jwtSecret: dockerComponseTemplate.services['ssi-api'].environment.JWT_SECRET;
      this.configParams.secrets.sessionSecret = randomUUID() //flags.sessionSecret ? flags.sessionSecret: dockerComponseTemplate.services['ssi-api'].environment.SESSION_SECRET_KEY;
      
      {
        dockerComponseTemplate.services['ssi-api'].environment.JWT_SECRET = this.configParams.secrets.jwtSecret
        dockerComponseTemplate.services['ssi-api'].environment.MNEMONIC = this.configParams.ssi.mnemonic
        dockerComponseTemplate.services['ssi-api'].environment.SESSION_SECRET_KEY = this.configParams.secrets.sessionSecret
        dockerComponseTemplate.services['ssi-api'].environment.SUPER_ADMIN_PASSWORD = this.configParams.secrets.superAdminPassword
        dockerComponseTemplate.services['ssi-api'].environment.SUPER_ADMIN_USERNAME = this.configParams.secrets.superAdminUsername  

        if(!this.configParams.hidNode.isHidNodeSetup){
          dockerComponseTemplate.services['ssi-api'].environment.HID_NETWORK_API = this.configParams.hidNode.hidNetREST
          dockerComponseTemplate.services['ssi-api'].environment.HID_NETWORK_RPC = this.configParams.hidNode.hidNetRPC      
        }
    
        if(!this.configParams.edv.isEdvSetup) {
          dockerComponseTemplate.services['ssi-api'].environment.EDV_BASE_URL = this.configParams.edv.edvUrl
        }
      }

      {
        dockerComponseTemplate.services['studio'].environment.JWT_SECRET = this.configParams.secrets.jwtSecret
        dockerComponseTemplate.services['studio'].environment.MNEMONIC = this.configParams.ssi.mnemonic
        dockerComponseTemplate.services['studio'].environment.SESSION_SECRET_KEY = this.configParams.secrets.sessionSecret
        dockerComponseTemplate.services['studio'].environment.SUPER_ADMIN_PASSWORD = this.configParams.secrets.superAdminPassword
        dockerComponseTemplate.services['studio'].environment.SUPER_ADMIN_USERNAME = this.configParams.secrets.superAdminUsername  

        if(!this.configParams.hidNode.isHidNodeSetup){
          dockerComponseTemplate.services['studio'].environment.HID_NETWORK_API = this.configParams.hidNode.hidNetREST
          dockerComponseTemplate.services['studio'].environment.HID_NETWORK_RPC = this.configParams.hidNode.hidNetRPC      
        }
    
        if(!this.configParams.edv.isEdvSetup) {
          dockerComponseTemplate.services['studio'].environment.EDV_BASE_URL = this.configParams.edv.edvUrl
        }
      }

      

     
      tasks.push(this.getTask(`Hypersign Mongo Db Service Configuration`, this.dockerComposePull, 'mongo'))
      tasks.push(this.getTask(`Hypersign Encrypted Data Vault Configuration`, this.dockerComposePull, 'edv'))
      tasks.push(this.getTask(`Hypersign SSI API Service Configuration`, this.dockerComposePull, 'ssi-api'))
      tasks.push(this.getTask(`Hypersign SSI API Proxy Service Configuration`, this.dockerComposePull, 'ssi-api-proxy'))
      tasks.push(this.getTask(`Hypersign Studio Dashboard Service Configuration`, this.dockerComposePull, 'studio'))
      tasks.push(this.getTask(`Hypersign Studio Dashboard UI Configuration`, this.dockerComposeBuild, 'studio-ui'))
    }

    { //// edv configuration
      /// Disabling this option in first version of cli. Everyone has to setup edv
      // const { default: inquirer } = await import("inquirer")
      // let isEDV = flags.isEdvSetup
      // if(!isEDV) {
      //   let response: any = await inquirer.prompt([{
      //     name: 'isEdvSetup',
      //     message: 'Want to setup Encrypted Data Vault service?',
      //     type: "confirm",
      //     choices: [{name: 'y'}, {name: 'n'}]
      //   }])
      //   isEDV = response.isEdvSetup
      // }

      // if(!isEDV){
      //   // skip edv service container..
      //   this.configParams.edv.edvUrl = await ux.prompt('Provide Data Vault Service Endpoint')
      //   this.configParams.edv.isEdvSetup = false
      // } 
    }

    
    const dockerCompose = YAMLFormatter.stringify(dockerComponseTemplate)
    //this.log(dockerCompose)
    await fs.writeFileSync(dockerComposeFilePath, dockerCompose)

    { 

      // These are fake messages ...
      const dockerTasks = new Listr(tasks, {concurrent: true})
      // const allTasks = new Listr([
      //   this.getTask(`Setting configurations`, () => { return dockerTasks  }),
      // ],  {concurrent: false},);

      this.log('=======================================================================')
      ux.action.start('Setting up configurations for you', 'waiting', {stdout: true})
      dockerTasks.run()
      .then(async () => {
        const m = `
        All configurations setup successfully!
        You may run the 'studio-cli start' command to start your services.
        `
        ux.action.stop(m) 
        // this.log('  All configurations setup successfully!')
        // this.log('  You may run the `studio-cli start` command to start your services.')
      })
      .catch((err: any) => {
        console.error(err)
      })
    }


    // this.log('Configuration setup successfully')
  }
}
