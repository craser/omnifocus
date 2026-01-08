import { notify } from './lib/system/notify';

console.log('console has the following properties:  ');
console.log('testing');

for (var p in console) {
    console.log(`    console.${p}`);
}
