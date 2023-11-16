import {Args, Command, Flags} from '@oclif/core'
import dockerComponseTemplate from './docker-compose-template.json'
import path from 'path'
import fs from 'fs'
import { DockerCompose  } from '../dockerCompose'
const execa = require('execa')
const Listr = require('listr')
import { DependancyCheck } from '../dependencyCheck'
import { DataDirManager } from '../dataDirManager'


const dockerComposeFilePath = DataDirManager.DOCKERCOMPOSE_FILE_PATH

type Task = {title: string; task: Function}
export default class Start extends Command {
  static description = 'Start Hypersign issuer node infrastructure'
  static examples = ['<%= config.bin %> <%= command.id %>']

  

  getTask(taskTitle: string, task: Function, flag?:string,): Task {
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
    // Check required dependecies
    const checkingProcessesTasks = new Listr([
      this.getTask(`Checking if docker is installed`, DependancyCheck.ifProcessInstalled, 'docker'),
      this.getTask(`Checking if docker-compose is installed`, DependancyCheck.ifProcessInstalled, 'docker-compose')
    ])
    
    // Shutdown running containers
    const containerDownTasks = new Listr([
      this.getTask(`Shutdown`, DockerCompose.down)
    ])

    // Restart containers one by one
    let services = Object.keys(dockerComponseTemplate.services)
    const allservicesUpTasks: Array<Task> = []
    services.forEach((service) => {
      allservicesUpTasks.push(this.getTask(`Starting ${service} container`, DockerCompose.up, service))
    })
    const servicesTasks = new Listr(allservicesUpTasks,  {concurrent: false})
    

    allTasks = new Listr([
      this.getTask(`Checking all dependencies`, () => { return checkingProcessesTasks  }),
      this.getTask(`Shutting down all container(s)`, () => { return containerDownTasks  }),
      this.getTask(`Spinning up all container(s)`, () => { return servicesTasks  }),
    ],  {concurrent: false},);

    
    
    allTasks.run()
    .then(() => {
        this.log('Hypersign Issuer Node is setup and running successfully')
        this.log('  📟 Entity Dashboard UI     : http://localhost:9001/')
        this.log('  📟 Entity Dashboard Serivce: http://localhost:3002/')
        this.log('  📟 Mongo Database URI      : mongodb://localhost:27017/')
        this.log('  📟 Tenant Url              : http://<tenant-subdomain>.localhost:8080/ssi')
    })
    .catch((err: any) => {
      console.error(err)
    })
  }
}
