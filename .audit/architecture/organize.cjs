const fs=require('fs'),path=require('path'),ts=require('typescript');
const root=process.cwd(),files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.resolve(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.tsx?$/.test(file))files.push(file)}}
walk('src');walk('tests');
const config=ts.readConfigFile('tsconfig.json',ts.sys.readFile);
const options=ts.parseJsonConfigFileContent(config.config,ts.sys,root).options;
const versions=new Map();
const host={getCompilationSettings:()=>options,getScriptFileNames:()=>files,
getScriptVersion:file=>String(versions.get(file)||0),getScriptSnapshot:file=>fs.existsSync(file)?ts.ScriptSnapshot.fromString(fs.readFileSync(file,'utf8')):undefined,
getCurrentDirectory:()=>root,getDefaultLibFileName:o=>ts.getDefaultLibFilePath(o),fileExists:ts.sys.fileExists,readFile:ts.sys.readFile,readDirectory:ts.sys.readDirectory};
const service=ts.createLanguageService(host);
const targets=files.filter(file=>/src[\\/](application|domain|infrastructure)[\\/]|src[\\/](app|state)[\\/]|tests[\\/]application[\\/]|src[\\/]features[\\/](profile|practice)[\\/]/.test(file));
function apply(file,edits){if(!edits.length)return;let source=fs.readFileSync(file,'utf8');for(const edit of edits.sort((a,b)=>b.span.start-a.span.start))source=source.slice(0,edit.span.start)+edit.newText+source.slice(edit.span.start+edit.span.length);fs.writeFileSync(file,source);versions.set(file,(versions.get(file)||0)+1)}
for(const file of targets){const changes=service.organizeImports({type:'file',fileName:file},{},{},{});for(const change of changes)apply(change.fileName,change.textChanges);apply(file,service.getFormattingEditsForDocument(file,{indentSize:2,tabSize:2,convertTabsToSpaces:true,newLineCharacter:'\n',insertSpaceAfterCommaDelimiter:true,insertSpaceAfterSemicolonInForStatements:true,insertSpaceBeforeAndAfterBinaryOperators:true,insertSpaceAfterKeywordsInControlFlowStatements:true,insertSpaceAfterFunctionKeywordForAnonymousFunctions:true,insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces:true,placeOpenBraceOnNewLineForFunctions:false,placeOpenBraceOnNewLineForControlBlocks:false}));}
console.log('Organized imports and formatting in '+targets.length+' architecture-related files.');
