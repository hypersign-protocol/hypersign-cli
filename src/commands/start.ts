import {Args, Command, Flags} from '@oclif/core'
import  dockerComponseTemplate from './docker-compose-template.json'
import {execSync} from 'child_process';

import path from 'path'
const YAMLFormatter = require('json-to-pretty-yaml');
import fs from 'fs';


export default class Start extends Command {
  static description = 'describe the command here'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    
    const dockerComposeFilePath = path.join(__dirname,'docker-compose.yml')
    this.log(dockerComposeFilePath)
    try{
      execSync(`docker-compose -f ${dockerComposeFilePath} up`, {
        stdio: 'inherit'
      })  

    }catch(error: any){
      this.error(`Error starting docker: ${error['message']}`);
    }
  }
}
