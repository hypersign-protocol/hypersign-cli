import { Command } from '@oclif/core'
import dockerComponseTemplate from './docker-compose-template.json'
import { DockerCompose  } from '../dockerCompose'
const Listr = require('listr')
import { DependancyCheck } from '../dependencyCheck'
import { DataDirManager } from '../dataDirManager'
import * as Messages from '../messages'

const dockerComposeFilePath = DataDirManager.DOCKERCOMPOSE_FILE_PATH
type Task = {title: string; task: Function}

export default class Start extends Command {
  static description = Messages.LOG.START_DESCRIPTION
  static examples = ['<%= config.bin %> <%= command.id %>']

  

  getTask(taskTitle: string, task: Function, flag?:string,): Task {
    return {
      title: taskTitle,
      task: async () => await task(flag, dockerComposeFilePath),
    }
  }

  public async run(): Promise<void> {
    
    if(!DataDirManager.checkIfDataDirInitated().status){
      throw new Error(Messages.ERRORS.NO_CONFIG_FOUND)
    }

    let allTasks;
    // Check required dependecies
    const checkingProcessesTasks = new Listr([
      this.getTask(Messages.TASKS.IF_DOCKER_INSTALLED, DependancyCheck.ifProcessInstalled, 'docker'),
      this.getTask(Messages.TASKS.IF_DOCKER_COMPOSE_INSTALLED, DependancyCheck.ifProcessInstalled, 'docker-compose'),
      this.getTask(Messages.TASKS.IF_DOCKER_DEAMON_RUNNING, DockerCompose.isDeamonRunning)
    ])
    
    // Shutdown running containers
    const containerDownTasks = new Listr([
      this.getTask(Messages.TASKS.SHUTTINGDOWN, DockerCompose.down)
    ])

    // Restart containers one by one
    let services = Object.keys(dockerComponseTemplate.services)
    const allservicesUpTasks: Array<Task> = []
    services.forEach((service) => {
      allservicesUpTasks.push(this.getTask(`Starting ${service} container`, DockerCompose.up, service))
    })
    const servicesTasks = new Listr(allservicesUpTasks,  {concurrent: false})
    

    allTasks = new Listr([
      this.getTask(Messages.TASKS.IF_ALL_DEPENDENCIES_INSTALLED, () => { return checkingProcessesTasks  }),
      this.getTask(Messages.TASKS.SHUTTING_DOWN_CONTAINERS, () => { return containerDownTasks  }),
      this.getTask(Messages.TASKS.SPINNING_UP_CONTAINER, () => { return servicesTasks  }),
    ],  {concurrent: false},);

    
    
    allTasks.run()
    .then(() => {
        this.log(Messages.LOG.ALL_START_LOG)
    })
    .catch((err: any) => {
      console.error(err)
    })
  }
}
