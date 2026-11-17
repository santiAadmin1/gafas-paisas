import assert from 'node:assert/strict';
import { imageAnchors } from '../src/lib/imageAnchors.ts';
import sharp from 'sharp';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const pixels=new Uint8ClampedArray(100*50*4);
for(let y=10;y<30;y++)for(let x=15;x<85;x++)pixels[(y*100+x)*4+3]=255;
assert.deepEqual(imageAnchors(pixels,100,50),{left:.15,right:.85,top:.2,bottom:.6,leftY:.4,rightY:.4});
assert.deepEqual(imageAnchors(new Uint8ClampedArray(16),2,2),{left:0,right:1,top:0,bottom:1,leftY:.34,rightY:.34});
const dir=fileURLToPath(new URL('../public/catalogo/listas/',import.meta.url));
let count=0;
for(const file of readdirSync(dir).filter(f=>/^GP-\d{3}_(frontal|pata)\.png$/.test(f))){
  const {data,info}=await sharp(dir+file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let visible=0,transparent=0;
  for(let i=3;i<data.length;i+=4){if(data[i]>=128)visible++;if(data[i]<=8)transparent++;}
  assert(info.width>=1200,file+' resolution');
  assert(visible>0&&transparent>info.width*info.height*.01,file+' transparency or empty image');
  const a=imageAnchors(new Uint8ClampedArray(data),info.width,info.height);
  assert(a.right>a.left&&a.bottom>a.top,file);
  assert(a.leftY>=a.top&&a.leftY<=a.bottom,file+' left hinge');
  assert(a.rightY>=a.top&&a.rightY<=a.bottom,file+' right hinge');
  count++;
}
console.log(`Anclajes: casos sintéticos y ${count} imágenes correctos.`);
