const fs = require('fs'), path = require('path'), ts = require('typescript');
const file = 'tests/testSuite.ts';
const source = fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
const matches = [...source.matchAll(/^\/\/ (\d+)\./gm)];
const end = source.lastIndexOf('console.log(`🏁 TEST SUMMARY:');
const ranges = matches.map((m,i) => ({number:Number(m[1]), start:m.index, end:matches[i+1]?.index ?? end}));
const program = ts.createProgram([file], {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, strict:true});
const ast = program.getSourceFile(file), checker=program.getTypeChecker();
// Position accounting uses the exact source used by the checker.
const raw = fs.readFileSync(file,'utf8');
const rawMatches=[...raw.matchAll(/^\/\/ (\d+)\./gm)];
const rawEnd=raw.lastIndexOf('console.log(`🏁 TEST SUMMARY:');
const rawRanges=rawMatches.map((m,i)=>({number:Number(m[1]),start:m.index,end:rawMatches[i+1]?.index??rawEnd}));
const caseFor=pos=>rawRanges.find(r=>pos>=r.start&&pos<r.end);
const depsEnd=source.indexOf('let passedCount');
let deps=source.slice(0,depsEnd).replaceAll('../src/','../../src/');
const headerAst=ts.createSourceFile('deps.ts',deps,99,true), exportNames=[];
for(const n of headerAst.statements){
  if(ts.isImportDeclaration(n)&&n.importClause){
    if(n.importClause.name)exportNames.push(n.importClause.name.text);
    const b=n.importClause.namedBindings;
    if(b)exportNames.push(...(ts.isNamespaceImport(b)?[b.name.text]:b.elements.map(e=>e.name.text)));
  }
  if(ts.isVariableStatement(n))for(const d of n.declarationList.declarations){
    if(ts.isIdentifier(d.name))exportNames.push(d.name.text);
    else for(const e of d.name.elements)exportNames.push(e.name.text);
  }
}
fs.mkdirSync('tests/support',{recursive:true});fs.mkdirSync('tests/cases',{recursive:true});fs.mkdirSync('tests/groups',{recursive:true});
fs.writeFileSync('tests/support/dependencies.ts',deps+'\nexport { '+exportNames.join(', ')+' };\n');
fs.writeFileSync('tests/support/assertions.ts',`let passedCount = 0, failedCount = 0;
export const failures: string[] = [];
export function assert(condition: boolean, name: string) {
  if (condition) { passedCount++; console.log('  ✅ PASS: '+name); }
  else { failedCount++; failures.push(name); console.error('  ❌ FAIL: '+name); }
}
export function results() { return { passedCount, failedCount }; }
`);
const globalDecls=new Map();
for(const n of ast.statements){
  if(ts.isVariableStatement(n))for(const d of n.declarationList.declarations)if(ts.isIdentifier(d.name)&&caseFor(d.getStart(ast)))globalDecls.set(checker.getSymbolAtLocation(d.name),{name:d.name.text,range:caseFor(d.getStart(ast))});
}
const groups={content:[],learning:[],gamification:[],sync:[],presentation:[]};
function group(num){
 if([1,8,9,10,11,16,54,61,62,63,64,65,66,67,68,70].includes(num))return 'content';
 if([3,4,5,19,21,28,29,30,32,37,47,55].includes(num))return 'gamification';
 if([12,13,14,15,20,25,26,40,41,42,48,53,56].includes(num))return 'sync';
 if([6,7,17,18,33,39,44,57,58,60,69].includes(num))return 'presentation';
 return 'learning';
}
for(const range of rawRanges){
  const other=new Map();
  function visit(n){
    if(ts.isIdentifier(n)){
      const entry=globalDecls.get(checker.getSymbolAtLocation(n));
      if(entry&&entry.range.number!==range.number){
        const names=other.get(entry.range.number)||new Set();names.add(entry.name);other.set(entry.range.number,names);
      }
    }
    ts.forEachChild(n,visit);
  }
  for(const n of ast.statements)if(n.getStart(ast)>=range.start&&n.getStart(ast)<range.end)visit(n);
  let code=raw.slice(range.start,range.end).replaceAll('../src/','../../src/');
  const caseAst=ts.createSourceFile('case.ts',code,99,true), edits=[];
  for(const n of caseAst.statements)if(ts.isVariableStatement(n))edits.push(n.getStart(caseAst));
  for(const offset of edits.sort((a,b)=>b-a))code=code.slice(0,offset)+'export '+code.slice(offset);
  const header='import { '+exportNames.join(', ')+' } from "../support/dependencies";\nimport { assert } from "../support/assertions";\n';
  const cross=[...other].map(([num,names])=>'import { '+[...names].join(', ')+' } from "./case'+num+'";').join('\n');
  fs.writeFileSync('tests/cases/case'+range.number+'.ts',header+cross+'\n'+code);
  groups[group(range.number)].push(range.number);
}
for(const [name,nums]of Object.entries(groups))fs.writeFileSync('tests/groups/'+name+'.ts',nums.map(num=>'import "../cases/case'+num+'";').join('\n')+'\n');
fs.writeFileSync(file,`import "./groups/content";
import "./groups/learning";
import "./groups/gamification";
import "./groups/sync";
import "./groups/presentation";
import { results } from "./support/assertions";
const { passedCount, failedCount } = results();
console.log('🏁 TEST SUMMARY: '+passedCount+' PASSED, '+failedCount+' FAILED');
process.exitCode = failedCount > 0 ? 1 : 0;
`);
