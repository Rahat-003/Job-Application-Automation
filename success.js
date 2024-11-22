exports.success = (message) => {
    const txt = `\x1b[1m\x1b[32m\t${message}\x1b[39m\x1b[22m`;
    return txt;
};
