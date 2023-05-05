const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration;
        resolve(parseFloat(duration));
      }
    });
  });
}

function formatTime(duration) {
  const seconds = Math.floor(duration);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  let formattedTime = '';
  const days = Math.floor(seconds / (3600 * 24));
  if (days > 0) {
    formattedTime += `${days}Di `;
  }
  const hours = Math.floor(seconds / 3600) % 24;
  if (hours > 0) {
    formattedTime += `${hours}Ho `;
  }
  if (minutes > 0) {
    formattedTime += `${minutes}Mi `;
  }
  formattedTime += ` ${remainingSeconds}s`;
  return formattedTime.trim();
}

async function processFolder(folderPath, baseFolderPath = folderPath) {
  try {
    const files = fs.readdirSync(folderPath);

    let totalDuration = 0;
    let videoCount = 0;
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        const subfolderDuration = await processFolder(filePath, baseFolderPath);
        totalDuration += subfolderDuration;
      } else if (path.extname(filePath).toLowerCase() === '.mp4') {
        const fileExtension = path.extname(filePath);
        const fileName = path.basename(filePath, fileExtension);
        const hasTimeExtension = /\s\[\d+.*\]/.test(fileName); // Verifica se já possui a extensão de tempo no nome
        if (!hasTimeExtension) {
          const duration = await getVideoDuration(filePath);
          totalDuration += duration;
          videoCount++;
          const formattedTime = formatTime(duration);
          const newFileName = `${fileName} [${formattedTime}]${fileExtension}`;
          fs.renameSync(filePath, path.join(path.dirname(filePath), newFileName));
          console.log(`Renamed video "${fileName}" to "${newFileName}"`);
        }
      }
    }
    if (videoCount > 0 && folderPath !== baseFolderPath) {
      const folderName = path.basename(folderPath);
      const hasTimeExtension = /\s\[\d+.*\]/.test(folderName); // Verifica se já possui a extensão de tempo no nome
      if (!hasTimeExtension) {
        const formattedTime = formatTime(totalDuration);
        const newFolderName = `${folderName} - [${formattedTime}]`;
        fs.renameSync(folderPath, path.join(path.dirname(folderPath), newFolderName));
        console.log(`Renamed folder "${folderName}" to "${newFolderName}"`);
      }
      return totalDuration;
    }
    return 0;
  } catch (err) {
    console.error(`Error processing folder "${folderPath}":`, err);
    return 0;
  }
}

const rootFolderPath = './';
processFolder(rootFolderPath);
