'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {page, write} = require('./page-layout');
const {renderProjects,renderArchive} = require('./bw-projects.cjs');
const sections = ['01-cover','02-intro','03-worlds','04-work','05-journey','06-learning','07-contact'];
const footerFile=path.join(__dirname,'both-worlds/footer.html');
const footerMarkup=fs.existsSync(footerFile)?fs.readFileSync(footerFile,'utf8'):'';
const content = sections.map(name => {
  const file=path.join(__dirname,'both-worlds',name+'.html');
  return fs.existsSync(file) ? fs.readFileSync(file,'utf8').replace('{{project-spreads}}',renderProjects()).replace('{{archive}}',renderArchive()) : '';
}).join('\n');
write('index.html', page({active:'both',title:'Dion Pratama Syahputra — Both Worlds',description:'Manufaktur & karya digital. Portfolio Dion Pratama Syahputra: dua sisi, satu cerita.',links:[['Kenalan','#intro'],['Dua sisi','#perspectives'],['Karya','#work'],['Perjalanan','#about'],['Arsip belajar','#learning']],content,assistantEnabled:true,footerMarkup,headExtra:'<link rel="preload" as="image" href="/assets/both-worlds/cover.webp" fetchpriority="high"><link rel="stylesheet" href="/both-worlds.css"><script src="/both-worlds.js" defer></script>'}));
console.log('Rendered Both Worlds from scripts/both-worlds/.');
