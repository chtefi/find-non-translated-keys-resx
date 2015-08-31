import path from 'path';
import fs from 'fs';
import groupBy from 'lodash/collection/groupBy';
import difference from 'lodash/array/difference';
import glob from 'glob';
import async from 'async';

import parseArguments from './parseArguments.js';
import getResxKeys from './getResxKeys.js';

const args = process.argv.slice(2);
const { resxFolder, languages } = parseArguments(args);


var GLOB = path.join(resxFolder, '**', '*.resx');

var options = {};
glob(GLOB, options, (err, files) => {

  // create tasks to read all file contents in parallel
  var tasks = files.filter(filterLang).map((fileName) => {
    const group = path.basename(fileName).split('.')[0];
    const lang = getLang(fileName);

    return callback => 

      // read each file async
      fs.readFile(fileName, (err, data) => {
        if (err) {
          callback(fileName + ": " + err, null);
          return;
        }

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

  // parallel read!
  async.parallel(tasks, (err, results) => {
    if (err) {
      throw Error(err)
    }

    // groups = [ 'DashboardSettings', 'WidgetSettings', ... ]
    // we are going to compare the keys of the same group
    var groups = groupBy(results, (res) => res.group);

    // for each of those resource group
    Object.keys(groups).forEach((group) => {

      // find the neutral language to get the keys that should exist everywhere
      const neutralLangItem = groups[group].filter(g => g.lang === null)[0];
      if (!neutralLangItem) {
        console.error('no neutral language found for ' + group);
        return;
      }

      const neutralKeys = neutralLangItem.keys;

      // check that each language in the group has all those keys
      groups[group]
        .filter(notNeutralLang)
        .forEach(result => {
          const delta = difference(neutralKeys, result.keys);
          if (delta.length > 0) {
            console.log(`${result.fileName} does not have those keys:`);
            console.log(delta.join('\n'));
            console.log();
          }         
        });

      /**
      * Return true if the given group is not about the neutral lang.
      */
      function notNeutralLang(group) {
        return group.lang !== null;
      }

    });


  })

});


/**
 * Return the lang a given resx is about.
 */
function getLang(fileName) {
  const lang = path.extname(path.basename(fileName).replace('.resx', '')).split('.')[1];

  if (lang === 'aspx' /* localResources: FormulaQuery.aspx.resx */
   || lang === undefined  /* globalResources: TeamUserProperties.resx */ ) {
    return null;
  }
  return lang;
}

/**
 * Return true if the given fileName is the neutral lang or one of the lang we want.
 */
function filterLang(fileName) {
  var lang = getLang(fileName);
  return lang === null || languages.indexOf(lang) >= 0;
}
