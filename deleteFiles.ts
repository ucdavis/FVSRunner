import fs from 'fs';

export { deleteFiles };

const deleteFiles = async (fileName: string) => {
  await fs.unlinkSync(`${fileName}.KEY`);
  await fs.unlinkSync(`${fileName}.OUT`);
  await fs.unlinkSync(`${fileName}-In.db`);
  await fs.unlinkSync(`${fileName}-Out.db`);
};
