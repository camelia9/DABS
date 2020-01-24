const $ = require('cheerio')
  , axios = require('axios')
  , fs = require('fs');

const BASE_URL = 'https://dbdb.io';
const START_URL = BASE_URL + '/browse';

const delay = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));

axios.get(START_URL)
  .then(async response => {
    const d = $.load(response.data, {
      normalizeWhitespace: true,
      xmlMode: true,
    });
    const dbCards = d('.card-title');

    const dbUrls = [];

    dbCards.each((idx, el) => {
      dbUrls.push(el.attribs['href']);
    });

    const dbData = [];

    for (const href of dbUrls) {
      console.log('fetching ' + href);
      const dbO = await getDB(href);
      dbData.push(dbO);
      console.log(dbO);
      await delay(100);
    }

    fs.writeFileSync('./dbdbdata.json', JSON.stringify(dbData));
  });

function getDB(href) {
  return new Promise((resolve, reject) => {
    axios.get(BASE_URL + href)
      .then(response => {
        const d = $.load(response.data, {
          normalizeWhitespace: true,
          xmlMode: true,
        });

        const allCards = d('.card');

        const title = $('h2.card-title', allCards[0]).text().trim();
        const dbObject = {
          title,
        };

        const featureCards = d('.card-feature');

        featureCards.each((index, el) => {
          const feature = el.attribs['id'];
          const featureValues = $('.card-body .card-text .badge-info', el).map((idx, e) => e.children[0].data.trim()).toArray();
          dbObject[feature] = featureValues;
        });

        const titleCards = d('.col-sm-12.col-md-3.order-1.order-md-2 .card .card-body')[1];

        const h6 = $('h6', titleCards);
        const p = $('p', titleCards);

        if (h6.length !== p.length) {
          console.error('wtf');
        }

        for (let i = 0; i < h6.length; i++) {
          const feature = $(h6[i]).text().trim();
          const featureValues = $(p[i]).text().trim().split(',');
          dbObject[feature] = featureValues;
        }
        return resolve(dbObject);
      });
  });
}
