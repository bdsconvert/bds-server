// const { once } = require('events');
const fs = require('fs');
// const { title } = require('process');
const readline = require('readline');

// create random json data
const createRandomTitles = (file) => {
    for (let i=50000; i>0; i--) {
        let titlesuffix = '0'.repeat(7-i.toString().length) + i.toString();
        fs.appendFileSync(`${__dirname}/users/Madhu/${file}`,`{"recref": "${Math.floor(Math.random() * 100000000)}", "title": "Title ${titlesuffix}", "author": "Author ${Math.random().toString(36).substring(2)}"}\n`); 
      }      
}
//createRandomTitles('file1.xml.json');

const sortTitles = (user, file, sortby) => {
    let titles = [];
    let chunks = [];
    let reccount = 0;
    const stream = fs.createReadStream(`${__dirname}/users/${user}/${file}`, {flag: 'r', encoding: 'utf-8'});
    let count = 1;
    let json = '';
    stream.on('data', (chunk) => {
        let numrecs = 0;
        let jss = 0;
        let jso = 0;
        json += chunk;
        while (jso !== -1) {
            jss = json.search(/\{/g);
            jso = json.search(/\}\s*\{*/g);
            if (jso !== -1) {
                titles.push(JSON.parse(json.substring(jss,jso+1)));
                json = json.slice(jso+1);
                numrecs++;
            }
        }
        titles.sort((a,b) => (a[`${sortby}`].toUpperCase() > b[`${sortby}`].toUpperCase()) ? 1 : -1);
        fs.appendFileSync(`${__dirname}/users/${user}/temp/Chunk${count}.json`, `${JSON.stringify(titles,null,1)}`);
        chunks.push(`Chunk${count++}`);
        console.log(`Chunk${count++} => ${numrecs}`);
        reccount += numrecs;
        titles = [];
    });

  
    stream.on('end', (chunk) => {
        console.log(`Sorting [${file}] by [${sortby}] => ${reccount} records`);
        let msort = [];
        
        // read first object from each sorted file
        chunks.forEach(file => {
            let cl = [];
            cl = JSON.parse(fs.readFileSync(`${__dirname}/users/${user}/temp/${file}.json`));
            cl[0].file = file;

            // build a heap to hold intermediate min objects
            msort.push(cl[0]);

            // write back to file with first object removed;
            cl.shift();
            fs.writeFileSync(`${__dirname}/users/${user}/temp/${file}.json`, `${JSON.stringify(cl,null,1)}`);
        });

        // merge sort
        const ofile = `${__dirname}/users/${user}/${file}.${sortby}`;
        if(fs.existsSync(ofile)) fs.unlinkSync(ofile);
        let rec = 0
        do {
            // sort msort heap
            msort.sort((a,b) => (a[`${sortby}`].toUpperCase() > b[`${sortby}`].toUpperCase()) ? 1 : -1);

            // remove min object from msort heap
            let minobj = msort.shift();

            // write min object to final sorted file
            fs.appendFileSync(ofile, `${JSON.stringify(minobj)}\n`);

            // read the first object from the min file and push it to msort
            let fmin = minobj.file;
            let mf = JSON.parse(fs.readFileSync(`${__dirname}/users/Madhu/temp/${fmin}.json`));

            // write back to file with first object removed;
            if (mf.length > 0) {
                minobj = mf.shift();
                minobj.file = fmin;
                msort.push(minobj);
                fs.writeFileSync(`${__dirname}/users/${user}/temp/${minobj.file}.json`, `${JSON.stringify(mf,null,1)}`);
            }
        } while (++rec < reccount);

        // remove temp chunk files
        chunks.forEach(file => {fs.unlinkSync(`${__dirname}/users/${user}/temp/${file}.json`)});
    });
   
  }

//sortTitles('Madhu', 'file1.xml.json', 'title');
//sortTitles('Madhu', 'file1.xml.json', 'author');


const searchTitles = async (user, file, searchby, searchkey, pagenum) => {
    let titles = [];
    let pagestart = (pagenum-1) * 10;
    let pageend = pagenum * 10;
    const stream = readline.createInterface ({
        input: fs.createReadStream(`${__dirname}/users/${user}/${file}.${searchby}`, {flag: 'r', encoding: 'utf-8'}),
        crlfDelay: Infinity
    });

    console.log(pagestart,pageend)
    let ind = 0;
    for await (const line of stream) {
        const title = JSON.parse(line).title;
        if (title.search(`${searchkey}`) !== -1) {
            if (ind >= pagestart && ind < pageend) {
                titles.push(line);
            }
            if (titles.length == 10) 
                break;
            ind++;
        }
    }
    console.log(titles);

}
searchTitles('Madhu', 'file1.xml.json', 'title', 'Title 005', 1);
