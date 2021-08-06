#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';
var path = require('path');
var fs = require('fs');


// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const spawn = require('react-dev-utils/crossSpawn');
//const parent = require('react-scripts/bin/react-scripts');
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
    x => x === 'build' || x === 'devbuild' || x === 'eject' || x === 'start' || x === 'test'
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];
const parentPath = path.join(__dirname,'../', 'node_modules', 'react-scripts');
const scriptFileName = 'devbuild.js';

const devScriptDir = path.join(parentPath, 'scripts');
const devScriptPath = path.join(devScriptDir, scriptFileName);

const devScriptSrcDir = path.join(__dirname, '../scripts');
const devScriptSrcPath = path.join(devScriptSrcDir, scriptFileName);

if (!fs.existsSync(devScriptSrcPath)) {
    console.log('Script source "' + devScriptSrcPath + '"does not exist.');
    process.exit(1);
}


if (!fs.existsSync(devScriptPath)) {
    fs.copyFileSync(devScriptSrcPath, devScriptPath, fs.constants.COPYFILE_FICLONE);
}
if (!fs.existsSync(devScriptPath)) {
    console.log('Script "' + devScriptPath + '"does not exist.');
    process.exit(1);
}
const scriptIsListed = (['build', 'devbuild', 'eject', 'start', 'test'].includes(script));
if (!scriptIsListed) {
    console.log('Unknown script "' + script + '".');
    console.log('Perhaps you need to update react-scripts?');
    console.log(
        'See: https://facebook.github.io/create-react-app/docs/updating-to-new-releases'
    );
    process.exit(1);
}
{
    const result = spawn.sync(
        process.execPath,
        nodeArgs
            //.concat(require.resolve('../scripts/' + script))
            .concat(require.resolve(parentPath + '/scripts/' + script))
            .concat(args.slice(scriptIndex + 1)),
        { stdio: 'inherit' }
    );
    if (result.signal) {
        if (result.signal === 'SIGKILL') {
            console.log(
                'The build failed because the process exited too early. ' +
                'This probably means the system ran out of memory or someone called ' +
                '`kill -9` on the process.'
            );
        } else if (result.signal === 'SIGTERM') {
            console.log(
                'The build failed because the process exited too early. ' +
                'Someone might have called `kill` or `killall`, or the system could ' +
                'be shutting down.'
            );
        }
        process.exit(1);
    }
    process.exit(result.status);
}
