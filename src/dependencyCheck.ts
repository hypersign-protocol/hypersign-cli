
import * as Message from './messages'
export class DependancyCheck {
    static async ifProcessInstalled(processName: string, dockerComposeFilePath: string): Promise<any>{
      const { execa } = await import("execa");
      const comamnds = processName.split(" ")
      if(comamnds.length > 2){
        return execa(comamnds[0], [comamnds[1]]).catch((err:any) => {
          return DependancyCheck.throwError(comamnds[0])
        })
      } else {
        return execa(comamnds[0]).catch((err:any) => {
          return DependancyCheck.throwError(comamnds[0])
        })
      }        
    }

    static throwError(processName: string){
      if(processName === Message.SERVICES_NAMES.DOCKER) {
        throw new Error(Message.ERRORS.DOCKER_NOT_INSTALLED)
      }
      if(processName === Message.SERVICES_NAMES.DOCKER_COMPOSE){
        throw new Error(Message.ERRORS.DOCKER_COMPOSE_NOT_INSTALLED)
      }
      throw new Error(`${processName} is not installed. Please install ${processName} to proceeed`)
    }
}