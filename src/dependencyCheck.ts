
import * as Message from './messages'
export class DependancyCheck {
    static async ifProcessInstalled(processName: string, dockerComposeFilePath: string): Promise<any>{
      const { execa } = await import("execa");
        return execa(processName).catch(() => {
          if(processName === Message.SERVICES_NAMES.DOCKER) {
            throw new Error(Message.ERRORS.DOCKER_NOT_INSTALLED)
          }
          if(processName === Message.SERVICES_NAMES.DOCKER_COMPOSE){
            throw new Error(Message.ERRORS.DOCKER_COMPOSE_NOT_INSTALLED)
          }
          throw new Error(`${processName} is not installed. Please install ${processName} to proceeed`)
        })
    }
}