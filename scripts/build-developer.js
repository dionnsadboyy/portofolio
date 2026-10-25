'use strict';
const {write}=require('./page-layout');
const {developer,renderMode,footer}=require('./modes-content.cjs');
write('developer/index.html',renderMode('developer',developer(),[['Kenalan','#intro'],['Tools','#tools'],['Karya','#teamcut'],['Indeks','#project-index'],['Sertifikat','#certificates']],footer('developer')));
console.log('Rendered Developer editorial mode.');
