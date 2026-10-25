'use strict';
const {write}=require('./page-layout');
const {manufacturing,renderMode,footer}=require('./modes-content.cjs');
write('manufacturing/index.html',renderMode('manufacturing',manufacturing(),[['Kenalan','#profile'],['Pengalaman','#experience'],['Armature','#armature']],footer('manufacturing')));
console.log('Rendered Manufacturing editorial mode.');
