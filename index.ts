import dotenv from 'dotenv';
import knex from 'knex';
import { createFiles } from './createFiles';
import { deleteFiles } from './deleteFiles';
import { runFVS } from './runFVS';
import { updateFromOutputDb } from './updateFromOutputDb';

const main = async () => {
  dotenv.config();

  console.log('connecting to db', process.env.DB_HOST);
  // https://knexjs.org/
  const pg = knex({
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: 'FVSRunner'
    }
  });

  const standID = process.argv[2];
  if (!standID) {
    console.log('Error: missing standID');
    return;
  }
  console.log(standID);

  await createFiles(standID, pg);

  await runFVS(standID);

  await updateFromOutputDb(standID, pg);

  await deleteFiles(standID);

  pg.destroy();
};

main();
