class Logger {
    static logError(error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ERROR: ${error.message || error}`);
    }

    static logInfo(message) {
        const timestamp = new Date().toISOString();
        console.info(`[${timestamp}] INFO: ${message}`);
    }

    static logWarning(message) {
        const timestamp = new Date().toISOString();
        console.warn(`[${timestamp}] WARN: ${message}`);
    }
}