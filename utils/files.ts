const sanitizeFilename = (name: string) => {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export {
    sanitizeFilename
}