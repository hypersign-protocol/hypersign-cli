import {Args, Command, Flags} from '@oclif/core'
import dockerComponseTemplate from './docker-compose-template.json'
import path from 'path'
import fs from 'fs'
import { DockerCompose } from '../dockerCompose'
import { DependancyCheck } from '../dependencyCheck'

const Listr = require('listr')

const dockerComposeFilePath = path.join(__dirname, 'docker-compose.yml')

type Task = {title: string; task: Function}
export default class Clean extends Command {
  static description = 'Stop and Delete Hypersign issuer node infrastructure'
  static examples = ['<%= config.bin %> <%= command.id %>']
  
  getTask(taskTitle: string, task: Function, flag?:string,): Task {
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
    let allTasks;

    const checkingProcessesTasks = new Listr([
      this.getTask(`Checking if docker is installed`, DependancyCheck.ifProcessInstalled, 'docker'),
      this.getTask(`Checking if docker-compose is installed`, DependancyCheck.ifProcessInstalled, 'docker-compose')
    ])
  
    let services = Object.keys(dockerComponseTemplate.services)
    const allservicesRmiTasks: Array<Task> = []
    services.forEach((service) => {
      allservicesRmiTasks.push(this.getTask(`Removing ${service} image`, DockerCompose.rmi, service))
    })
    const servicesRmiTasks = new Listr(allservicesRmiTasks,  {concurrent: false})
    
    // Shutdown running containers
    const containerDownTasks = new Listr([
      this.getTask(`Shutdown`, DockerCompose.down)
    ])

    const delayedTasks = new Listr([
      this.getTask(`Cleaning volumes`, this.delayedTask)
    ])
    allTasks = new Listr([
      this.getTask(`Checking all dependencies installed `, () => { return checkingProcessesTasks} ),
      this.getTask(`Shutting down all container(s)`, () => { return containerDownTasks  }),
      this.getTask(`Deleting associated volumes`, () => { return delayedTasks  }),
      this.getTask(`Removing images`, () => { return servicesRmiTasks })
    ],  {concurrent: false},);

    allTasks.run()
    .then(() => {
        this.log('All containers has been cleaned successfully')
    })
    .catch((err: any) => {
      console.error(err)
    })
  }
}
