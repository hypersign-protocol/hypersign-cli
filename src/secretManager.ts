const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
import { randomUUID } from 'crypto';

export interface Isecrets {
    mnemonic: string
    jwtSecret: string
    sessionSecret: string
    superAdminPassword: string
  }

export class SecretManager {
    private static instance: SecretManager
    private credentials: Isecrets = {} as Isecrets;
    private constructor() { }

    public static getInstance() : SecretManager {
        if(!SecretManager.instance){
            SecretManager.instance = new SecretManager()
        }
        return SecretManager.instance
    }

    async init(words = 24) {
        const offlineSigner = await DirectSecp256k1HdWallet.generate(words);
        this.credentials.mnemonic = offlineSigner.mnemonic
        this.credentials.jwtSecret = randomUUID()
        this.credentials.sessionSecret = randomUUID()
        this.credentials.superAdminPassword = randomUUID()
    }

    public getCredentials(): Isecrets {
        return this.credentials
    }

    public setCredentials(secret: Partial<Isecrets>): void {
        this.credentials = { ...this.credentials, ...secret}
    }

}

