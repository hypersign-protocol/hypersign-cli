import {Args, Command, Flags} from '@oclif/core'
import dockerComponseTemplate from './docker-compose-template.json'
import path from 'path'
import fs from 'fs'
import {DockerCompose } from '../dockerCompose'


const Listr = require('listr')

import { DataDirManager } from '../dataDirManager'
import { DependancyCheck } from '../dependencyCheck'

const dockerComposeFilePath = DataDirManager.DOCKERCOMPOSE_FILE_PATH


type Task = {title: string; task: Function}
export default class Stop extends Command {
  static description = 'Stop Hypersign issuer node infrastructure'
  static examples = ['<%= config.bin %> <%= command.id %>']
  
  getTask(taskTitle: string, task: Function, flag?: any): Task {
    return {
      title: taskTitle,
      task: async () => await task(flag, dockerComposeFilePath),
    }
  }


  public async run(): Promise<void> {
    if(!DataDirManager.checkIfDataDirInitated().status){
      throw new Error('No configuration found, kindly run `studio-cli setup` command first.')
    }
    
    let allTasks;

    const checkingProcessesTasks = new Listr([
      this.getTask(`Checking if docker is installed`, DependancyCheck.ifProcessInstalled, 'docker'),
      this.getTask(`Checking if docker-compose is installed`, DependancyCheck.ifProcessInstalled, 'docker-compose'),
      this.getTask(`Checking if docker deamon is running`, DockerCompose.isDeamonRunning)
    ])

    // Shutdown running containers
    const containerDownTasks = new Listr([
      this.getTask(`Shutdown`, DockerCompose.down, 'stop')
    ])

    allTasks = new Listr([
      this.getTask('Checking if all dependencies are installed' , () => { return checkingProcessesTasks} ),
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
