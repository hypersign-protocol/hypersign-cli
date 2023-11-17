import {Args, Command, Flags, ux} from '@oclif/core'
import  dockerComponseTemplate from './docker-compose-template.json'
const YAMLFormatter = require('json-to-pretty-yaml');
import fs from 'fs';
import path from 'path'
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
import { randomUUID } from 'crypto';
import { DockerCompose  } from '../dockerCompose'
import { DependancyCheck } from '../dependencyCheck';
import { DataDirManager } from '../dataDirManager'
const Listr = require('listr')

type Task = {title: string; task: Function}

const dockerComposeFilePath = DataDirManager.DOCKERCOMPOSE_FILE_PATH 

export default class Setup extends Command {
  static description = 'Setup configurations for Hypersign issuer node infrastructure'
  tasks: Array<Task> = [];
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
    words: Flags.string({options: ['12', '24']}),
    configAlreayExists: Flags.string({options: ['y', 'N']}),
  }

  async generateWallet(words = 24) {
    const offlineSigner = await DirectSecp256k1HdWallet.generate(words);
    return offlineSigner.mnemonic
  }

  async setupConfigurationForHidNode(){
    { 

      // hid-node configuration
      const { flags } = await this.parse(Setup)
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

      this.tasks.push(this.getTask(`Hypersign Node Configuration`, this.delayedTask))
    }
  }

  async setupConfigurationForSSIAPI(){
    { 
      const { flags } = await this.parse(Setup)
      // SSI API configuration
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

        // let words = flags.words
        // if(!words) {
        //   let response: any = await inquirer.prompt([{
        //     name: 'words',
        //     message: 'Mnemonic length',
        //     type: "list",
        //     choices: [{name: '12' },  {name: '24' } ]
        //   }])
        //   words = response.words
        // } 

        let mnemonic = await this.generateWallet(24);
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

  getTask(taskTitle: string, task: Function, flag?: any): Task {
    return {
      title: taskTitle,
      task: () => task(flag, dockerComposeFilePath),
    }
  }

  delayedTask(){
    return new Promise((resolve, reject) =>{
      setTimeout(() => {
        resolve('true')
      }, 1500)
    })
  }

  public async run(): Promise<void> {   
    try {

   

    if(DataDirManager.checkIfDataDirInitated().status){

      const { flags } = await this.parse(Setup)
      const { default: inquirer } = await import("inquirer")
      let configAlreayExists = flags.configAlreayExists
      if(!configAlreayExists) {
        let response: any = await inquirer.prompt([{
          name: 'configAlreayExists',
          message: 'WARNING Configuration already exists, this action will erase all your existing configuration, do you still want to continue?',
          type: "confirm",
          choices: [{name: 'y'}, {name: 'n'}]
        }])
        configAlreayExists = response.configAlreayExists
      }

      if(!configAlreayExists){
       return
      } 
    }

    const checkingProcessesTasks = new Listr([
      this.getTask(`Checking if docker is installed`, DependancyCheck.ifProcessInstalled, 'docker'),
      this.getTask(`Checking if docker-compose is installed`, DependancyCheck.ifProcessInstalled, 'docker-compose'),
      this.getTask(`Checking if docker deamon is running`, DockerCompose.isDeamonRunning)
    ])
    
    await this.setupConfigurationForHidNode()
    await this.setupConfigurationForSSIAPI()
    
    const dockerCompose = YAMLFormatter.stringify(dockerComponseTemplate)
    await fs.writeFileSync(dockerComposeFilePath, dockerCompose)

    this.tasks.push(this.getTask(`Hypersign Mongo Db Service Configuration`, DockerCompose.pull, 'mongo'))
    this.tasks.push(this.getTask(`Hypersign Encrypted Data Vault Configuration`, DockerCompose.pull, 'edv'))
    this.tasks.push(this.getTask(`Hypersign SSI API Service Configuration`, DockerCompose.pull, 'ssi-api'))
    this.tasks.push(this.getTask(`Hypersign SSI API Proxy Service Configuration`, DockerCompose.pull, 'ssi-api-proxy'))
    this.tasks.push(this.getTask(`Hypersign Studio Dashboard Service Configuration`, DockerCompose.pull, 'studio'))
    this.tasks.push(this.getTask(`Hypersign Studio Dashboard UI Configuration`, DockerCompose.build, 'studio-ui'))

    { 
      const dockerTasks = new Listr(this.tasks, {concurrent: true})
      const allTasks = new Listr([
        this.getTask(`Checking all dependencies installed `, () => { return checkingProcessesTasks  }),
        this.getTask(`Setting all services configurations`, () => { return dockerTasks  }),
      ],  {concurrent: false},);

      ux.action.start('Finalizing ')
      allTasks.run()
      .then(async () => {
        const m = `
  🦄 All configurations setup successfully!
  🦄 You may run the 'studio-cli start' command to start your services.
        `
        ux.action.stop() 
        this.log(m)
      })
      .catch((err: any) => {
        console.error(err)
      })
    }

    
  }
  catch(e){
    DataDirManager.cleanWorkDir()
    throw e
  }

  }
}
