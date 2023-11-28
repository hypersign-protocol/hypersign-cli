import { Command } from '@oclif/core'
import { DockerCompose  } from '../dockerCompose'
const Listr = require('listr')
import { DependancyCheck } from '../dependencyCheck'
import { DataDirManager } from '../dataDirManager'
import * as Messages from '../messages'
const yaml = require('js-yaml');

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

    const dockerYml = await DataDirManager.readFileSync()
    const dockerComponseTemplate = yaml.load(dockerYml)
    let allTasks;
    // Check required dependecies
    const checkingProcessesTasks = new Listr([
      this.getTask(Messages.TASKS.IF_DOCKER_INSTALLED, DependancyCheck.ifProcessInstalled, Messages.SERVICES_NAMES.DOCKER),
      this.getTask(Messages.TASKS.IF_DOCKER_COMPOSE_INSTALLED, DependancyCheck.ifProcessInstalled, Messages.SERVICES_NAMES.DOCKER_COMPOSE),
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
      let messages = Messages.LOG.SERVICES_START_LOG
      services.forEach((service) => {
        if(service == Messages.SERVICES_NAMES.DEVELOPER_SERVICE.monikar){
          messages += Messages.LOG.DEVELOPER_DASH_START_LOG 
        }

        if(service == Messages.SERVICES_NAMES.DB_SERVICE.monikar){
          messages += Messages.LOG.DB_SERVICE_START_LOG
        }

        if(service == Messages.SERVICES_NAMES.STUDIO_PLAYGROUND_UI.monikar){
          messages +=  Messages.LOG.STUDIO_DASH_START_LOG
        }

        if(service == Messages.SERVICES_NAMES.SSI_API_SERVICE.monikar){
          messages +=  Messages.LOG.API_SERVICE_START_LOG
        }
      })

      this.log(messages)
    })
    .catch((err: any) => {
      console.error(err)
    })
  }
}
