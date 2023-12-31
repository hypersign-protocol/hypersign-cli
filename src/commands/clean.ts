import {Command, Flags} from '@oclif/core'
import { DockerCompose } from '../dockerCompose'
import { DependancyCheck } from '../dependencyCheck'
import * as Messages from '../messages'
const Listr = require('listr')
import { DataDirManager } from '../dataDirManager'
const yaml = require('js-yaml');
// import dockerComponseTemplate from './docker-compose-template.json'
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
      this.getTask(Messages.TASKS.IF_DOCKER_INSTALLED, DependancyCheck.ifProcessInstalled, Messages.SERVICES_NAMES.DOCKER),
      this.getTask(Messages.TASKS.IF_DOCKER_COMPOSE_INSTALLED, DependancyCheck.ifProcessInstalled, Messages.SERVICES_NAMES.DOCKER_COMPOSE),
      this.getTask(Messages.TASKS.IF_DOCKER_DEAMON_RUNNING, DockerCompose.isDeamonRunning)
    ])
  
    const dockerYml = await DataDirManager.readFileSync()
    const dockerComponseTemplate = yaml.load(dockerYml)

    let services = Object.keys(dockerComponseTemplate.services)
    const allservicesRmiTasks: Array<Task> = []
    services.forEach((service: any) => {
      const image  = dockerComponseTemplate.services[service]['image']
      allservicesRmiTasks.push(this.getTask(`Removing ${ image } image`, DockerCompose.rmi, image))
    })
    const servicesRmiTasks = new Listr(allservicesRmiTasks,  {concurrent: false})
    
    // Shutdown running containers
    const containerDownTasks = new Listr([
      this.getTask(Messages.TASKS.SHUTTINGDOWN, DockerCompose.down)
    ])

    const delayedTasks = new Listr([
       this.getTask(`Cleaning volumes`, this.delayedTask),
       this.getTask(Messages.TASKS.CLEAN_WORKDIR, DataDirManager.cleanWorkDir)
    ])
    allTasks = new Listr([
      this.getTask(Messages.TASKS.IF_ALL_DEPENDENCIES_INSTALLED, () => { return checkingProcessesTasks} ),
      this.getTask(Messages.TASKS.SHUTTING_DOWN_CONTAINERS, () => { return containerDownTasks  }),
      this.getTask(Messages.TASKS.REMOVE_IMAGES, () => { return servicesRmiTasks }),
      this.getTask(Messages.TASKS.DELETE_VOLUMES, () => { return delayedTasks  }),
    ],  {concurrent: false},);

    allTasks.run(Messages.TASKS.CLEAN_ALL)
    .then(() => {
        this.log(Messages.LOG.ALL_CONTAINERS_CLEANED)
    })
    .catch((err: any) => {
      console.error(err)
    })
  }
}
