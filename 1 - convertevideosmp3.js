const fs = require('fs');
const path = require('path');
const ffmpeg = require('ffmpeg');

const sourcePath = './videos';
const destinationPath = './saidaMp3';

fs.readdir(sourcePath, (err, files) => {
  if (err) {
    console.error('Erro ao ler a pasta de origem:', err);
    return;
  }

  files.forEach(file => {
    const filePath = path.join(sourcePath, file);
    const fileExt = path.extname(file);

    // Verifica se o arquivo é um vídeo mp4
    if (fileExt === '.mp4') {
      console.log('Convertendo', file, 'para mp3...');

      try {
        // Usa o FFmpeg para converter o vídeo em mp3 mono 128kbps
        const command = ffmpeg(filePath)
          .noVideo()
          .audioChannels(1)
          .audioBitrate('128k')
          .format('mp3')
          .saveToFile(path.join(destinationPath, `${path.basename(file, fileExt)}.mp3`));
      } catch (err) {
        console.error('Erro ao converter', file, ':', err);
      }
    }
  });
});
