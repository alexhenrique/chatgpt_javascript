const fs = require('fs');
const path = require('path');

function isolateTimeValues(str) {
  const start = str.indexOf('[');
  const end = str.indexOf(']');
  if (start === -1 || end === -1) {
    return -1;
  }
  const timeValues = str.substring(start + 1, end).trim();
  const dadoFormatado = timeValues.replace(/\s+/g, '');  
  if (/^\d+Ho\d+Mi\d+s$/.test(dadoFormatado)) {
    const partes = dadoFormatado.split(/Ho|Mi|s/);
    const horas = parseInt(partes[0]);
    const minutos = parseInt(partes[1]);
    const segundos = parseInt(partes[2]);
    return horas * 3600 + minutos * 60 + segundos;
  } else if (/^\d+Mi\d+s$/.test(dadoFormatado)) {
    const partes = dadoFormatado.split(/Mi|s/);
    const minutos = parseInt(partes[0]);
    const segundos = parseInt(partes[1]);
    return minutos * 60 + segundos;
  } else if (/^\d+Ho\d+s$/.test(dadoFormatado)) {
    const partes = dadoFormatado.split(/Di|Ho|Mi|s/);
    const horas = parseInt(partes[0]);
    const segundos = parseInt(partes[1]);
    return horas * 3600 + segundos;
  } else if (/^\d+Di\d+Ho\d+Mi\d+s$/.test(dadoFormatado)) {
    const partes = dadoFormatado.split(/Di|Ho|Mi|s/);
    const dias = parseInt(partes[0]);
    const horas = parseInt(partes[1]);
    const minutos = parseInt(partes[2]);
    const segundos = parseInt(partes[3]);
    return dias * 86400 + horas * 3600 + minutos * 60 + segundos;
  } else if (/^\d+Di\d+Mi\d+s$/.test(dadoFormatado)) {
    const partes = dadoFormatado.split(/Di|Mi|s/);
    const dias = parseInt(partes[0]);
    const minutos = parseInt(partes[1]);
    const segundos = parseInt(partes[2]);
    return dias * 86400 + minutos * 60 + segundos;
  } else if (/^\d+Di\d+Ho\d+s$/.test(dadoFormatado)) {
    const partes = dadoFormatado.split(/Di|Ho|s/);
    const dias = parseInt(partes[0]);
    const horas = parseInt(partes[1]);
    const segundos = parseInt(partes[2]);
    return dias * 86400 + horas * 3600 + segundos;
  } else if (/^\d+Di\d+Ho\d+Mi$/.test(dadoFormatado)) {
    const partes = dadoFormatado.split(/Di|Ho|Mi/);
    const dias = parseInt(partes[0]);
    const horas = parseInt(partes[1]);
    const minutos = parseInt(partes[2]);
    return dias * 86400 + horas * 3600 + minutos * 60;
  } else if (/^\d+Ho\d+Mi$/.test(dadoFormatado)) {
    const partes = dadoFormatado.split(/Ho|Mi/);
    const horas = parseInt(partes[0]);
    const minutos = parseInt(partes[1]);
    return horas * 3600 + minutos * 60;
  } else {
    return -1;
  } 
}

function extractTimeValues(folderName) {
  const timeValues = isolateTimeValues(folderName);
  return timeValues;
}

function sumTimeValues(values) {
  return values.reduce((total, value) => total + value, 0);
}

function renameFolderWithTime(folderPath, totalSeconds) {
  const parentFolderPath = path.dirname(folderPath);
  const folderName = path.basename(folderPath);
  const newFolderName = `${folderName} [${totalSeconds}s]`;
  const newFolderPath = path.join(parentFolderPath, newFolderName);
  console.log(totalSeconds);
  fs.renameSync(folderPath, newFolderPath);
}

function processSubfolders(folderPath) {
  const subfolders = fs.readdirSync(folderPath, { withFileTypes: true });
  for (const subfolder of subfolders) {
    if (subfolder.isDirectory()) {
      const subfolderPath = path.join(folderPath, subfolder.name);
      const timeValues = extractTimeValues(subfolder.name);
      console.log(timeValues, subfolderPath)
      if (timeValues !== -1){
      //   const totalSeconds = sumTimeValues(timeValues);
      //   if (totalSeconds > 0) {
          renameFolderWithTime(subfolderPath, timeValues);
          console.log(subfolderPath, timeValues);
      //   }
      }
      processSubfolders(subfolderPath);
    }
  }
}

const rootFolderPath = './';
processSubfolders(rootFolderPath);
