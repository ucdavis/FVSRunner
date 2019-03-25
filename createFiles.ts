// from http://2ality.com/2018/05/child-process-streams.html
import fs from 'fs';
import knex from 'knex';
import { fvs_standinit_model } from 'models/fvs_standinit_model';
import { fvs_treeinit_model } from 'models/fvs_treeinit_model';
import sqlite3 from 'sqlite3';

export { createFiles };

const createFiles = async (
  standRow: fvs_standinit_model,
  treeRows: fvs_treeinit_model[],
  fileName: string
) => {
  await createKeyFile(fileName);
  await updateKeyFile(fileName, standRow.stand_id);
  const sqliteDb = await new sqlite3.Database(`${fileName}-In.db`);
  await createInputDb(sqliteDb);
  const sql = knex({
    client: 'sqlite3',
    connection: {
      filename: `./${fileName}-In.db`
    },
    useNullAsDefault: true
  });
  console.log('standRow: ');
  console.log(standRow);
  await sql.table('FVS_StandInit').insert(standRow);
  await sql.table('FVS_TreeInit').insert(treeRows);
  await sql.destroy();
  await sqliteDb.close();
};

const createKeyFile = async (fileName: string) => {
  await fs.copyFileSync('GENERIC.KEY', `${fileName}.KEY`);
};

const updateKeyFile = async (fileName: string, standID: string) => {
  await fs.readFile(`${fileName}.KEY`, 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    const result = data.replace(/%STAND_ID_TO_REPLACE%|%FILE_NAME_TO_REPLACE%/g, (matched) => {
      return matched === '%STAND_ID_TO_REPLACE%' ? standID : fileName;
    });

    fs.writeFile(`${fileName}.KEY`, result, 'utf8', error => {
      if (error) {
        throw err;
      }
    });
  });
};

const createInputDb = async (db: sqlite3.Database) => {
  // TODO: remove Stand_NID, Id once we don't need them
  await runAsync(
    db,
    `CREATE TABLE FVS_StandInit (
      Stand_NID         TEXT,
      Id                INTEGER,
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
  await runAsync(
    db,
    `CREATE TABLE FVS_TreeInit (
      Stand_ID	TEXT,
      StandPlot_ID	TEXT,
      Plot_ID	TEXT,
      Tree_ID	INTEGER,
      Tree_Count	TEXT,
      History	TEXT,
      Species	TEXT,
      DBH	REAL,
      DG	TEXT,
      Ht	INTEGER,
      HTG	TEXT,
      HtTopK	TEXT,
      CrRatio	TEXT,
      Damage1	TEXT,
      Severity1	TEXT,
      Damage2	TEXT,
      Severity2	TEXT,
      Damage3	TEXT,
      Severity3	TEXT,
      TreeValue	TEXT,
      Prescription	TEXT,
      Age	TEXT,
      Slope	TEXT,
      Aspect	TEXT,
      PV_Code	TEXT,
      TopoCode	TEXT,
      SitePrep	TEXT
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
