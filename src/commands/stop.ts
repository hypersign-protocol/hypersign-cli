import {Args, Command, Flags} from '@oclif/core'
import dockerComponseTemplate from './docker-compose-template.json'
import path from 'path'
import fs from 'fs'
import {DockerCompose } from '../dockerCompose'

const execa = require('execa')
const Listr = require('listr')

import { DataDirManager } from '../dataDirManager'

const dockerComposeFilePath = DataDirManager.DOCKERCOMPOSE_FILE_PATH


type Task = {title: string; task: Function}
export default class Stop extends Command {
  static description = 'Stop Hypersign issuer node infrastructure'
  static examples = ['<%= config.bin %> <%= command.id %>']
  
  getTask(taskTitle: string, task: Function, flag?: any): Task {
    return {
      title: taskTitle,
      task: () => task(flag, dockerComposeFilePath),
    }
  }


  public async run(): Promise<void> {
    if(!DataDirManager.checkIfDataDirInitated().status){
      throw new Error('No configuration found, kindly run `studio-cli setup` command first.')
    }
    
    let allTasks;
    // Shutdown running containers
    const containerDownTasks = new Listr([
      this.getTask(`Shutdown`, DockerCompose.down, 'stop')
    ])

    allTasks = new Listr([
      this.getTask(`Shutting down all container(s)`, () => { return containerDownTasks  }),
    ],  {concurrent: false},);

    
    
    allTasks.run()
    .then(() => {
        this.log('All containers has been stopped successfully')
    })
    .catch((err: any) => {
      console.error(err)
    })
  }
}
