const fs = require('fs');
const path = require('path');

function removeSquareBrackets(value) {
  return value.replace(/\[.*?\]/g, '');
}

function processFiles(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      const isDirectory = stats.isDirectory();

      if (!isDirectory) {
        let newName = removeSquareBrackets(file);
        if (newName !== file) {
          newName = path.join(folderPath, newName);
          fs.renameSync(filePath, newName);
          console.log(`Renamed file "${filePath}" to "${newName}"`);
        }
      }
    }

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      const isDirectory = stats.isDirectory();

      if (isDirectory) {
        processFiles(filePath);
      }
    }
  } catch (err) {
    console.error(`Error processing folder "${folderPath}":`, err);
  }
}

function processFolders(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      const isDirectory = stats.isDirectory();

      if (isDirectory) {
        processFolders(filePath);

        let newName = removeSquareBrackets(file);
        if (newName !== file) {
          newName = path.join(folderPath, newName);
          fs.renameSync(filePath, newName);
          console.log(`Renamed folder "${filePath}" to "${newName}"`);
        }
      }
    }
  } catch (err) {
    console.error(`Error processing folder "${folderPath}":`, err);
  }
}

const rootFolderPath = './';
processFiles(rootFolderPath);
processFolders(rootFolderPath);
