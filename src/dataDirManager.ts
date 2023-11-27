import fs from 'fs'
import { homedir } from 'os'
import path from 'path'
import * as Message from './messages'
export class DataDirManager {
    static readonly WORKDIR = `${homedir}/${Message.SERVICES_NAMES.WORKDIRNAME}`
    static readonly DOCKERCOMPOSE_FILE_PATH =  path.join(DataDirManager.WORKDIR, 'docker-compose.yml')
    private static readonly DEV_DASHBOARD_DIR = `${DataDirManager.WORKDIR}/${Message.SERVICES_NAMES.DEVELOPER_UI.monikar}` 
    private static readonly NGINXDIR = `${DataDirManager.WORKDIR}/nginx` 
    private static readonly STUDIO_DASHBOARD_DIR = `${DataDirManager.WORKDIR}/${Message.SERVICES_NAMES.STUDIO_PLAYGROUND_UI.monikar}` 

    static async init(){
        if(!fs.existsSync(DataDirManager.WORKDIR)) fs.mkdirSync(DataDirManager.WORKDIR);

        // API-service
        if(!fs.existsSync(DataDirManager.NGINXDIR)) fs.mkdirSync(DataDirManager.NGINXDIR);
        
        let oldfilePath = path.join(__dirname, 'commands/nginx/nginx.conf')
        let newfilePath = `${DataDirManager.NGINXDIR}/nginx.conf`

        DataDirManager.fileCopy(oldfilePath, newfilePath)
        
        // ${Message.SERVICES_NAMES.DEVELOPER_UI.name}
        if(!fs.existsSync(DataDirManager.DEV_DASHBOARD_DIR)) fs.mkdirSync(DataDirManager.DEV_DASHBOARD_DIR);
        
        oldfilePath = path.join(__dirname, `commands/${Message.SERVICES_NAMES.DEVELOPER_UI.monikar}/nginx.conf`);
        newfilePath = `${DataDirManager.DEV_DASHBOARD_DIR}/nginx.conf`
        DataDirManager.fileCopy(oldfilePath, newfilePath)

        oldfilePath = path.join(__dirname,`commands/${Message.SERVICES_NAMES.DEVELOPER_UI.monikar}/Dockerfile`);
        newfilePath = `${DataDirManager.DEV_DASHBOARD_DIR}/Dockerfile`
        DataDirManager.fileCopy(oldfilePath, newfilePath)


        // entity-studio-dashboard
        if(!fs.existsSync(DataDirManager.STUDIO_DASHBOARD_DIR)) fs.mkdirSync(DataDirManager.STUDIO_DASHBOARD_DIR);
        
        oldfilePath = path.join(__dirname, `commands/${Message.SERVICES_NAMES.STUDIO_PLAYGROUND_UI.monikar}/nginx.conf`);
        newfilePath = `${DataDirManager.STUDIO_DASHBOARD_DIR}/nginx.conf`
        DataDirManager.fileCopy(oldfilePath, newfilePath)

        oldfilePath = path.join(__dirname,`commands/${Message.SERVICES_NAMES.STUDIO_PLAYGROUND_UI.monikar}/Dockerfile`);
        newfilePath = `${DataDirManager.STUDIO_DASHBOARD_DIR}/Dockerfile`
        DataDirManager.fileCopy(oldfilePath, newfilePath)
    }

    static checkIfDataDirInitated(): { status: boolean, messages: string[] } {
        const errors = [];
        if(!fs.existsSync(DataDirManager.WORKDIR)){
            errors.push('WORKDIR does not exist');
        }

        if(!fs.existsSync(DataDirManager.DOCKERCOMPOSE_FILE_PATH)){
            errors.push('Configuration is not set');
        }

        if(errors.length > 0){
            return {
                status: false,
                messages: errors
            }
        } else {
            return {
                status: true,
                messages: []
            }
        }
    }

    static cleanWorkDir(): void {
        fs.rmSync(DataDirManager.WORKDIR, { recursive: true, force: true });
    }

    static fileCopy(oldfilePath: string, newfilePath: string){
        fs.copyFileSync(oldfilePath, newfilePath)
    }
      
    static readFileSync(filePath = DataDirManager.DOCKERCOMPOSE_FILE_PATH){
        return fs.readFileSync(filePath, 'utf8');
    }
}


