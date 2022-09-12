#!/usr/local/bin/node

const core = require("@actions/core");
const Rsync = require('rsync');
const util = require('util');

function makeKey(key) {
    const hash = require('crypto').createHash('sha256');
    hash.update(key);
    return hash.digest('hex');
}

try {
    const destination = core.getInput("destination", { required: true });
    if (!destination) throw new Error("destination is required");

    const key = core.getInput("key", { required: true });
    if (!key) throw new Error("key is required");

    const path = core.getInput("path", { required: true });
    let paths = path
        .split("\n")
        .map(s => s.replace(/^!\s+/, "!").trim())
        .filter(x => x);

    if (!paths) throw new Error("path is required");

    const rsync = new Rsync();

    rsync.flags('av');

    paths.forEach(p => rsync.source(p));
    rsync.destination(destination.trimEnd('/') + '/' + makeKey(key) + '/');

    rsync.output(
        data => core.info(data.toString()),
        data => core.error(data.toString())
    );

    core.info(rsync.command());

    rsync.execute(function (error, code, cmd) {
        core.debug(util.inspect({ rsync, error, code, cmd }));

        if (error) {
            core.setOutput("cache-hit", false);
            core.setFailed(error.message);
        }
        else {
            core.setOutput("cache-hit", true);
        }
    });

} catch (error) {
    core.setFailed(error.message);
    process.exit(1);
}
