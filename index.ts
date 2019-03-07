import dotenv from 'dotenv';
import fs from 'fs';
import knex from 'knex';
import { FVS_StandInit_Model } from 'models/FVS_StandInit_Model';
import sqlite3 from 'sqlite3';
// import { createFiles } from './createFiles';
import { runFVS } from './runFVS';

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

  console.log('main before runFVS');
  await runFVS(standID);
  console.log('main after runFVS');

  pg.destroy();
};

const createKeyFile = async (standID: string) => {
  await fs.copyFileSync('GENERIC.KEY', `${standID}.KEY`);
};

const updateKeyFile = async (standID: string) => {
  await fs.readFile(`${standID}.KEY`, 'utf8', (err, data) => {
    console.log('readfile');
    if (err) {
      throw err;
    }
    const result = data.replace(/%STAND_ID_TO_REPLACE%/g, standID);

    fs.writeFile(`${standID}.KEY`, result, 'utf8', error => {
      console.log('writefile');
      if (error) {
        throw err;
      }
    });
  });
};

const formatValue = (value: string) => {
  if (!!value) {
    return `'${value}'`;
  } else {
    return null;
  }
};

const updateInputDb = async (
  standID: string,
  db: knex,
  sqliteDb: sqlite3.Database
) => {
  const rows: FVS_StandInit_Model[] = await db
    .table('FVS_StandInit')
    .where({ Stand_ID: standID });

  const sqliteQuery = `INSERT INTO FVS_StandInit VALUES (
      ${rows[0].Stand_ID},
      ${formatValue(rows[0].Variant)},
      ${rows[0].Inv_Year},
      ${formatValue(rows[0].Groups)},
      ${formatValue(rows[0].AddFiles)},
      ${formatValue(rows[0].FVSKeywords)},
      ${rows[0].Latitude},
      ${rows[0].Longitude},
      ${formatValue(rows[0].Region)},
      ${formatValue(rows[0].Forest)},
      ${formatValue(rows[0].District)},
      ${formatValue(rows[0].Compartment)},
      ${formatValue(rows[0].Location)},
      ${formatValue(rows[0].Ecoregion)},
      ${formatValue(rows[0].PV_Code)},
      ${formatValue(rows[0].PV_Ref_Code)},
      ${formatValue(rows[0].Age)},
      ${rows[0].Aspect},
      ${rows[0].Slope},
      ${formatValue(rows[0].Elevation)},
      ${rows[0].ElevFt},
      ${rows[0].Basal_Area_Factor},
      ${rows[0].Inv_Plot_Size},
      ${rows[0].Brk_DBH},
      ${rows[0].Num_Plots},
      ${formatValue(rows[0].NonStk_Plots)},
      ${formatValue(rows[0].Sam_Wt)},
      ${formatValue(rows[0].Stk_Pcnt)},
      ${formatValue(rows[0].DG_Trans)},
      ${formatValue(rows[0].DG_Measure)},
      ${formatValue(rows[0].HTG_Trans)},
      ${formatValue(rows[0].HTG_Measure)},
      ${formatValue(rows[0].Mort_Measure)},
      ${formatValue(rows[0].Max_BA)},
      ${formatValue(rows[0].Max_SDI)},
      ${formatValue(rows[0].Site_Species)},
      ${formatValue(rows[0].Site_Index)},
      ${formatValue(rows[0].Model_Type)},
      ${formatValue(rows[0].Physio_Region)},
      ${formatValue(rows[0].Forest_Type)},
      ${formatValue(rows[0].State)},
      ${formatValue(rows[0].County)},
      ${formatValue(rows[0].Fuel_Model)},
      ${formatValue(rows[0].Fuel_0_25_H)},
      ${formatValue(rows[0].Fuel_25_1_H)},
      ${formatValue(rows[0].Fuel_1_3_H)},
      ${formatValue(rows[0].Fuel_3_6_H)},
      ${formatValue(rows[0].Fuel_6_12_H)},
      ${formatValue(rows[0].Fuel_12_20_H)},
      ${formatValue(rows[0].Fuel_20_35_H)},
      ${formatValue(rows[0].Fuel_35_50_H)},
      ${formatValue(rows[0].Fuel_gt_50_H)},
      ${formatValue(rows[0].Fuel_0_25_S)},
      ${formatValue(rows[0].Fuel_25_1_S)},
      ${formatValue(rows[0].Fuel_1_3_S)},
      ${formatValue(rows[0].Fuel_3_6_S)},
      ${formatValue(rows[0].Fuel_6_12_S)},
      ${formatValue(rows[0].Fuel_12_20_S)},
      ${formatValue(rows[0].Fuel_20_35_S)},
      ${formatValue(rows[0].Fuel_35_50_S)},
      ${formatValue(rows[0].Fuel_gt_50_S)},
      ${formatValue(rows[0].Fuel_Litter)},
      ${formatValue(rows[0].Fuel_Duff)},
      ${formatValue(rows[0].Photo_Ref)},
      ${formatValue(rows[0].Photo_code)}
    )`;
  await sqliteDb.run(sqliteQuery);
};

const createInputDb = async (db: sqlite3.Database) => {
  db.serialize(() => {
    db.run(`CREATE TABLE FVS_StandInit (
      Stand_ID          INT,
      Variant           TEXT,
      Inv_Year          INT,
      Groups            TEXT,
      AddFiles          TEXT,
      FVSKeywords       TEXT,
      Latitude          REAL,
      Longitude         REAL,
      Region            TEXT,
      Forest            TEXT,
      District          TEXT,
      Compartment       TEXT,
      Location          TEXT,
      Ecoregion         TEXT,
      PV_Code           TEXT,
      PV_Ref_Code       TEXT,
      Age               TEXT,
      Aspect            REAL,
      Slope             REAL,
      Elevation         TEXT,
      ElevFt            REAL,
      Basal_Area_Factor INT,
      Inv_Plot_Size     INT,
      Brk_DBH           INT,
      Num_Plots         INT,
      NonStk_Plots      TEXT,
      Sam_Wt            TEXT,
      Stk_Pcnt          TEXT,
      DG_Trans          TEXT,
      DG_Measure        TEXT,
      HTG_Trans         TEXT,
      HTG_Measure       TEXT,
      Mort_Measure      TEXT,
      Max_BA            TEXT,
      Max_SDI           TEXT,
      Site_Species      TEXT,
      Site_Index        TEXT,
      Model_Type        TEXT,
      Physio_Region     TEXT,
      Forest_Type       TEXT,
      State             TEXT,
      County            TEXT,
      Fuel_Model        TEXT,
      Fuel_0_25_H       TEXT,
      Fuel_25_1_H       TEXT,
      Fuel_1_3_H        TEXT,
      Fuel_3_6_H        TEXT,
      Fuel_6_12_H       TEXT,
      Fuel_12_20_H      TEXT,
      Fuel_20_35_H      TEXT,
      Fuel_35_50_H      TEXT,
      Fuel_gt_50_H      TEXT,
      Fuel_0_25_S       TEXT,
      Fuel_25_1_S       TEXT,
      Fuel_1_3_S        TEXT,
      Fuel_3_6_S        TEXT,
      Fuel_6_12_S       TEXT,
      Fuel_12_20_S      TEXT,
      Fuel_20_35_S      TEXT,
      Fuel_35_50_S      TEXT,
      Fuel_gt_50_S      TEXT,
      Fuel_Litter       TEXT,
      Fuel_Duff         TEXT,
      Photo_Ref         TEXT,
      Photo_code        TEXT

    )`);
  });
};

const createFiles = async (standID: string, db: knex) => {
  await createKeyFile(standID);
  await updateKeyFile(standID);
  const sqliteDb = await new sqlite3.Database(`${standID}-In.db`);
  await createInputDb(sqliteDb);
  await updateInputDb(standID, db, sqliteDb);
  sqliteDb.close();
};
main();
