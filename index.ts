// from http://2ality.com/2018/05/child-process-streams.html
import { streamEnd, streamWrite } from '@rauschma/stringio';
import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';

async function main() {
  console.log('running');

  const standID = process.argv[2];
  console.log(standID);
  if (!standID) {
    console.log('You must enter a stand ID');
    return;
  }

  createKeyFile(standID);

  console.log('after copy');

  await updateKeyFile(standID);

  const fvsSink = spawn('cmd.exe', ['/c', 'FVSws.exe'],
                        { stdio: ['pipe', process.stdout, process.stderr] }); // (A)
  try {
    writeToFVS(standID, fvsSink.stdin); // (B)
  } catch (err) {
    console.log(err);
  }
  await onExit(fvsSink);

  console.log('### DONE');
}
main();

function createKeyFile(standID: string) {
  fs.copyFileSync('GENERIC.KEY', `${standID}.KEY`);
}

async function updateKeyFile(standID: string) {
  await fs.readFile(`${standID}.KEY`, 'utf8', (err, data) => {
    console.log('readfile');
    if (err) { throw err; }
    const result = data.replace(/%STAND_ID_TO_REPLACE%/g, standID);

    fs.writeFile(`${standID}.KEY`, result, 'utf8', (error) => {
      console.log('writefile');
      if (error) { throw err; }
    });
  });
}

async function writeToFVS(standID: string, writable: import('stream').Writable) {
  await streamWrite(writable, `${standID}.KEY\n`);
  await streamWrite(writable, `\n`);
  await streamWrite(writable, `${standID}.OUT\n`);

  await streamEnd(writable);
}

function onExit(childProcess: ChildProcess): Promise<void> {
  return new Promise((resolve, reject) => {
    childProcess.once('exit', (code: number, signal: string) => {
      if (code === 0 || code === 10 || code === 20) { // FVSws is returning code 10? 20??
        resolve(undefined);
      } else {
        reject(new Error('Exit with error code: ' + code));
      }
    });
    childProcess.once('error', (err: Error) => {
      reject(err);
    });
  });
}
