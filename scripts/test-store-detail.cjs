// Pure-model checks: no network, source-data writes, or production verification promotion.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (m,f) => m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'), {
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true},
}).outputText,f);
const {getAllStoreIdEntries}=require('../app/storeIds.ts');
const {ordinaryRate,groupCandidates,candidateSignature}=require('../app/design/store-detail/model.ts');
const {isVerifiedForDay,getVerification}=require('../app/design/store-detail/verification.ts');
const {getJstDate}=require('../app/utils.ts');
const entries=getAllStoreIdEntries();
let candidates=0,benefits=0,normal=0;
for(const {storeId,store} of entries){
 const before=JSON.stringify(store),g=groupCandidates(store.候補,store.店舗);
 const all=[...g.groups.flatMap(x=>x.candidates),...g.conditional,...g.discounts,...g.days];
 assert.equal(all.length,store.候補.length,storeId);assert.equal(new Set(all).size,all.length,storeId);
 for(const c of store.候補)assert.ok(all.includes(c));
 let rank=1;for(const x of g.groups){assert.equal(x.rank,rank);rank+=x.candidates.length;for(const c of x.candidates){assert.equal(ordinaryRate(c,store.店舗),x.rate);assert.ok(!c.特定日限定&&!c.対象日条件);}}
 for(const c of g.days){benefits++;assert.equal(isVerifiedForDay(storeId,c,getVerification(storeId,c.カード),getJstDate(new Date('2026-11-20T03:00:00Z'))),false,'Current records must never promote an unverified benefit');}
 assert.equal(JSON.stringify(store),before);candidates+=all.length;normal+=g.groups.reduce((n,x)=>n+x.candidates.length,0);
}
const aeon=entries.find(e=>e.storeId==='aeon').store;
const recruit=aeon.候補.find(c=>c.カード==='リクルートカード');
assert.equal(ordinaryRate(recruit,'イオン'),1.2);
for(const delta of [{条件:recruit.条件+'。エントリーが必要'},{注意:'年間100万円以上の利用が必要'},{還元率:'最大1.2%'},{還元率:'7%'},{対象日条件:'毎月20日'},{特定日限定:true},{カード:'別のカード'}])assert.equal(ordinaryRate({...recruit,...delta},'イオン'),null);
for(const {store} of entries)for(const c of store.候補)if(c.注意.includes('提示分と合算')||c.カード==='三菱UFJカード'||c.カード==='JCBカードW')assert.equal(ordinaryRate(c,store.店舗),null);
const y=entries.find(e=>e.storeId==='yodobashi-camera').store;assert.ok(groupCandidates(y.候補,y.店舗).groups[0].candidates.length>1);
const c=aeon.候補.find(c=>c.特定日限定),date=getJstDate(new Date('2026-11-19T15:00:00Z'));
assert.deepEqual([date.year,date.month,date.day],[2026,11,20]);
// Synthetic approval used only to exercise the B branch; never saved into app data.
const record={...getVerification('aeon',c.カード),status:'verified',verifiedAt:'2026-11-19T10:00:00+09:00',displayApproval:{candidateSignature:candidateSignature(c),storeIds:['aeon'],validFrom:'2026-11-01',validThrough:'2026-11-30',reviewBy:'2026-11-25',scopeConfirmed:true}};
assert.equal(isVerifiedForDay('aeon',c,record,date),true);
assert.equal(isVerifiedForDay('aeon',c,record,getJstDate(new Date('2026-11-19T14:59:59Z'))),false);
for(const status of ['partial','unverified','possible-change'])assert.equal(isVerifiedForDay('aeon',c,{...record,status},date),false);
for(const delta of [{validThrough:'2026-11-19'},{reviewBy:'2026-11-19'},{storeIds:['lawson']},{candidateSignature:'changed'},{scopeConfirmed:false},{validThrough:'2026-02-31'}])assert.equal(isVerifiedForDay('aeon',c,{...record,displayApproval:{...record.displayApproval,...delta}},date),false);
assert.equal(isVerifiedForDay('aeon',{...c,注意:c.注意+'変更'},record,date),false);
assert.equal(isVerifiedForDay('aeon',c,{...record,verifiedAt:null},date),false);
assert.equal(isVerifiedForDay('aeon',c,{...record,verifiedAt:'2026-11-21T00:00:00+09:00'},date),false);
assert.equal(isVerifiedForDay('aeon',c,{...record,displayApproval:undefined},date),false);
for(const file of fs.readdirSync('app/design/store-detail').filter(f=>/\.(tsx?|css)$/.test(f)))assert.ok(!/from\s+['"][^'"]*preview\//.test(fs.readFileSync('app/design/store-detail/'+file,'utf8')));
console.log(JSON.stringify({stores:entries.length,candidates,benefits,ordinaryCandidates:normal,result:'passed',note:'No real benefit marked verified; date-gate tests use an in-memory fixture.'}));
