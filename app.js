var path = require('path');
var fs = require('fs');
var groupBy = require('lodash/collection/groupBy');
var difference = require('lodash/array/difference');
var glob = require('glob');
var parseXml = require('xml2js').parseString;
var async = require('async');
var minimist = require('minimist');

var argv = require('minimist')(process.argv.slice(2));
const BASE_LANG = argv.baseLang;
const LANGS = argv.langs.split(',')


const FOLDER = argv._[0];
if (!FOLDER) {
	console.error('Please specify a folder');
	process.exit(0);
}

var GLOB = path.join(FOLDER, '**', '*.resx');

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

				// when we have the content, parse it
    		parseXml(data, (err, result) => {
    			if (err) {
    				callback(fileName + " xml: " + err, null);
    				return;
    			}

    			if (!result.root.data) {
    				callback(null, { group, fileName, lang, keys: [] });
    				return;
    			}

    			// and read all its keys
    			var keys = result.root.data.map(node => node.$.name);

    			// and callback with the results
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
	async.parallelLimit(tasks, 10, (err, results) => {
		if (err) {
			throw Error(err)
		}

		// groups = [ 'DashboardSettings', 'WidgetSettings', ... ]
		// we are going to compare the keys of the same group
		var groups = groupBy(results, (res) => res.group);

		// for each of those resource group
		Object.keys(groups).forEach((group) => {

			// find the base lang to get the keys that should exist everywhere
			const baseLangItem = groups[group].filter(g => g.lang === BASE_LANG)[0];
			if (!baseLangItem) {
				console.error('no ' + BASE_LANG + ' found for ' + group);
				return;
			}

			const baseKeys = baseLangItem.keys;

			// check that each language in the group has all those keys
			groups[group]
				.filter(notBaseLang)
				.forEach(result => {
					const delta = difference(baseKeys, result.keys);
					if (delta.length > 0) {
						console.log(`${result.fileName} does not have those keys:`);
						console.log(delta.join('\n'));
						console.log();
					}					
				});

			/**
			* Return true if the given group is not about the base lang.
			*/
			function notBaseLang(group) {
				return group.lang !== BASE_LANG;
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
		return BASE_LANG;
	}
	return lang;
}

/**
 * Return true if the given fileName is the base lang or one of the lang we want.
 */
function filterLang(fileName) {
	var l = getLang(fileName);
	return l === BASE_LANG || LANGS.indexOf(getLang(fileName)) >= 0;
}
