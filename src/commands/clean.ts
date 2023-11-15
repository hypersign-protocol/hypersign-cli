import {Args, Command, Flags} from '@oclif/core'
import dockerComponseTemplate from './docker-compose-template.json'
import path from 'path'
import fs from 'fs'

const execa = require('execa')
const Listr = require('listr')

const dockerComposeFilePath = path.join(__dirname, 'docker-compose.yml')

type Task = {title: string; task: Function}
export default class Clean extends Command {
  static description = 'Stop and Delete Hypersign issuer node infrastructure'
  static examples = ['<%= config.bin %> <%= command.id %>']
  
  dockerComposeDown(){
    return execa('docker-compose', [
      '-f',
      dockerComposeFilePath,
      'down',
      '-v'
    ])
  }


  dockerComposeRMI(service: string){
    return execa('docker', [
      'rmi',
      '-f',
      service
    ])
  }


  getTask(taskTitle: string, task: Function, serviceName?:string,): Task {
    return {
      title: taskTitle,
      task: () => task(serviceName),
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
  
    let services = Object.keys(dockerComponseTemplate.services)
    const allservicesRmiTasks: Array<Task> = []
    services.forEach((service) => {
      allservicesRmiTasks.push(this.getTask(`Removing ${service} image`, this.dockerComposeRMI, service))
    })
    const servicesRmiTasks = new Listr(allservicesRmiTasks,  {concurrent: false})
    

    // Shutdown running containers
    const containerDownTasks = new Listr([
      this.getTask(`Shutdown`, this.dockerComposeDown)
    ])

    const delayedTasks = new Listr([
      this.getTask(`Cleaning volumes`, this.delayedTask)
    ])
    allTasks = new Listr([
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
