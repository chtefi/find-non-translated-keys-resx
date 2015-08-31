import minimist from 'minimist';

// Parse the arguments
export default function parseArguments(stringArgs) {
  const args = minimist(stringArgs);
  
  // langs
  if (!args.langs) {
  	console.error('ERR: Please specify a list of language to check: --langs fr,de');
  	process.exit(0);
  }
  const languages = args.langs.split(',');

  // resxFolder
  const resxFolder = args._[0];
  if (!resxFolder) {
    console.error('ERR: Please specify the folder containing the .resx files');
    process.exit(0);
  }

  return {
  	languages,
  	resxFolder
  };
}
