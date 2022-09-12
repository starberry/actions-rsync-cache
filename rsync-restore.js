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

    const hash = makeKey(key);
    core.info(`Cache key ${key} hashes to ${hash}`);

    const rsync = new Rsync();

    rsync.flags('a');
    if (core.isDebug()) rsync.flags('v');

    rsync.source(`${destination.trimEnd('/')}/${hash}/`);
    rsync.destination('.');

    rsync.output(
        data => core.info(data.toString()),
        data => core.error(data.toString())
    );

    core.info(rsync.command());

    rsync.execute(function (error, code, cmd) {
        core.debug(util.inspect({ rsync, error, code, cmd }));

        if (error) {
            core.setOutput("cache-hit", false);

            if (code === 23)
                process.exit(0);
        }
        else {
            core.setOutput("cache-hit", true);
        }
    });

}
catch (error) {
    core.setFailed(error.message);
    process.exit(1);
}

