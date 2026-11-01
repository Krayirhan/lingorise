require('ts-node').register({compilerOptions:{module:'CommonJS'}});
const fs=require('fs'),ts=require('typescript'),Module=require('module'),path=require('path'),crypto=require('crypto');
const filename=path.resolve('src/content/editorialQuality.ts');
const oldSource=fs.readFileSync('.audit/architecture/original/src/content/editorialQuality.ts','utf8');
const old=new Module(filename,module);old.filename=filename;old.paths=Module._nodeModulePaths(path.dirname(filename));
old._compile(ts.transpileModule(oldSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,filename);
const current=require(filename);
const {allQuestions}=require(path.resolve('src/content/questions'));
const {CALIBRATION_FIXTURES_40}=require(path.resolve('tests/fixtures/editorialAuditCalibration'));
const questions=[...allQuestions,...CALIBRATION_FIXTURES_40.map(fixture => fixture.question)];
const invoke=(fn,value)=>{ try { return { value: fn(value) }; } catch(error) { return { error: { name: error.name, message: error.message } }; } };
const encode=x=>JSON.stringify(x,(_,value)=>value instanceof Set?[...value]:value);
for(const name of ['auditIpaProvenance','auditItemDetailed','validateItemDefinitionOfDone','formatItemDeliveryForm']){
 const a=encode(questions.map(q=>invoke(old.exports[name],q))),b=encode(questions.map(q=>invoke(current[name],q)));
 if(a!==b)throw new Error(name+' changed');
 console.log(name+': equivalent for '+questions.length+' items; SHA256 '+crypto.createHash('sha256').update(a).digest('hex'));
}
for(const name of ['auditEditorialQuestions','auditCatalogueQuality']){
 const a=encode(old.exports[name](allQuestions)),b=encode(current[name](allQuestions));
 if(a!==b)throw new Error(name+' changed');
 console.log(name+': equivalent for the full catalogue; SHA256 '+crypto.createHash('sha256').update(a).digest('hex'));
}
