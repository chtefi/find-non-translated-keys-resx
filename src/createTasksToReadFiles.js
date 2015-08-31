import fs from 'fs';
import path from 'path';
import getFileLanguage from './getFileLanguage.js';
import getResxKeys from './getResxKeys.js';


/**
 * Return true if the given fileName is the neutral lang or one of the lang we want.
 */
function filterLang(languages) {
  return (fileName) => {
    var lang = getFileLanguage(fileName);
    return lang === null || languages.indexOf(lang) >= 0;
  }
}

export default function createTasksToReadFiles(files, languages) {
  return files
    .filter(filterLang(languages))
    .map((fileName) => {
      const group = path.basename(fileName).split('.')[0];
      const lang = getFileLanguage(fileName);

      return callback => 

        // read each file async
        fs.readFile(fileName, (err, data) => {
          if (err) {
            callback(fileName + ' ' + err, null);
            return;
          }

          // get all the resx keys inside the file
          getResxKeys(data, (err, keys) => {
            if (err) {
              callback(err, null);
            }

            callback(null, {
              group,
              fileName,
              lang,
              keys
            });
          });

        });

    });
}
