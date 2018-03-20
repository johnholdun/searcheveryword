const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const WORDS = fs.readFileSync(`${__dirname}/archive.csv`).toString().split("\n").reduce((obj, line) => {
  const [id, word] = line.split(',');
  obj[word] = id;
  return obj;
}, {});

const handleWord = (response, word, json) => {
  const id = WORDS[word];

  if (!id) {
    response.status(404);

    if (json) {
      response.setHeader('Content-Type', 'application/json');
      response.send(JSON.stringify({ error: '@everyword never tweeted this word' }));
    } else {
      response.setHeader('Content-Type', 'text/plain');
      response.send('@everyword never tweeted this word');
    }

    response.end();
    return;
  }

  const url = `http://twitter.com/everyword/statuses/${id}`;

  if (json) {
    response.setHeader('Content-Type', 'application/json');
    response.send(JSON.stringify({ word, url }));
  } else {
    response.redirect(301, url);
  }
};

const normalizeSentence = (sentence) => {
  return sentence.toLowerCase().replace(/[^a-zé -]/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
}

const forSentences = (request, response, sentence) => {
  response.sendFile(`${__dirname}/template-for-sentences.html`);
}

const app = express();

app.use(express.static('public'))

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/for-sentences/:sentence/?', (request, response) => {
  const { sentence } = request.params;

  const normalizedSentence = normalizeSentence(sentence);

  if (normalizedSentence !== sentence) {
    response.redirect(301, `/for-sentences/${normalizedSentence}/`);
    return;
  }

  forSentences(request, response, request.params.sentence);
});

app.get('/for-sentences/?', (request, response) => {
  forSentences(request, response, null);
});

app.post('/', (request, response) => {
  response.redirect(301, `/${request.body.word}`);
});

app.post('/for-sentences/?', (request, response) => {
  const { sentence } = request.body;
  const normalizedSentence = normalizeSentence(sentence);

  response.redirect(301, `/for-sentences/${normalizedSentence}/`);
});

app.get('/:word.json', (request, response) => {
  handleWord(response, request.params.word, true);
});

app.get('/:word/?', (request, response) => {
  if (request.params.word.indexOf('.') > -1) {
    response.writeHead(406, { 'Content-Type': 'text/plain' });
    response.write('File type not supported');
    response.end();
    return;
  }

  handleWord(response, request.params.word, false);
});

app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/template.html`);
});

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
