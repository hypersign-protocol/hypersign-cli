import {Args, Command, Flags} from '@oclif/core'
import  dockerComponseTemplate from './docker-compose-template.json'

const YAMLFormatter = require('json-to-pretty-yaml');
import fs from 'fs';


export default class Start extends Command {
  static description = 'describe the command here'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    hidNetRPC: Flags.string({
      name: 'hid-net-rpc',
      char: 'h',
      description: 'HID Network RPC endpoint',
    }),
    hidNetREST: Flags.string({
      name: 'hid-net-rest',
      char: 'y',
      description: 'HID Network REST endpoint',
    }),
    mnemonic: Flags.string({
      name: 'mnemonic',
      char: 'm',
      description: 'Mnemonic for this issuer node',
      required: true,

    }),
    jwtSecret: Flags.string({
      name: 'jwt-secret',
      char: 'j',
      description: 'JWT secret for this issuer node',
    })
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Start)

    const configParams = {
      hidNetRPC: '',
      hidNetREST: '',
      nameSpace: 'testnet',
      mnemonic: '',
      jwtSecret: '',
    }

    configParams.hidNetREST = flags.hidNetREST ? flags.hidNetREST: dockerComponseTemplate.services['api.entity.id'].environment.HID_NETWORK_API
    configParams.hidNetRPC = flags.hidNetRPC ? flags.hidNetRPC: dockerComponseTemplate.services['api.entity.id'].environment.HID_NETWORK_RPC
    configParams.mnemonic = flags.mnemonic;
    configParams.jwtSecret = flags.jwtSecret ? flags.jwtSecret: dockerComponseTemplate.services['api.entity.id'].environment.JWT_SECRET;

    dockerComponseTemplate.services['api.entity.id'].environment.JWT_SECRET = configParams.jwtSecret
    dockerComponseTemplate.services['api.entity.id'].environment.MNEMONIC = configParams.mnemonic
    dockerComponseTemplate.services['api.entity.id'].environment.HID_NETWORK_API = configParams.hidNetREST
    dockerComponseTemplate.services['api.entity.id'].environment.HID_NETWORK_RPC = configParams.hidNetRPC    

    const dockerCompose = YAMLFormatter.stringify(dockerComponseTemplate)

    await fs.writeFileSync('docker-compose.yml', dockerCompose)
    this.log('Configuration setup successfully ')
  }
}
