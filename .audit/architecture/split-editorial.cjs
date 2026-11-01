const fs=require('fs'), ts=require('typescript');
const file='src/content/editorialQuality.ts';
const program=ts.createProgram([file],{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,strict:true});
const ast=program.getSourceFile(file), checker=program.getTypeChecker();
const modules=new Map(), symbols=new Map();
const assigned={
 auditIpaProvenance:'ipa', auditItemDetailed:'itemAudit',
 auditOne:'legacy', auditEditorialQuestions:'legacy', createEditorialQuestion:'legacy',
 auditCatalogueQuality:'catalogueAudit', validateItemDefinitionOfDone:'publication',
 formatItemDeliveryForm:'delivery', CALIBRATION_FIXTURES:'fixtures',
 MANDATORY_AUDIT_FIELDS:'types',
};
const imports=[];
for(const node of ast.statements){
 if(ts.isImportDeclaration(node)){imports.push(node.getText(ast).replace('../../','../').replace('../types/content','../models/content'));continue;}
 const name=ts.isVariableStatement(node)?node.declarationList.declarations[0].name:node.name;
 if(!name)continue;
 const module=assigned[name.text]||(ts.isInterfaceDeclaration(node)||ts.isTypeAliasDeclaration(node)?'types':'shared');
 const entries=modules.get(module)||[];entries.push(node);modules.set(module,entries);
 symbols.set(checker.getSymbolAtLocation(name),{name:name.text,module});
}
fs.mkdirSync('src/domain/editorial',{recursive:true});
for(const [module,nodes]of modules){
 const dependencies=new Map();
 function visit(node){
  if(ts.isIdentifier(node)){
   const dep=symbols.get(checker.getSymbolAtLocation(node));
   if(dep&&dep.module!==module){const names=dependencies.get(dep.module)||new Set();names.add(dep.name);dependencies.set(dep.module,names);}
  }
  ts.forEachChild(node,visit);
 }
 nodes.forEach(visit);
 const links=[...dependencies].map(([mod,names])=>'import { '+[...names].join(', ')+' } from "./'+mod+'";');
 const code=nodes.map(node=>node.getText(ast).replace(/^(?!export\b)/,'export ')).join('\n\n');
 fs.writeFileSync('src/domain/editorial/'+module+'.ts',imports.join('\n')+'\n'+links.join('\n')+'\n\n'+code+'\n');
}
fs.writeFileSync(file,[...modules.keys()].filter(m=>m!=='shared').map(m=>'export * from "../domain/editorial/'+m+'";').join('\n')+'\n');
