import { parseString as parseXml } from 'xml2js';

export default function getResxKeys(xml, callback) {
  parseXml(xml, (err, result) => {
    // couldn't parse ?
    if (err) {
      callback(err, null);
      return;
    }

    // no keys ?
    if (!result.root.data) {
      callback(null, []);
      return;
    }

    // and read all its keys
    const keys = result.root.data.map(node => node.$.name);

    // callback with the results
    callback(null, keys);
  });
}
