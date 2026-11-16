const fs=require('fs'),path=require('path');
const root=__dirname,out=path.join(root,'round-2');fs.mkdirSync(out,{recursive:true});
const variants=[
 {id:'ink-oxide',name:'Ink + Oxide',canvas:'#EEF1F5',ink:'#202938',muted:'#536071',primary:'#A43F20',hover:'#87341B',pressed:'#6D2916',rail:'#242D3C',railHover:'#354155',railText:'#F1F4F8',railMuted:'#C4CDDA',selection:'#F2E7E2',focus:'#A43F20'},
 {id:'plum',name:'Aubergine + Porcelain',canvas:'#F0F1F5',ink:'#282535',muted:'#605A6B',primary:'#674477',hover:'#543660',pressed:'#422B4C',rail:'#302A3D',railHover:'#443A53',railText:'#F5F1F8',railMuted:'#D0C5D9',selection:'#EDE7F0',focus:'#674477'},
 {id:'sapphire',name:'Light Slate + Sapphire',canvas:'#EEF1F6',ink:'#222C3D',muted:'#536175',primary:'#2854A6',hover:'#214586',pressed:'#1B386D',rail:'#F8FAFC',railHover:'#E8EDF5',railText:'#24334A',railMuted:'#526277',selection:'#E6EDF9',focus:'#2854A6',light:true}
];
const base=fs.readFileSync(path.join(root,'proposed.css'),'utf8');
for(const v of variants){let css=base;const replace={'#F2F5F7':v.canvas,'#18232D':v.ink,'#52616E':v.muted,'#185766':v.primary,'#164A56':v.hover,'#123B45':v.pressed,'#183D48':v.rail,'#244E5B':v.railHover,'#E7F0F2':v.railText,'#B5CDD3':v.railMuted,'#E6F0F2':v.selection,'#23677A':v.focus,'#C7DFE5':v.selection};css=css.replace(/#[0-9a-f]{6}/gi,m=>replace[m.toUpperCase()]||m);
 css+=`\n/* Direction-specific role correction. DOM preview only. */
 .erp-shell.erp-shell,.erp-shell .erp-parity,.erp-dialog.erp-dialog,.erp-interface.erp-interface{--erp-canvas:${v.canvas};--erp-paper:#fff;--erp-line:#D6DDE6;--erp-ink:${v.ink};--erp-muted:${v.muted};--action-primary:${v.primary};--action-hover:${v.hover};--action-pressed:${v.pressed};color:${v.ink}}
 .erp-shell :is(.page-title,h1,h2,h3,.kpi),.erp-interface :is(h1,h2,h3){color:${v.ink}}
 .erp-shell :is(.page-subtitle,.kpi-label,.kpi-note){color:${v.muted}}
 .erp-shell .erp-sidebar{border-color:${v.light?'#D6DDE6':'#536178'}}
 .erp-shell .erp-sidebar input[class]{background:${v.railHover};border-color:${v.light?'#7B8C99':'#91A0B6'};color:${v.railText}}
 .erp-shell .erp-sidebar :is(button,a,input):focus-visible{outline:2px solid ${v.light?v.primary:'#FFFFFF'};outline-offset:2px}
 .erp-shell .erp-sidebar .office-school-identity>div:first-child,.erp-shell .office-sidebar-footer>span{background:#fff;color:${v.ink}}
 .erp-shell .office-nav-link.is-active,.erp-shell .office-nav-child.is-active{background:${v.light?v.selection:'#FFFFFF'};color:${v.light?v.primary:v.ink};font-weight:600}
 .erp-shell :is(.module-tabs,.erp-parity .tabs-line){background:#F7F9FC}
 .erp-shell .module-tabs :is(.is-active,[aria-selected=true]),.erp-parity .tabs-line>[aria-selected=true]{color:${v.primary}}
 .erp-shell .erp-topbar .text-brand-700,.erp-shell .text-brand-700,.erp-interface .text-brand-700{color:${v.primary}}
 .erp-shell :is(.card,.surface,.workspace-section,.summary-strip){border-color:#D6DDE6}
 .erp-shell :is(.btn-primary,.action-primary),.erp-interface :is(.btn-go,.action-primary){background:${v.primary};border-color:${v.primary};color:white}
 .erp-shell :is(.btn-primary,.action-primary):hover,.erp-interface :is(.btn-go,.action-primary):hover{background:${v.hover};border-color:${v.hover}}
 .erp-shell :is(.btn-primary,.action-primary):active,.erp-interface :is(.btn-go,.action-primary):active{background:${v.pressed};border-color:${v.pressed}}
 .erp-shell main :is(a.text-brand-700,a.text-brand-600,.link),.erp-shell .erp-topbar .text-brand-700{color:${v.ink}}
 .erp-shell main :is(a.text-brand-700,a.text-brand-600,.link):hover{text-decoration:underline;text-underline-offset:3px}
 .erp-shell .office-nav-link.is-active>svg,.erp-shell .office-nav-child.is-active>svg{color:${v.primary}}
 .erp-interface>header :is(h1,h2,.text-brand-700,.text-brand-600,.text-brand){color:${v.ink}}
 `;
 fs.writeFileSync(path.join(out,v.id+'.css'),css);
}
fs.writeFileSync(path.join(out,'directions.json'),JSON.stringify(variants,null,2));
let capture=fs.readFileSync(path.join(root,'capture.cjs'),'utf8');
capture=capture.replace("const css=fs.readFileSync(__dirname+'/proposed.css','utf8')","const direction=process.env.DIRECTION;const css=fs.readFileSync(__dirname+'/round-2/'+direction+'.css','utf8')");
capture=capture.replace("routes:['/dashboard','/students','/fees/collect?student=review-1','/students/admission','/staff/payroll','/settings/classes','/messages/detail?id=message-review']","routes:['/dashboard','/students','/fees/collect?student=review-1']");
capture=capture.replace("routes:['/erp/fees/collect/?student=review-1','/erp/students/admission/','/erp/staff/payroll/','/erp/settings/classes/']","routes:['/erp/fees/collect/?student=review-1','/erp/staff/payroll/']");
capture=capture.replace("id=mode+'-'","id=direction+'-'+mode+'-'");
capture=capture.replace("file='screens/'+id+'.png'","file='round-2/screens/'+id+'.png'");
capture=capture.replace("__dirname+'/screens'","__dirname+'/round-2/screens'");
capture=capture.replace("'/rendered-'+(process.env.COLOUR_MODE||'all')","'/round-2/rendered-'+direction+'-'+(process.env.COLOUR_MODE||'all')");
fs.writeFileSync(path.join(root,'capture-round-two.cjs'),capture);
console.log('Prepared three distinct directions; application styles untouched.');
