import fs from 'fs';

export { deleteFiles };

const deleteFiles = async (standID: string) => {
  await fs.unlinkSync(`${standID}.KEY`);
  await fs.unlinkSync(`${standID}.OUT`);
  await fs.unlinkSync(`${standID}-In.db`);
  await fs.unlinkSync(`${standID}-Out.db`);
};
