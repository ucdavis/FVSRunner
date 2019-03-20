// from http://2ality.com/2018/05/child-process-streams.html
import fs from 'fs';
import knex from 'knex';
import { FVS_StandInit_Model } from 'models/FVS_StandInit_Model';
import sqlite3 from 'sqlite3';

export { createFiles };

const createFiles = async (row: FVS_StandInit_Model, db: knex) => {
  const standID = row.Stand_ID;
  await createKeyFile(standID);
  await updateKeyFile(standID);
  const sqliteDb = await new sqlite3.Database(`${standID}-In.db`);
  await createInputDb(sqliteDb);
  await updateInputDb(row, sqliteDb);
  await sqliteDb.close();
};

const createKeyFile = async (standID: string) => {
  await fs.copyFileSync('GENERIC.KEY', `${standID}.KEY`);
};

const updateKeyFile = async (standID: string) => {
  await fs.readFile(`${standID}.KEY`, 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    const result = data.replace(/%STAND_ID_TO_REPLACE%/g, standID);

    fs.writeFile(`${standID}.KEY`, result, 'utf8', error => {
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
  row: FVS_StandInit_Model,
  sqliteDb: sqlite3.Database
) => {
  await runAsync(
    sqliteDb,
    `INSERT INTO FVS_StandInit VALUES (
      ${formatValue(row.Stand_ID)},
      ${formatValue(row.Variant)},
      ${row.Inv_Year},
      ${formatValue(row.Groups)},
      ${formatValue(row.AddFiles)},
      ${formatValue(row.FVSKeywords)},
      ${row.Latitude},
      ${row.Longitude},
      ${formatValue(row.Region)},
      ${formatValue(row.Forest)},
      ${formatValue(row.District)},
      ${formatValue(row.Compartment)},
      ${formatValue(row.Location)},
      ${formatValue(row.Ecoregion)},
      ${formatValue(row.PV_Code)},
      ${formatValue(row.PV_Ref_Code)},
      ${formatValue(row.Age)},
      ${row.Aspect},
      ${row.Slope},
      ${formatValue(row.Elevation)},
      ${row.ElevFt},
      ${row.Basal_Area_Factor},
      ${row.Inv_Plot_Size},
      ${row.Brk_DBH},
      ${row.Num_Plots},
      ${formatValue(row.NonStk_Plots)},
      ${formatValue(row.Sam_Wt)},
      ${formatValue(row.Stk_Pcnt)},
      ${formatValue(row.DG_Trans)},
      ${formatValue(row.DG_Measure)},
      ${formatValue(row.HTG_Trans)},
      ${formatValue(row.HTG_Measure)},
      ${formatValue(row.Mort_Measure)},
      ${formatValue(row.Max_BA)},
      ${formatValue(row.Max_SDI)},
      ${formatValue(row.Site_Species)},
      ${formatValue(row.Site_Index)},
      ${formatValue(row.Model_Type)},
      ${formatValue(row.Physio_Region)},
      ${formatValue(row.Forest_Type)},
      ${formatValue(row.State)},
      ${formatValue(row.County)},
      ${formatValue(row.Fuel_Model)},
      ${formatValue(row.Fuel_0_25_H)},
      ${formatValue(row.Fuel_25_1_H)},
      ${formatValue(row.Fuel_1_3_H)},
      ${formatValue(row.Fuel_3_6_H)},
      ${formatValue(row.Fuel_6_12_H)},
      ${formatValue(row.Fuel_12_20_H)},
      ${formatValue(row.Fuel_20_35_H)},
      ${formatValue(row.Fuel_35_50_H)},
      ${formatValue(row.Fuel_gt_50_H)},
      ${formatValue(row.Fuel_0_25_S)},
      ${formatValue(row.Fuel_25_1_S)},
      ${formatValue(row.Fuel_1_3_S)},
      ${formatValue(row.Fuel_3_6_S)},
      ${formatValue(row.Fuel_6_12_S)},
      ${formatValue(row.Fuel_12_20_S)},
      ${formatValue(row.Fuel_20_35_S)},
      ${formatValue(row.Fuel_35_50_S)},
      ${formatValue(row.Fuel_gt_50_S)},
      ${formatValue(row.Fuel_Litter)},
      ${formatValue(row.Fuel_Duff)},
      ${formatValue(row.Photo_Ref)},
      ${formatValue(row.Photo_code)}
    )`
  );
};

const createInputDb = async (db: sqlite3.Database) => {
  await runAsync(
    db,
    `CREATE TABLE FVS_StandInit (
      Stand_ID          TEXT,
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
    )`
  );
};

const runAsync = (sql: sqlite3.Database, sqlQuery: string) => {
  return new Promise((resolve, reject) => {
    sql.run(sqlQuery, (err: any, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};
