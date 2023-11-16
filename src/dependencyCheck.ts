const execa = require('execa')

export class DependancyCheck {
    static ifProcessInstalled(processName: string, dockerComposeFilePath: string){
        return execa(processName).catch(() => {
          throw new Error(`${processName} is not installed. Please install Docker to proceeed `)
        })
    }
}