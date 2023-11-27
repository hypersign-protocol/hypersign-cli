import { Command, Flags, ux} from '@oclif/core'
import  DockerComponseTemplate from './docker-compose-template.json'
const YAMLFormatter = require('json-to-pretty-yaml');
import fs from 'fs';
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
import { randomUUID } from 'crypto';
import { DockerCompose  } from '../dockerCompose'
import { DependancyCheck } from '../dependencyCheck';
import { DataDirManager } from '../dataDirManager'
const Listr = require('listr')
import path from 'path'
import * as Messages from '../messages'
import { SecretManager } from '../secretManager'
type Task = {title: string; task: Function}
const dockerComposeFilePath = DataDirManager.DOCKERCOMPOSE_FILE_PATH 
const dockerComponseTemplateStr = JSON.stringify({ ...DockerComponseTemplate })
const dockerComponseTemplate = JSON.parse(dockerComponseTemplateStr)

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

  async setupMnemonic(secretManager: SecretManager){
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
      secretManager.setCredentials({ mnemonic })
      this.configParams.ssi.mnemonic  = mnemonic;
    } else if (mnemonicSetup === 'enter'){
      const mnemonicEnteredByUser = await ux.prompt(Messages.PROMPTS.ENTER_WORDS_MNEMONIC)
      secretManager.setCredentials({ mnemonic: mnemonicEnteredByUser })
      console.log(`Ented by user ` +  secretManager.getCredentials().mnemonic)
      this.configParams.ssi.mnemonic = secretManager.getCredentials().mnemonic
    }
  }

  async setupConfigurationForSSIAPI(secretManager: SecretManager){
    { 
      /// we will use this feature in the next version
      const credentials = secretManager.getCredentials()
      this.configParams.secrets.superAdminUsername = 'root' //await ux.prompt('Enter super admin username')
      this.configParams.secrets.superAdminPassword = credentials.superAdminPassword //await ux.prompt('Enter super admin password', {type: 'hide'})
      
      this.configParams.secrets.jwtSecret = credentials.jwtSecret //flags.jwtSecret ? flags.jwtSecret: dockerComponseTemplate.services['ssi-api'].environment.JWT_SECRET;
      this.configParams.secrets.sessionSecret = credentials.sessionSecret //flags.sessionSecret ? flags.sessionSecret: dockerComponseTemplate.services['ssi-api'].environment.SESSION_SECRET_KEY;
      
      {
        dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar].environment.JWT_SECRET = this.configParams.secrets.jwtSecret
        dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar].environment.MNEMONIC = this.configParams.ssi.mnemonic
        dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar].environment.SESSION_SECRET_KEY = this.configParams.secrets.sessionSecret
        dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar].environment.SUPER_ADMIN_PASSWORD = this.configParams.secrets.superAdminPassword
        dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar].environment.SUPER_ADMIN_USERNAME = this.configParams.secrets.superAdminUsername  

        if(!this.configParams.hidNode.isHidNodeSetup){
          dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar].environment.HID_NETWORK_API = this.configParams.hidNode.hidNetREST
          dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar].environment.HID_NETWORK_RPC = this.configParams.hidNode.hidNetRPC      
        }
    
        if(!this.configParams.edv.isEdvSetup) {
          dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar].environment.EDV_BASE_URL = this.configParams.edv.edvUrl
        }

        dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar].environment.EDV_CONFIG_DIR = path.join(Messages.SERVICES_NAMES.WORKDIRNAME, Messages.SERVICES_NAMES.API_EDV_CONFIG_DIR) 
        dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar].environment.EDV_DID_FILE_PATH = path.join(dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar].environment.EDV_CONFIG_DIR, 'edv-did.json')
        dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar].environment.EDV_KEY_FILE_PATH = path.join(dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar].environment.EDV_CONFIG_DIR, 'edv-keys.json')
      }
    }
  }


  async setupDashboardServiceConfig(secretManager: SecretManager){
    {
      const credentials = secretManager.getCredentials()
      dockerComponseTemplate.services[Messages.SERVICES_NAMES.DEVELOPER_SERVICE.monikar].environment.JWT_SECRET = credentials.jwtSecret
      dockerComponseTemplate.services[Messages.SERVICES_NAMES.DEVELOPER_SERVICE.monikar].environment.MNEMONIC = credentials.mnemonic
      dockerComponseTemplate.services[Messages.SERVICES_NAMES.DEVELOPER_SERVICE.monikar].environment.SESSION_SECRET_KEY = credentials.sessionSecret
      dockerComponseTemplate.services[Messages.SERVICES_NAMES.DEVELOPER_SERVICE.monikar].environment.SUPER_ADMIN_PASSWORD = credentials.superAdminPassword
      dockerComponseTemplate.services[Messages.SERVICES_NAMES.DEVELOPER_SERVICE.monikar].environment.SUPER_ADMIN_USERNAME = this.configParams.secrets.superAdminUsername  

      if(!this.configParams.hidNode.isHidNodeSetup){
        dockerComponseTemplate.services[Messages.SERVICES_NAMES.DEVELOPER_SERVICE.monikar].environment.HID_NETWORK_API = this.configParams.hidNode.hidNetREST
        dockerComponseTemplate.services[Messages.SERVICES_NAMES.DEVELOPER_SERVICE.monikar].environment.HID_NETWORK_RPC = this.configParams.hidNode.hidNetRPC      
      }
  
      if(!this.configParams.edv.isEdvSetup) {
        dockerComponseTemplate.services[Messages.SERVICES_NAMES.DEVELOPER_SERVICE.monikar].environment.EDV_BASE_URL = this.configParams.edv.edvUrl
      }
      dockerComponseTemplate.services[Messages.SERVICES_NAMES.DEVELOPER_SERVICE.monikar].environment.EDV_CONFIG_DIR = path.join(Messages.SERVICES_NAMES.WORKDIRNAME, Messages.SERVICES_NAMES.DASHBOARD_SERVICE_EDV_CONFIG_DIR)  
    }
  }

  async setupEDVConfig(secretManager: SecretManager){
    dockerComponseTemplate.services[Messages.SERVICES_NAMES.EDV_SERVICE.monikar].environment.DATA_VAULT = path.join(Messages.SERVICES_NAMES.WORKDIRNAME, Messages.SERVICES_NAMES.EDV_DATA_DIR)  
  }

  async setupStudioDashboardServiceConfig(secretManager: SecretManager){
    const credentials = secretManager.getCredentials()
    dockerComponseTemplate.services[Messages.SERVICES_NAMES.STUDIO_PLAYGROUND_SERVICE.monikar].environment.JWT_SECRET = credentials.jwtSecret
    if(!this.configParams.hidNode.isHidNodeSetup){
      dockerComponseTemplate.services[Messages.SERVICES_NAMES.STUDIO_PLAYGROUND_SERVICE.monikar].environment.HID_NETWORK_API = this.configParams.hidNode.hidNetREST
      dockerComponseTemplate.services[Messages.SERVICES_NAMES.STUDIO_PLAYGROUND_SERVICE.monikar].environment.HID_NETWORK_RPC = this.configParams.hidNode.hidNetRPC      
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

    const { default: inquirer } = await import("inquirer")
    if(DataDirManager.checkIfDataDirInitated().status){
      const { flags } = await this.parse(Setup)
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
    
    
    const servicesToRun = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selectedOptions',
      message: Messages.PROMPTS.CHOOSE_SERVICES,
      choices: [
        // { name: Messages.SERVICES_NAMES.EDV_SERVICE.name, value: Messages.SERVICES_NAMES.EDV_SERVICE.monikar },
        { name: Messages.SERVICES_NAMES.DEVELOPER_UI.name, value: Messages.SERVICES_NAMES.DEVELOPER_UI.monikar },
        { name: Messages.SERVICES_NAMES.STUDIO_PLAYGROUND_UI.name, value: Messages.SERVICES_NAMES.STUDIO_PLAYGROUND_UI.monikar },
        { name: Messages.SERVICES_NAMES.SSI_API_SERVICE.name, value: Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar },
        { name: 'All' },
      ],
    }])

    // Will run all service if skipped
    if(servicesToRun.selectedOptions.length == 0){
      servicesToRun.selectedOptions.push('All')
    }

    const servicesList = {
      
    } as any
    servicesToRun.selectedOptions.forEach((serviceMonikar: string) => {
      servicesList[serviceMonikar] = true;
    });

    const secretManager = SecretManager.getInstance()
    await secretManager.init();
   
    await this.setupConfigurationForHidNode()
    await this.setupMnemonic(secretManager)

    if(servicesList['All'] || servicesList[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar]) {
      await this.setupConfigurationForSSIAPI(secretManager)
    } else {
      delete dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar]
      delete dockerComponseTemplate.services[Messages.SERVICES_NAMES.SSI_API_PROXY_SERVICE.monikar]
    }

    if(servicesList['All'] || servicesList[Messages.SERVICES_NAMES.DEVELOPER_UI.monikar]) {
      await this.setupDashboardServiceConfig(secretManager)
    } else {
      delete dockerComponseTemplate.services[Messages.SERVICES_NAMES.DEVELOPER_UI.monikar]
      delete dockerComponseTemplate.services[Messages.SERVICES_NAMES.DEVELOPER_SERVICE.monikar]
    }
   
    // if(servicesList[Messages.SERVICES_NAMES.EDV_SERVICE.monikar]) {
    //   await this.setupEDVConfig(secretManager)  
    // } else {
    //   delete dockerComponseTemplate.services[Messages.SERVICES_NAMES.EDV_SERVICE.monikar]
    // }
    await this.setupEDVConfig(secretManager)
  
    if(servicesList['All'] || servicesList[Messages.SERVICES_NAMES.STUDIO_PLAYGROUND_UI.monikar]) {
      await this.setupStudioDashboardServiceConfig(secretManager)
    } else {
      delete dockerComponseTemplate.services[Messages.SERVICES_NAMES.STUDIO_PLAYGROUND_SERVICE.monikar]
      delete dockerComponseTemplate.services[Messages.SERVICES_NAMES.STUDIO_PLAYGROUND_UI.monikar]
    }

    const dockerCompose = YAMLFormatter.stringify(dockerComponseTemplate)
    await fs.writeFileSync(dockerComposeFilePath, dockerCompose)

    
    // db and edv service is mandatory
    this.tasks.push(this.getTask(Messages.TASKS.PULLING_MONGO_CONFIG, DockerCompose.pull, Messages.SERVICES_NAMES.DB_SERVICE.monikar))
    this.tasks.push(this.getTask(Messages.TASKS.PULLING_EDV_CONFIG, DockerCompose.pull, Messages.SERVICES_NAMES.EDV_SERVICE.monikar))

    // if(servicesList[Messages.SERVICES_NAMES.EDV_SERVICE.monikar]) {
    //   this.tasks.push(this.getTask(Messages.TASKS.PULLING_EDV_CONFIG, DockerCompose.pull, Messages.SERVICES_NAMES.EDV_SERVICE.monikar))
    // }
    
    if(servicesList['All'] || servicesList[Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar]) {
      this.tasks.push(this.getTask(Messages.TASKS.PULLING_SSI_API_CONFIG, DockerCompose.pull, Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar))
      this.tasks.push(this.getTask(Messages.TASKS.PULLING_SSI_API_PROXY_CONFIG, DockerCompose.pull, Messages.SERVICES_NAMES.SSI_API_PROXY_SERVICE.monikar))
    }
    
    if(servicesList['All'] || servicesList[Messages.SERVICES_NAMES.DEVELOPER_UI.monikar]) {
      this.tasks.push(this.getTask(Messages.TASKS.PULLING_DEVELOPER_SERVICE_CONFIG, DockerCompose.pull, Messages.SERVICES_NAMES.DEVELOPER_SERVICE.monikar))
      this.tasks.push(this.getTask(Messages.TASKS.PULLING_DEVELOPER_UI_CONFIG, DockerCompose.build, Messages.SERVICES_NAMES.DEVELOPER_UI.monikar))
    }
    
    if(servicesList['All'] || servicesList[Messages.SERVICES_NAMES.STUDIO_PLAYGROUND_UI.monikar]) {
      this.tasks.push(this.getTask(Messages.TASKS.PULLING_STUDIO_SERVICE_CONFIG, DockerCompose.pull, Messages.SERVICES_NAMES.STUDIO_PLAYGROUND_SERVICE.monikar))
      this.tasks.push(this.getTask(Messages.TASKS.PULLING_STUDIO_UI_CONFIG, DockerCompose.build, Messages.SERVICES_NAMES.STUDIO_PLAYGROUND_UI.monikar))    
    }
    
    { 
      const dockerTasks = new Listr(this.tasks, {concurrent: true})
      const allTasks = new Listr([
        this.getTask(Messages.TASKS.IF_ALL_DEPENDENCIES_INSTALLED, () => { return checkingProcessesTasks  }),
        this.getTask(Messages.TASKS.SETTING_SERVIES_CONFIG, () => { return dockerTasks  }),
      ],  {concurrent: false},);

      ux.action.start('Please wait ')
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
