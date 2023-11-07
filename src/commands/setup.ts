import {Args, Command, Flags, ux} from '@oclif/core'
import  dockerComponseTemplate from './docker-compose-template.json'
const YAMLFormatter = require('json-to-pretty-yaml');
import fs from 'fs';


export default class Setup extends Command {
  static description = 'Hypersign Entity Node Setup Cli'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    environment: Flags.string({options: ['testnet', 'mainnet']}),
    isBlockchainNode: Flags.string({options: ['y', 'N']}),
    isEDV: Flags.string({options: ['y', 'N']}),
  }

  public async run(): Promise<void> {
    
    const { default: inquirer } = await import("inquirer")
    // just prompt for input
    
    const configParams = {
      hidNetRPC: '',
      hidNetREST: '',
      nameSpace: 'testnet',
      mnemonic: '',
      jwtSecret: '',
      sessionSecret: '',
      superAdminUsername: '',
      superAdminPassword: '',
      edvUrl: '',
      isEDV: true,
      setupBlockchainNode: true,
    }

    const { flags } = await this.parse(Setup)

    let isBlockchainNode = flags.isBlockchainNode
    if(!isBlockchainNode) {
      
      let response: any = await inquirer.prompt([{
        name: 'isBlockchainNode',
        message: 'Do you want to setup Hypersign Blockchain node?',
        type: 'list',
        choices: [{name: 'y'}, {name: 'n'}]
      }])
      isBlockchainNode = response.isBlockchainNode
    }

    if(isBlockchainNode === 'n' ){
      // skip hid-node container..
      configParams.hidNetREST = await ux.prompt('Provide HID Node REST endpoint:')
      configParams.hidNetRPC = await ux.prompt('Provide HID Node RPC endpoint:')
      configParams.setupBlockchainNode = false
    } else {
      /// TODO: Ask params to setup hypersign node container
      
      ux.action.start('Setting HID-node configurations')
      ux.action.stop() 
    }

    let isEDV = flags.isEDV
    if(!isEDV) {
      let response: any = await inquirer.prompt([{
        name: 'isEDV',
        message: 'Do you want to setup Encrypted Data Vault service?',
        type: 'list',
        choices: [{name: 'y'}, {name: 'n'}]
      }])
      isEDV = response.isEDV
    }

    if(isEDV === 'n' ){
      // skip edv service container..
      configParams.edvUrl = await ux.prompt('Provide Data Vault Service Endpoint:')
      configParams.isEDV = false
      // delete dockerComponseTemplate.services['edv.entity.id']
    } else {
      /// TODO: We need to setup edv service container..
      ux.action.start('Setting Data Vault Service configurations')
      ux.action.stop() 
    }

    configParams.mnemonic = await ux.prompt('Enter your mnemonic to control master edv:')
    configParams.superAdminUsername = await ux.prompt('Enter super admin username:')
    configParams.superAdminPassword = await ux.prompt('Enter super admin password?', {type: 'hide'})
    
    configParams.jwtSecret = flags.jwtSecret ? flags.jwtSecret: dockerComponseTemplate.services['api.entity.id'].environment.JWT_SECRET;
    configParams.sessionSecret = flags.sessionSecret ? flags.sessionSecret: dockerComponseTemplate.services['api.entity.id'].environment.SESSION_SECRET_KEY;
    
    dockerComponseTemplate.services['api.entity.id'].environment.JWT_SECRET = configParams.jwtSecret
    dockerComponseTemplate.services['api.entity.id'].environment.MNEMONIC = configParams.mnemonic
    if(!configParams.setupBlockchainNode){
      dockerComponseTemplate.services['api.entity.id'].environment.HID_NETWORK_API = configParams.hidNetREST
      dockerComponseTemplate.services['api.entity.id'].environment.HID_NETWORK_RPC = configParams.hidNetRPC      
    }

    dockerComponseTemplate.services['api.entity.id'].environment.SESSION_SECRET_KEY = configParams.sessionSecret
    dockerComponseTemplate.services['api.entity.id'].environment.SUPER_ADMIN_PASSWORD = configParams.superAdminPassword
    dockerComponseTemplate.services['api.entity.id'].environment.SUPER_ADMIN_USERNAME = configParams.superAdminUsername
    if(!configParams.isEDV) {
      dockerComponseTemplate.services['api.entity.id'].environment.EDV_BASE_URL = configParams.edvUrl
    }

    const dockerCompose = YAMLFormatter.stringify(dockerComponseTemplate)
    await fs.writeFileSync('docker-compose.yml', dockerCompose)
    this.log('Configuration setup successfully')
  }
}
