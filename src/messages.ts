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
    NETWORK_NOT_SUPPOERTED: "Network not supported, supported networks ['testnet']",
    NO_CONFIG_FOUND: "No configuration found, kindly run `studio-cli setup` command first.",
    DOCKER_NOT_INSTALLED: "Docker is not installed, please install docker to proceed. https://docs.docker.com/engine/install/",
    DOCKER_COMPOSE_NOT_INSTALLED: "Docker Compose is not installed, please install docker-compose to proceed. https://docs.docker.com/compose/install/"
})

export const TASKS = Object.freeze({
    PULLING_MONGO_CONFIG: `${SERVICES_NAMES.DB_SERVICE} Configuration`,
    PULLING_EDV_CONFIG: `${SERVICES_NAMES.EDV_SERVICE} Configuration`,
    PULLING_SSI_API_CONFIG: `${SERVICES_NAMES.SSI_API_SERVICE} Configuration`,
    PULLING_SSI_API_PROXY_CONFIG: `${SERVICES_NAMES.SSI_API_PROXY_SERVICE} Configuration`,
    PULLING_STUDIO_SERVICE_CONFIG: `${SERVICES_NAMES.STUDIO_SERVICE} Configuration`,
    PULLING_STUDIO_UI_CONFIG: `${SERVICES_NAMES.STUDIO_UI} Configuration`,

    IF_ALL_DEPENDENCIES_INSTALLED: "Checking all dependencies installed",
    SETTING_SERVIES_CONFIG: `Setting all services configurations`,
    SHUTTING_DOWN_CONTAINERS: `Shutting down all container(s)`,
    DELETE_VOLUMES: "Deleting associated volumes",
    REMOVE_IMAGES: "Removing images",

    HID_NODE_CONFIG: `Hypersign Node Configuration`,

    CLEAN_WORKDIR: 'Cleaning working directories',
    IF_DOCKER_INSTALLED: "Checking if docker is installed",
    IF_DOCKER_COMPOSE_INSTALLED: `Checking if docker-compose is installed`,
    IF_DOCKER_DEAMON_RUNNING: `Checking if docker deamon is running`,

    SPINNING_UP_CONTAINER: 'Spinning up all container(s)',

    SHUTTINGDOWN: `Shutdown`

})

export const PROMPTS = Object.freeze({
    CHOOSE_MNEMONIC : "Choose mnemonic setup",
    WANT_EDV_SERVICE_Q : "Do you want to setup Encrypted Data Vault service?",
    CONFIGURATION_ALREADY_EXISTS_Q: "WARNING Configuration already exists, this action will erase all your existing configuration, do you still want to continue?",
    ABOUT_TO_DELETE_ALL_CONFIG_Q: 'WARNING You are about to delete all your configurations, do you still want to continue?',
    SELECT_NETWORK: 'Select Hypersign network',
    ENTER_WORDS_MNEMONIC: '  Enter 24 words mnemonic',
})


export const LOG = Object.freeze({
    ALL_CONFIG_SUCCESS : `
    🦄 All configurations setup successfully!
    🦄 You may run the 'studio-cli start' command to start your services.
    `,
    SETUP_DESCRIPTION: 'Setup configurations for Hypersign issuer node infrastructure',
    START_DESCRIPTION: 'Start Hypersign issuer node infrastructure',
    STOP_DESCRIPTION: 'Stop Hypersign issuer node infrastructure',
    CLEAN_DESCRIPTION: 'Stop and Delete Hypersign issuer node infrastructure',

    ALL_CONTAINERS_STOPPED: '🦄 All containers has been stopped successfully',
    ALL_CONTAINERS_CLEANED: '🦄 All containers has been cleaned successfully',

    ALL_START_LOG : `
    ${SERVICES_NAMES.APP_NAME} is setup and running successfully
        📟 ${SERVICES_NAMES.STUDIO_UI} : http://localhost:9001/
        📟 ${SERVICES_NAMES.STUDIO_SERVICE} : http://localhost:3002/
        📟 ${SERVICES_NAMES.DB_SERVICE} : mongodb://localhost:27017/
        📟 ${SERVICES_NAMES.TENANT_URL_API_DASH_FORMAT} : http://<tenant-subdomain>.localhost:8080/ssi
    `,
})


