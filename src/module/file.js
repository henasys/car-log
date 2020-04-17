import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

const getTempDir = () => {
  return RNFS.TemporaryDirectoryPath;
};

const readTempDir = () => {
  const dir = getTempDir();
  return RNFS.readDir(dir);
};

const writeToTemp = (filename, contents, encoding = 'utf8') => {
  const path = getTempDir() + '/' + filename;
  return RNFS.writeFile(path, contents, encoding);
};

const readFromTemp = (filename, encoding = 'utf8') => {
  const path = getTempDir() + '/' + filename;
  return RNFS.readFile(path, encoding);
};

const getMailTempDir = () => {
  const dir = '/car_log_mail_temp';
  if (Platform.OS === 'android') {
    return RNFS.ExternalCachesDirectoryPath + dir;
  }
  return RNFS.DocumentDirectoryPath + dir;
};

const existsMailTempDir = () => {
  const dir = getMailTempDir();
  return RNFS.exists(dir);
};

const makeMailTempDir = () => {
  const dir = getMailTempDir();
  const options = {
    NSURLIsExcludedFromBackupKey: true, // iOS only
  };
  return RNFS.mkdir(dir, options);
};

const unlinkMailTempDir = () => {
  const dir = getMailTempDir();
  return RNFS.unlink(dir);
};

const readMailTempDir = () => {
  const dir = getMailTempDir();
  return RNFS.readDir(dir);
};

const getPathOnMailTemp = filename => {
  return getMailTempDir() + '/' + filename;
};

const writeToMailTemp = (filename, contents, encoding = 'utf8') => {
  const path = getPathOnMailTemp(filename);
  return RNFS.writeFile(path, contents, encoding);
};

const readFile = (path, encoding = 'utf8') => {
  return RNFS.readFile(path, encoding);
};

export default {
  getTempDir,
  readTempDir,
  writeToTemp,
  readFromTemp,
  getMailTempDir,
  existsMailTempDir,
  makeMailTempDir,
  unlinkMailTempDir,
  readMailTempDir,
  getPathOnMailTemp,
  writeToMailTemp,
  readFile,
};
