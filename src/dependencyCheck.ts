

export class DependancyCheck {
    static async ifProcessInstalled(processName: string, dockerComposeFilePath: string): Promise<any>{
      const { execa } = await import("execa");
        return execa(processName).catch(() => {
          throw new Error(`${processName} is not installed. Please install Docker to proceeed `)
        })
    }
}