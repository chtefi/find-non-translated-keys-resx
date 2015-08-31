import path from 'path';
import memoize from 'lodash/function/memoize';

/**
 * Return the lang a given resx is about.
 */
export default memoize((fileName) => {
  const filenameWithoutExtension = path.basename(fileName, '.resx');
  const lang = path.extname(filenameWithoutExtension);

	// localResources: FormulaQuery.aspx.resx
	// globalResources: TeamUserProperties.resx
  if (!lang || lang === '.aspx') {
    return null; // neutral language
  }

  return lang.slice(1); // '.fr' to 'fr'
});

