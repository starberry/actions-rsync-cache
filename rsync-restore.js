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

    const rsync = new Rsync();

    rsync.flags('av');

    rsync.source(destination.trimEnd('/') + '/' + makeKey(key) + '/');
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

