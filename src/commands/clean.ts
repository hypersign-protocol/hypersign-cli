import {Command, Flags} from '@oclif/core'
import dockerComponseTemplate from './docker-compose-template.json'
import { DockerCompose } from '../dockerCompose'
import { DependancyCheck } from '../dependencyCheck'
import * as Messages from '../messages'
const Listr = require('listr')
import { DataDirManager } from '../dataDirManager'

const dockerComposeFilePath = DataDirManager.DOCKERCOMPOSE_FILE_PATH
type Task = {title: string; task: Function}

export default class Clean extends Command {
  static description = Messages.LOG.CLEAN_DESCRIPTION
  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    configAlreayExists: Flags.string({options: ['y', 'N']}),
  }
  
  getTask(taskTitle: string, task: Function, flag?: any): Task {
    return {
      title: taskTitle,
      task: async () => await task(flag, dockerComposeFilePath),
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
    if(!DataDirManager.checkIfDataDirInitated().status){
      throw new Error(Messages.ERRORS.NO_CONFIG_FOUND)
    } else {
      const { flags } = await this.parse(Clean)
      const { default: inquirer } = await import("inquirer")
      let configAlreayExists = flags.configAlreayExists
      if(!configAlreayExists) {
        let response: any = await inquirer.prompt([{
          name: 'configAlreayExists',
          message: Messages.PROMPTS.ABOUT_TO_DELETE_ALL_CONFIG_Q,
          type: "confirm",
          choices: [{name: 'y'}, {name: 'n'}]
        }])
        configAlreayExists = response.configAlreayExists
      }

      if(!configAlreayExists){
       return
      } 
    }

    let allTasks;

    const checkingProcessesTasks = new Listr([
      this.getTask(Messages.TASKS.IF_DOCKER_INSTALLED, DependancyCheck.ifProcessInstalled, 'docker'),
      this.getTask(Messages.TASKS.IF_DOCKER_COMPOSE_INSTALLED, DependancyCheck.ifProcessInstalled, 'docker-compose'),
      this.getTask(Messages.TASKS.IF_DOCKER_DEAMON_RUNNING, DockerCompose.isDeamonRunning)
    ])
  
    let services = Object.keys(dockerComponseTemplate.services)
    const allservicesRmiTasks: Array<Task> = []
    services.forEach((service) => {
      allservicesRmiTasks.push(this.getTask(`Removing ${service} image`, DockerCompose.rmi, service))
    })
    const servicesRmiTasks = new Listr(allservicesRmiTasks,  {concurrent: false})
    
    // Shutdown running containers
    const containerDownTasks = new Listr([
      this.getTask(Messages.TASKS.SHUTTINGDOWN, DockerCompose.down)
    ])

    const delayedTasks = new Listr([
      this.getTask(Messages.TASKS.CLEAN_WORKDIR, DataDirManager.cleanWorkDir),
      // this.getTask(`Cleaning volumes`, this.delayedTask)
    ])
    allTasks = new Listr([
      this.getTask(Messages.TASKS.IF_ALL_DEPENDENCIES_INSTALLED, () => { return checkingProcessesTasks} ),
      this.getTask(Messages.TASKS.SHUTTING_DOWN_CONTAINERS, () => { return containerDownTasks  }),
      this.getTask(Messages.TASKS.DELETE_VOLUMES, () => { return delayedTasks  }),
      this.getTask(Messages.TASKS.REMOVE_IMAGES, () => { return servicesRmiTasks })
    ],  {concurrent: false},);

    allTasks.run(Messages.LOG.ALL_CONTAINERS_CLEANED)
    .then(() => {
        this.log()
    })
    .catch((err: any) => {
      console.error(err)
    })
  }
}
