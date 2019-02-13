// from http://2ality.com/2018/05/child-process-streams.html
import { streamEnd, streamWrite } from '@rauschma/stringio';
import { ChildProcess, spawn } from 'child_process';

async function main() {
  console.log('running');

  const args = process.argv[2];
  console.log(args);
  const sink = spawn('cmd.exe', ['/c', 'FVSws.exe'],
                     { stdio: ['pipe', process.stdout, process.stderr] }); // (A)
  try {
    console.log('try\n');
    writeToWritable(args, sink.stdin); // (B)
  } catch (err) {
    console.log('catch\n');
    console.log(err);
  }
  await onExit(sink);

  console.log('### DONE');
}
main();

async function writeToWritable(args: string, writable: import('stream').Writable) {
  await streamWrite(writable, `${args}.KEY\n`);
  await streamWrite(writable, `\n`);
  await streamWrite(writable, `${args}.OUT\n`);

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
