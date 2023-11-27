export const SERVICES_NAMES = Object.freeze({
    DB_SERVICE: {
        name: 'Mongo DB Service',
        monikar:  'mongo'
    },
    
    HID_NETWORK: 'Hypersign ID Network',
    
    EDV_SERVICE: {
        name: 'Hypersign Encrypted Data Vault (EDV) Service',
        monikar: 'edv'
    },
    
    SSI_API_SERVICE: {
        name: 'Entity API Service',
        monikar: 'entity-api-service'
    },

    SSI_API_PROXY_SERVICE: {
        name: 'Entity API Service Proxy',
        monikar: 'entity-api-service-proxy'
    },
    DEVELOPER_SERVICE: {
        name: 'Entity Developer Dashboard Service',
        monikar: 'entity-developer-dashboard-service'
    },
    DEVELOPER_UI: {
        name: 'Entity Developer Dashboard',
        monikar: 'entity-developer-dashboard'
    },

    STUDIO_PLAYGROUND_SERVICE: {
        name: 'Entity Studio Dashboard Service',
        monikar: 'entity-studio-dashboard-service'
    },
    STUDIO_PLAYGROUND_UI: {
        name: 'Entity Studio Dashboard',
        monikar: 'entity-studio-dashboard'
    },

    APP_NAME: "Hypersign SSI Infrastructure",
    
    TENANT_URL_API_DASH_FORMAT: 'Tenant URL Swagger API',
    
    DOCKER: 'docker',
    DOCKER_COMPOSE: 'docker compose',
    
    WORKDIRNAME: '.hypersign-ssi',
    CLI_NAME: 'hypersign-ssi',
    EDV_DATA_DIR:'edv-data',
    API_EDV_CONFIG_DIR: "api-edv-config",
    DASHBOARD_SERVICE_EDV_CONFIG_DIR: "dashboard-edv-config"
})

export const ERRORS = Object.freeze({
    NETWORK_NOT_SUPPOERTED: "The network is unsupported; only the 'testnet' network is supported.",
    NO_CONFIG_FOUND: `There's no configuration detected. Please initiate the '${SERVICES_NAMES.CLI_NAME} setup' command to set it up initially.`,
    DOCKER_NOT_INSTALLED: `${SERVICES_NAMES.DOCKER} isn't installed. To continue, please install ${SERVICES_NAMES.DOCKER} by following the instructions provided at https://docs.docker.com/engine/install/`,
    DOCKER_COMPOSE_NOT_INSTALLED: `${SERVICES_NAMES.DOCKER_COMPOSE} isn't installed. To continue, please install ${SERVICES_NAMES.DOCKER_COMPOSE} by following the instructions provided at https://docs.docker.com/compose/install/`
})

export const TASKS = Object.freeze({
    PULLING_MONGO_CONFIG: `${SERVICES_NAMES.DB_SERVICE.name} Configuration`,
    PULLING_EDV_CONFIG: `${SERVICES_NAMES.EDV_SERVICE.name} Configuration`,
    PULLING_SSI_API_CONFIG: `${SERVICES_NAMES.SSI_API_SERVICE.name} Configuration`,
    PULLING_SSI_API_PROXY_CONFIG: `${SERVICES_NAMES.SSI_API_PROXY_SERVICE.name} Configuration`,
    PULLING_DEVELOPER_SERVICE_CONFIG: `${SERVICES_NAMES.DEVELOPER_SERVICE.name} Configuration`,
    PULLING_DEVELOPER_UI_CONFIG: `${SERVICES_NAMES.DEVELOPER_UI.name} Configuration`,


    PULLING_STUDIO_SERVICE_CONFIG: `${SERVICES_NAMES.STUDIO_PLAYGROUND_SERVICE.name} Configuration`,
    PULLING_STUDIO_UI_CONFIG: `${SERVICES_NAMES.STUDIO_PLAYGROUND_UI.name} Configuration`,


    IF_ALL_DEPENDENCIES_INSTALLED: "Verifying the installation status of all dependencies",
    SETTING_SERVIES_CONFIG: `Configuring all service settings`,
    SHUTTING_DOWN_CONTAINERS: `Stopping all service instances.`,
    DELETE_VOLUMES: "Deleting associated volumes",
    REMOVE_IMAGES: "Removing associated images",

    HID_NODE_CONFIG: `${SERVICES_NAMES.HID_NETWORK} Configuration`,

    CLEAN_WORKDIR: 'Cleaning working directories',
    IF_DOCKER_INSTALLED: `Checking if ${SERVICES_NAMES.DOCKER} is installed`,
    IF_DOCKER_COMPOSE_INSTALLED: `Checking if ${SERVICES_NAMES.DOCKER_COMPOSE} is installed`,
    IF_DOCKER_DEAMON_RUNNING: `Checking if docker deamon is running`,

    SPINNING_UP_CONTAINER: 'Spinning up all container(s)',

    SHUTTINGDOWN: `Shutdown`,

    CLEAN_ALL: "Cleaning up everything"

})

export const PROMPTS = Object.freeze({
    CHOOSE_MNEMONIC : "Choose mnemonic setup",
    WANT_EDV_SERVICE_Q : "Would you like to configure the Encrypted Data Vault service?",
    CONFIGURATION_ALREADY_EXISTS_Q: "WARNING The current configuration already exists. Continuing will erase all existing configurations. Are you sure you want to proceed?",
    ABOUT_TO_DELETE_ALL_CONFIG_Q: 'WARNING Are you sure you want to proceed with deleting all your configurations, services, images, volumes, and other related data?',
    SELECT_NETWORK: 'Select Hypersign network',
    ENTER_WORDS_MNEMONIC: '  Enter 24 words mnemonic',
    CHOOSE_SERVICES: 'Select one or more services'
})


export const LOG = Object.freeze({
    ALL_CONFIG_SUCCESS : `
    🦄 All configurations have been successfully established!
    🦄 Execute the '${SERVICES_NAMES.CLI_NAME} start' command to initiate your services.
    `,
    SETUP_DESCRIPTION: `Setup configurations for ${SERVICES_NAMES.APP_NAME}`,
    START_DESCRIPTION: `Start ${SERVICES_NAMES.APP_NAME}`,
    STOP_DESCRIPTION: `Stop ${SERVICES_NAMES.APP_NAME}`,
    CLEAN_DESCRIPTION: `Stop and Delete ${SERVICES_NAMES.APP_NAME} configurations and data`,

    ALL_CONTAINERS_STOPPED: '🦄 All services has been stopped successfully',
    ALL_CONTAINERS_CLEANED: '🦄 All services has been stopped and data directory was cleaned successfully',

    ALL_START_LOG : `
    ${SERVICES_NAMES.APP_NAME} is setup and running successfully
        📟 ${SERVICES_NAMES.DEVELOPER_UI.name} : http://localhost:9001/
        📟 ${SERVICES_NAMES.DEVELOPER_SERVICE.name} : http://localhost:3002/
        📟 ${SERVICES_NAMES.STUDIO_PLAYGROUND_UI.name} : http://localhost:9002/
        📟 ${SERVICES_NAMES.DB_SERVICE.name} : mongodb://localhost:27017/
        📟 ${SERVICES_NAMES.TENANT_URL_API_DASH_FORMAT} : http://<tenant-subdomain>.localhost:8080/ssi
    `,
    SERVICES_START_LOG: `
    ${SERVICES_NAMES.APP_NAME} is setup and running successfully`,
    DEVELOPER_DASH_START_LOG: ` 
        📟 ${SERVICES_NAMES.DEVELOPER_UI.name} : http://localhost:9001/
        📟 ${SERVICES_NAMES.DEVELOPER_SERVICE.name} : http://localhost:3002/`,
    STUDIO_DASH_START_LOG: `
        📟 ${SERVICES_NAMES.STUDIO_PLAYGROUND_UI.name} : http://localhost:9002/`,
    API_SERVICE_START_LOG: `
        📟 ${SERVICES_NAMES.TENANT_URL_API_DASH_FORMAT} : http://<tenant-subdomain>.localhost:8080/ssi`,
    DB_SERVICE_START_LOG: `
        📟 ${SERVICES_NAMES.DB_SERVICE.name} : mongodb://localhost:27017/`
})


