export const SERVICES_NAMES = Object.freeze({
    DB_SERVICE: 'Mongo DB Service',
    EDV_SERVICE: 'Hypersign Encrypted Data Vault (EDV) Service',
    SSI_API_SERVICE: 'Hypersign SSI API Service',
    SSI_API_PROXY_SERVICE: 'Hypersign SSI API Proxy Service',
    STUDIO_SERVICE: 'Hypersign Studio Dashboard Service',
    STUDIO_UI: 'Hypersign Studio Dashboard',
    APP_NAME: "Hypersign SSI Infrastructure",
    TENANT_URL_API_DASH_FORMAT: 'Tenant URL Swagger API',
    DOCKER: 'docker',
    DOCKER_COMPOSE: 'docker-compose'
})

export const ERRORS = Object.freeze({
    NETWORK_NOT_SUPPOERTED: "The network is unsupported; only the 'testnet' network is supported.",
    NO_CONFIG_FOUND: "There's no configuration detected. Please initiate the `studio-cli setup` command to set it up initially.",
    DOCKER_NOT_INSTALLED: "Docker isn't installed. To continue, please install Docker by following the instructions provided at https://docs.docker.com/engine/install/.",
    DOCKER_COMPOSE_NOT_INSTALLED: "Docker Compose isn't installed. To continue, please install Docker Compose by following the instructions provided at https://docs.docker.com/compose/install/"
})

export const TASKS = Object.freeze({
    PULLING_MONGO_CONFIG: `${SERVICES_NAMES.DB_SERVICE} Configuration`,
    PULLING_EDV_CONFIG: `${SERVICES_NAMES.EDV_SERVICE} Configuration`,
    PULLING_SSI_API_CONFIG: `${SERVICES_NAMES.SSI_API_SERVICE} Configuration`,
    PULLING_SSI_API_PROXY_CONFIG: `${SERVICES_NAMES.SSI_API_PROXY_SERVICE} Configuration`,
    PULLING_STUDIO_SERVICE_CONFIG: `${SERVICES_NAMES.STUDIO_SERVICE} Configuration`,
    PULLING_STUDIO_UI_CONFIG: `${SERVICES_NAMES.STUDIO_UI} Configuration`,

    IF_ALL_DEPENDENCIES_INSTALLED: "Verifying the installation status of all dependencies",
    SETTING_SERVIES_CONFIG: `Configuring all service settings`,
    SHUTTING_DOWN_CONTAINERS: `Stopping all service instances.`,
    DELETE_VOLUMES: "Deleting associated volumes",
    REMOVE_IMAGES: "Removing associated images",

    HID_NODE_CONFIG: `Hypersign Node Configuration`,

    CLEAN_WORKDIR: 'Cleaning working directories',
    IF_DOCKER_INSTALLED: `Checking if ${SERVICES_NAMES.DOCKER} is installed`,
    IF_DOCKER_COMPOSE_INSTALLED: `Checking if ${SERVICES_NAMES.DOCKER_COMPOSE} is installed`,
    IF_DOCKER_DEAMON_RUNNING: `Checking if docker deamon is running`,

    SPINNING_UP_CONTAINER: 'Spinning up all container(s)',

    SHUTTINGDOWN: `Shutdown`

})

export const PROMPTS = Object.freeze({
    CHOOSE_MNEMONIC : "Choose mnemonic setup",
    WANT_EDV_SERVICE_Q : "Would you like to configure the Encrypted Data Vault service?",
    CONFIGURATION_ALREADY_EXISTS_Q: "WARNING The current configuration already exists. Continuing will erase all existing configurations. Are you sure you want to proceed?",
    ABOUT_TO_DELETE_ALL_CONFIG_Q: 'WARNING Are you sure you want to proceed with deleting all your configurations, services, images, volumes, and other related data?',
    SELECT_NETWORK: 'Select Hypersign network',
    ENTER_WORDS_MNEMONIC: '  Enter 24 words mnemonic',
})


export const LOG = Object.freeze({
    ALL_CONFIG_SUCCESS : `
    🦄 All configurations have been successfully established!
    🦄 Execute the 'studio-cli start' command to initiate your services.
    `,
    SETUP_DESCRIPTION: `Setup configurations for ${SERVICES_NAMES.APP_NAME}`,
    START_DESCRIPTION: `Start ${SERVICES_NAMES.APP_NAME}`,
    STOP_DESCRIPTION: `Stop ${SERVICES_NAMES.APP_NAME}`,
    CLEAN_DESCRIPTION: `Stop and Delete ${SERVICES_NAMES.APP_NAME} configurations and data`,

    ALL_CONTAINERS_STOPPED: '🦄 All services has been stopped successfully',
    ALL_CONTAINERS_CLEANED: '🦄 All services has been cleaned successfully',

    ALL_START_LOG : `
    ${SERVICES_NAMES.APP_NAME} is setup and running successfully
        📟 ${SERVICES_NAMES.STUDIO_UI} : http://localhost:9001/
        📟 ${SERVICES_NAMES.STUDIO_SERVICE} : http://localhost:3002/
        📟 ${SERVICES_NAMES.DB_SERVICE} : mongodb://localhost:27017/
        📟 ${SERVICES_NAMES.TENANT_URL_API_DASH_FORMAT} : http://<tenant-subdomain>.localhost:8080/ssi
    `,
})


