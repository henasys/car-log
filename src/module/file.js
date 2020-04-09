import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

const getTempDir = () => {
  return RNFS.TemporaryDirectoryPath;
};

const readTempDir = () => {
  const dir = getTempDir();
  return RNFS.readDir(dir);
};

const writeToTemp = (filename, contents, encoding) => {
  const path = getTempDir() + '/' + filename;
  return RNFS.writeFile(path, contents, encoding);
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

const writeToMailTemp = (filename, contents, encoding) => {
  const path = getPathOnMailTemp(filename);
  return RNFS.writeFile(path, contents, encoding);
};

export default {
  getTempDir,
  readTempDir,
  writeToTemp,
  getMailTempDir,
  existsMailTempDir,
  makeMailTempDir,
  unlinkMailTempDir,
  readMailTempDir,
  getPathOnMailTemp,
  writeToMailTemp,
};
