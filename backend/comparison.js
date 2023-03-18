const stringSimilarity = require('string-similarity');

function setUnprotectedUrl(url1, url2) {
  // console.log(url1, url2);

  const similarity = stringSimilarity.compareTwoStrings(url1, url2);
  const isUnprotected = similarity > 0.75 && similarity !== 1;
  return { isUnprotected, similarity };
}

const realUrl = 'https://www.example.com/';
const urls = [
  { url: 'https://www.example.com/', isUnprotected: false, similarity: 0 },
  { url: 'https://www.example.org/', isUnprotected: false, similarity: 0},
  { url: 'https://www.example.net/', isUnprotected: false, similarity: 0 },
  { url: 'https://www.example.edu/', isUnprotected: false, similarity: 0 },
  { url: 'https://www.example.co.uk/', isUnprotected: false, similarity: 0 },
];

// eslint-disable-next-line no-restricted-syntax
for (const i of urls) {
  const data = setUnprotectedUrl(realUrl, i.url);
  i.isUnprotected = data.isUnprotected
  i.similarity = data.similarity
}
console.log(urls);
