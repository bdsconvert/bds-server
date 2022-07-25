const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.static('assets'));
app.use(express.static('src/components'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/home', (req, res) => {
    const titles = [];
    const stream = fs.createReadStream(`${__dirname}/users/Madhu/file1.xml.json`, {flag: 'r', encoding: 'utf-8'});
    //stream.pipe(res);
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
    });
    stream.on('end', (chunk) => {console.log(`${titles.length} Titles Read Completed!`, `Record 1 - ${titles[0].format.primary},`, `Record ${titles.length} - ${titles[titles.length-1].title}`)});

    //res.sendFile(path.join(__dirname, '/src/components/bds-home.js'));

});

app.listen(port, () => {
  console.log(`BDS Server listening on port ${port}`);
});