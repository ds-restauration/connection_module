A collection of connection modules
ssh
sftp
oracle

## sftpBatchSync

sftpCmd wraps the ssh sftp command as a child process, executing supplied sequence of commands in a batch.

Recommended practice is to enable the account to ssh via key installed in the ~/.ssh directory, with an entry in the ~/.ssh/config for the destination host. Alternatively, it is possible to use the -i <identity file> argument for sftp to use a different key * file.  In this case you must ensure that the key file is chmod 600.

The sftp command will abort if any of the following commands fail: get, put, reget, reput, rename, ln, rm, mkdir, chdir, ls, lchdir, chmod, chown, chgrp, lpwd, df, symlink, and lmkdir.  Termination on error can be suppressed on a command by command basis by prefixing the command with a ‘-’ character (for example, -rm /tmp/blah*).

The stdout, stderr, and status of the child process is returned. The output is converted to strings, with the sftp> prompt and issued commands filtered out.