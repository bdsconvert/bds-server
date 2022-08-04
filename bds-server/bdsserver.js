const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.static('assets'));
app.use(express.static('src/components'));

//// create random json data
// for (let i=1000000; i>0; i--) {
//   let titlesuffix = '0'.repeat(7-i.toString().length) + i.toString();
//   fs.appendFileSync(`${__dirname}/users/Madhu/file3.xml.json`,`{"recref": "${Math.floor(Math.random() * 100000000)}", "title": "Title ${titlesuffix}", "author": "Author ${Math.random().toString(36).substring(2)}"},\n`); 
//   //fs.appendFileSync(`${__dirname}/users/Madhu/file2.xml.json`,`{"recref": "${Math.floor(Math.random() * 10000000)}", "title": "Title ${Math.random().toString(36).substring(2)}", "author": "Author ${Math.random().toString(36).substring(2)}"},\n`); 
// }

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/home', async (req, res) => {

  getTitles ('Madhu', 'file3.xml.json', 'title', 100, res);

    //res.sendFile(path.join(__dirname, '/src/components/bds-home.js'));

});

app.listen(port, () => {
  console.log(`BDS Server listening on port ${port}`);
});
/////////////////////////////////////////////////////////////////////////////////////////////

const getTitles = (user, file, sortby, page, res) => {
  console.log('Running getTitles ', user, '/', file, '/', sortby, '/', page);
  let titleStart = (page-1) * 10;
  let titleEnd = titleStart + 10;
  console.log(titleStart,titleEnd);
  let titles = [];
  let sortedTitles = [];
  const stream = fs.createReadStream(`${__dirname}/users/${user}/${file}`, {flag: 'r', encoding: 'utf-8'});
  
  let count = 0;
  let json = '';
  stream.on('data', (chunk) => {
      let jss = 0;
      let jso = 0;
      json += chunk;
      while (jso !== -1) {
          jss = json.search(/\{/g);
          jso = json.search(/\}\s*\,*\s*[\{\]]/g);
          if (jso !== -1) {
              titles.push(JSON.parse(json.substring(jss,jso+1)));
              json = json.slice(jso+1);
          }
      }
      console.log('Chunk ', ++count, ` - ${titles.length-1} Titles Read`);
      // sort chunks
      titles.sort((a,b) => (a.title.toUpperCase() > b.title.toUpperCase()) ? 1 : -1);
      console.log(titles.length);
      sortedTitles = [...sortedTitles, ...titles.slice(titleStart,titleEnd)];
      console.log(sortedTitles.length);
      titles = [];
  });
  stream.on('end', (chunk) => {
    // sort final
    sortedTitles.sort((a,b) => (a.title > b.title) ? 1 : -1);
    console.log(sortedTitles.slice(0,10));
    res.send(sortedTitles.slice(0,10));
  });

}
/////////////////////////////////////////////////////////////////////////////////////////////
