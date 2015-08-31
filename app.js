import groupBy from 'lodash/collection/groupBy';
import difference from 'lodash/array/difference';
import async from 'async';

import parseArguments from './parseArguments.js';
import getAllResxFilenames from './getAllResxFilenames.js';
import createTasksToReadFiles from './createTasksToReadFiles.js';


const args = process.argv.slice(2);
const { resxFolder, languages } = parseArguments(args);


getAllResxFilenames(resxFolder, (err, files) => {

  // create tasks to read all file contents in parallel
  var tasks = createTasksToReadFiles(files, languages);

  // parallel read!
  async.parallel(tasks, (err, results) => {
    if (err) {
      console.error('ERR:', err);
    }

    // groups = [ 'DashboardSettings', 'WidgetSettings', ... ]
    // we are going to compare the keys of the same group
    var groups = groupBy(results, (res) => res.group);

    // for each of those resource group
    Object.keys(groups).forEach((group) => {

      // find the neutral language to get the keys that should exist everywhere
      const neutralLangItem = groups[group].filter(g => g.lang === null)[0];
      if (!neutralLangItem) {
        console.error('ERR: No neutral language found for ' + group);
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


