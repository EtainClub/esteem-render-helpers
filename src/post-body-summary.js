import he from 'he';
import Remarkable from 'remarkable';
import {makeEntryCacheKey} from './helper';
import {cacheGet, cacheSet} from './cache';

const md = new Remarkable({html: true, breaks: true, linkify: false});

const postBodySummary = (entryBody, length) => {
  if (!entryBody) {
    return '';
  }

  // Convert markdown to html
  let text = md.render(entryBody);

  text = text
    .replace(/(<([^>]+)>)/gi, '') // Remove html tags
    .replace(/\r?\n|\r/g, ' ') // Remove new lines
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') // Remove urls
    .trim()
    .replace(/ +(?= )/g, ''); // Remove all multiple spaces

  if (length) {
    // Truncate
    text = text.substring(0, length);
  }

  text = he.decode(text); // decode html entities

  return text;
};

export default (obj, length) => {
  if (typeof obj === 'string') {
    return postBodySummary(obj, length);
  }

  const key = `${makeEntryCacheKey(obj)}-sum-${length}`;

  const item = cacheGet(key);
  if (item) {
    return item;
  }

  const res = postBodySummary(obj.body, length);
  cacheSet(key, res);

  return res;
};
