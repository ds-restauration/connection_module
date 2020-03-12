/**
 * sftpBatchSync wraps the ssh sftp command as a child process, executing supplied sequence of commands
 * in a batch.
 * 
 * Recommended practice is to enable the account to ssh via key installed in the ~/.ssh directory,
 * with an entry in the ~/.ssh/config for the destination host.
 * 
 * Alternatively, it is possible to use the -i <identity file> argument for sftp to use a different key
 * file.  In this case you must ensure that the key file is chmod 600
 * 
 * The sftp command will abort if any of the following commands fail: 
 * get, put, reget, reput, rename, ln, rm, mkdir, chdir, ls, lchdir, chmod, chown, chgrp, lpwd, df, symlink,
 * and lmkdir.  Termination on error can be suppressed on a command by command basis by prefixing the command
 * with a ‘-’ character (for example, -rm /tmp/blah*).
 * 
 * The stdout, stderr, and status of the child process is returned.
 * The output is converted to strings, with the sftp> prompt and issued commands filtered out.
 */
const { spawnSync } = require('child_process')

var { sshOptions, sshArgs } = require('./config'); 

// Use internal defaults if sshOptions missing from config
sshOptions = sshOptions || [
  'ServerAliveInterval=2',
  'ServerAliveCountMax=2',
  'ConnectionAttempts=1',
  'ConnectTimeout=15',
];

// Use internal defaults if sshArgs missing from config
sshArgs = sshArgs || '-b -';

function sftpBatchSync(args={}, batch=[]) {

  // insert any supplied ssh options before config/defaults to allow override.
  args.sshOptions = args.sshOptions || [];
  args.sshOptions = [ ...args.sshOptions, ...sshOptions ];
  
  if (!args.user) {
    throw { name: 'AUTH', message: `Missing user.`}
  } 
  
  if (!args.host) {
    throw { name: 'AUTH', message: `Missing host.`}
  }

  // insert any supplied ssh args after config/defaults.  Override is not possible.
  var argString = `${sshArgs} ${args.sshArgs} `;

  // append the ssh options to the arg string
  args.sshOptions.forEach((opt) => {
    argString += `-o${opt} `
  });

  // add the supplied user/host
  argString += `${args.user}@${args.host}`;
  
  const execCmd = spawnSync('sftp', [ argString ], {
    input: batch.join('\n'),
    shell: true 
  });

  if (execCmd.status == 0) 
    return String(execCmd.stdout).replace(/^sftp> .*$\n/mg,'');
  else
    err = String(execCmd.stderr);
    switch (execCmd.status) {
      case 255: // SSH
        if (errMsg = err.match(/^ssh: .*Network is unreachable$/mg)) {
          throw { name: 'UNREACHABLE', message: errMsg.join()};
        } else if (errMsg = err.match(/^Timeout, .* not responding\.$/mg)) {
          throw { name: 'TIMEOUT', message: errMsg.join()};
        } else if (errMsg = err.match(/Host key verification failed.$/mg)) {
          throw { name: 'AUTH', message: errMsg.join()};
        }
      case 1:
        if (errMsg = err.match(/^Invalid command.$/mg)) {
          throw { name: 'SYNTAX_ERROR', message: errMsg.join()};
        } else {
          throw { name: 'SSH', message: `Error ${execCmd.status}: ${err}`};
        }
      default:
        throw { name: 'SSH', message: `Error ${execCmd.status}: ${err}`};
    } 
}

module.exports = {
  sftpBatchSync: sftpBatchSync
}