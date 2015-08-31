import path from 'path';
import glob from 'glob';

export default function getAllResxFilenames(folderPath, callback) {
	var resxGlob = path.join(folderPath, '**', '*.resx');
	var options = {};
	glob(resxGlob, options, callback);
};

