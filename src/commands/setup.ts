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
import * as Messages from '../messages'
type Task = {title: string; task: Function}

const dockerComposeFilePath = DataDirManager.DOCKERCOMPOSE_FILE_PATH 

export default class Setup extends Command {
  static description = Messages.LOG.SETUP_DESCRIPTION
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
          message: Messages.PROMPTS.SELECT_NETWORK,
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
        throw new Error(Messages.ERRORS.NETWORK_NOT_SUPPOERTED)
      } else if (networks === 'custom'){
        throw new Error(Messages.ERRORS.NETWORK_NOT_SUPPOERTED)
      }

      this.tasks.push(this.getTask(Messages.TASKS.HID_NODE_CONFIG, this.delayedTask))
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
          message: Messages.PROMPTS.CHOOSE_MNEMONIC,
          type: "list",
          choices: [{name: 'enter' },  {name: 'generate' } ]
        }])
        mnemonicSetup = response.mnemonicSetup
      }
      if(mnemonicSetup === 'generate') {
        let mnemonic = await this.generateWallet(24);
        this.log('  '+mnemonic)
        this.configParams.ssi.mnemonic  = mnemonic;
      } else if (mnemonicSetup === 'enter'){
        this.configParams.ssi.mnemonic = await ux.prompt(Messages.PROMPTS.ENTER_WORDS_MNEMONIC)
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

  getTask(taskTitle: string, task: Function, flag?: any): Task {
    return {
      title: taskTitle,
      task: async () => await task(flag, dockerComposeFilePath),
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
          message: Messages.PROMPTS.CONFIGURATION_ALREADY_EXISTS_Q,
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
      this.getTask(Messages.TASKS.IF_DOCKER_INSTALLED, DependancyCheck.ifProcessInstalled, Messages.SERVICES_NAMES.DOCKER),
      this.getTask(Messages.TASKS.IF_DOCKER_COMPOSE_INSTALLED, DependancyCheck.ifProcessInstalled, Messages.SERVICES_NAMES.DOCKER_COMPOSE),
      this.getTask(Messages.TASKS.IF_DOCKER_DEAMON_RUNNING, DockerCompose.isDeamonRunning)
    ])
    
    await this.setupConfigurationForHidNode()
    await this.setupConfigurationForSSIAPI()
    
    const dockerCompose = YAMLFormatter.stringify(dockerComponseTemplate)
    await fs.writeFileSync(dockerComposeFilePath, dockerCompose)

    this.tasks.push(this.getTask(Messages.TASKS.PULLING_MONGO_CONFIG, DockerCompose.pull, 'mongo'))
    this.tasks.push(this.getTask(Messages.TASKS.PULLING_EDV_CONFIG, DockerCompose.pull, 'edv'))
    this.tasks.push(this.getTask(Messages.TASKS.PULLING_SSI_API_CONFIG, DockerCompose.pull, 'ssi-api'))
    this.tasks.push(this.getTask(Messages.TASKS.PULLING_SSI_API_PROXY_CONFIG, DockerCompose.pull, 'ssi-api-proxy'))
    this.tasks.push(this.getTask(Messages.TASKS.PULLING_STUDIO_SERVICE_CONFIG, DockerCompose.pull, 'studio'))
    this.tasks.push(this.getTask(Messages.TASKS.PULLING_STUDIO_UI_CONFIG, DockerCompose.build, 'studio-ui'))

    { 
      const dockerTasks = new Listr(this.tasks, {concurrent: true})
      const allTasks = new Listr([
        this.getTask(Messages.TASKS.IF_ALL_DEPENDENCIES_INSTALLED, () => { return checkingProcessesTasks  }),
        this.getTask(Messages.TASKS.SETTING_SERVIES_CONFIG, () => { return dockerTasks  }),
      ],  {concurrent: false},);

      ux.action.start('Finalizing ')
      allTasks.run()
      .then(async () => {
        ux.action.stop() 
        this.log(Messages.LOG.ALL_CONFIG_SUCCESS)
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
