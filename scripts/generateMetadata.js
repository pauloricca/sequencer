const fs = require('fs');
const path = require('path');

const SAMPLES_PATH = `${__dirname}/../samples`;
const SAMPLES_META_PATH = `${__dirname}/../src/metadata/samples.meta.json`;

const navigateDir = (dirPath, samplesMetaArr) => {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    if (!file.startsWith('.')) {
      const filePath = path.join(dirPath, file);

      // get the file stats
      const fileStat = fs.statSync(filePath);

      // if the file is a directory, recursively search the directory
      if (fileStat.isDirectory()) {
        const dirSamplesMetaArr = [];
        navigateDir(filePath, dirSamplesMetaArr);
        samplesMetaArr.push({ name: file, type: 'directory', samples: dirSamplesMetaArr });
      } else {
        samplesMetaArr.push({ name: file, type: 'file' });
      }
    }
  }
};

/**
 * Generates a samples metadata json file.
 * Overrites existing file if the content has changed and returns true, otherwise returns false.
 */
const generateMetadata = () => {
  const samplesMetaArr = [];

  navigateDir(SAMPLES_PATH, samplesMetaArr);

  const newSamplesMeta = JSON.stringify({ samples: samplesMetaArr }, null, 2);
  const previousSamplesMeta = (() => {
    try {
      return fs.readFileSync(SAMPLES_META_PATH, { encoding: 'utf8' });
    } catch {
      return '';
    }
  })();

  if (newSamplesMeta !== previousSamplesMeta) {
    fs.writeFileSync(SAMPLES_META_PATH, newSamplesMeta, { encoding: 'utf8' });
    return true;
  } else {
    return false;
  }
};

module.exports = generateMetadata;
