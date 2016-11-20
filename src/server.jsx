import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fetch from 'node-fetch';
import App from './jsx/App';

const app = express();
const port = 3000;
const router = express.Router();

app.use('/assets', express.static('dist'));
app.use('/assets', express.static('public'));
app.use(express.static('dist'));

function renderFullPage(renderedItem) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Lifegadget</title>
      </head>

      <body>
        <div class="content">
          ${renderedItem.html}
        </div>
        <script>
          window.__PRELOADED_STATE__ = ${renderedItem.preloadedState}
        </script>
        <script src="/assets/bundle.js"></script>
      </body>
    </html>
    `;
}
function fetchData(id, callback) {
  fetch(`http://localhost:8888/wp-json/wp/v2/posts/${id}`, {
    method: 'get',
    mode: 'cors',
  }).then((response) => {
    if (response.status === 200) {
      return response.json();
    }
    return console.dir(response);
  }).then(
    json => callback(json),
  ).catch(
    response => console.dir(response)
  );
}
function handleRender(req, res) {
  console.log(req.params);
  const id = req.params.id;
  fetchData(id, (apiResult) => {
    const preloadedState = { data: apiResult };
    console.log(preloadedState);
    const html = ReactDOMServer.renderToString(
      <App { ...preloadedState } />
    );
    const renderedItem = {
      preloadedState,
      html,
    };
    res.status(200).send(renderFullPage(renderedItem));
  });
}

app.get('/archive/:id(\\d+)', handleRender);

app.listen(
  port, () => console.log(`Hello app listening on port ${port}!`)
);
