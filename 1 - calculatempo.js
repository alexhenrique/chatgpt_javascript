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

async function processFolder(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);

    let totalDuration = 0;
    let videoCount = 0;
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        const subfolderDuration = await processFolder(filePath);
        totalDuration += subfolderDuration;
      } else if (path.extname(filePath).toLowerCase() === '.mp4') {
        const duration = await getVideoDuration(filePath);
        totalDuration += duration;
        videoCount++;
      }
    }
    if (videoCount > 0) {
      const folderName = path.basename(folderPath);
      const formattedTime = formatTime(totalDuration);
      const newFolderName = `${folderName} - [${formattedTime}]`;
      fs.renameSync(folderPath, path.join(path.dirname(folderPath), newFolderName));
      console.log(`Renamed folder "${folderName}" to "${newFolderName}"`);
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
