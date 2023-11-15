import {Args, Command, Flags} from '@oclif/core'
import dockerComponseTemplate from './docker-compose-template.json'
import path from 'path'
import fs from 'fs'

const execa = require('execa')
const Listr = require('listr')

const dockerComposeFilePath = path.join(__dirname, 'docker-compose.yml')

type Task = {title: string; task: Function}
export default class Stop extends Command {
  static description = 'Stop Hypersign issuer node infrastructure'
  static examples = ['<%= config.bin %> <%= command.id %>']
  
  dockerComposeDown(){
    return execa('docker-compose', [
      '-f',
      dockerComposeFilePath,
      'down'
    ])
  }

  getTask(taskTitle: string, task: Function, serviceName?:string,): Task {
    return {
      title: taskTitle,
      task: () => task(serviceName),
    }
  }

  public async run(): Promise<void> {
    let allTasks;
    
    // Shutdown running containers
    const containerDownTasks = new Listr([
      this.getTask(`Shutdown`, this.dockerComposeDown)
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
