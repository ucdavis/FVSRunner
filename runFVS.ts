// from http://2ality.com/2018/05/child-process-streams.html
import { streamEnd, streamWrite } from '@rauschma/stringio';
import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';

export { runFVS };

const runFVS = async (standID: string) => {
  console.log('runFVS');

  const fvsSink = spawn('cmd.exe', ['/c', 'FVSws.exe'], {
    stdio: ['pipe', process.stdout, process.stderr]
  }); // (A)

  try {
    await writeToFVS(standID, fvsSink.stdin); // (B)
  } catch (err) {
    console.log(err);
  }
  await onExit(fvsSink);
};

const writeToFVS = async (
  standID: string,
  writable: import('stream').Writable
) => {
  console.log('writeToFVS ' + standID);
  await streamWrite(writable, `${standID}.KEY\n`);
  await streamWrite(writable, `\n`);
  await streamWrite(writable, `${standID}.OUT\n`);
  await streamEnd(writable);
};

const onExit = async (childProcess: ChildProcess) => {
  return new Promise((resolve, reject) => {
    console.log('onExit');
    childProcess.once('exit', (code: number, signal: string) => {
      if (code === 0 || code === 10 || code === 20) {
        // FVSws is returning code 10? 20??
        resolve(undefined);
      } else {
        reject(new Error('Exit with error code: ' + code));
      }
    });
    childProcess.once('error', (err: Error) => {
      reject(err);
    });
  });
};
