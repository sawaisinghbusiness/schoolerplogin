const {respond:base,fixtures}=require('../../tests/fixtures/parity.cjs');
const {students}=require('../../tests/fixtures/redesign.cjs');
const clone=x=>JSON.parse(JSON.stringify(x));
const exam=fixtures['/api/exams'].data[0];
fixtures['/api/exams/exam-review/report']={exam,classSec:'6th - A',subjects:['Maths'],cards:students.slice(0,4).map((s,i)=>({studentId:s.id,name:s.name,rollNo:s.rollNo,srNo:s.srNo,fatherName:s.fatherName,motherName:'Review Guardian',dob:s.dob||'2014-01-01',subjects:[{subject:'Maths',marks:{written:60,internal:16},absent:false,total:76,grade:'B1',passed:true,entered:true}],grand:76,outOf:100,percent:76,grade:'B1',result:'Passed',complete:true,attendance:{present:110,days:120},rank:i+1}))};
fixtures['/api/fees/position/review-1']={asOf:'2026-11-15',config:fixtures['/api/fee-setup'].config,input:{cls:'6th',bus:true,newAdmission:false,concession:null},ledger:{total:48000,net:48000,paid:16000,balance:32000,discount:0,finePaid:0},fineSupported:true};
fixtures['/api/messages/message-review']={message:fixtures['/api/messages'].data[0],recipients:students.slice(0,4).map((s,i)=>({id:'recipient-'+i,student_name:s.name,class_sec:s.classSec,parent_name:s.fatherName,phone:'',text:'Review message for '+s.name,status:i===0?'sent':'pending',sent_at:i===0?'2026-11-15T08:00:00Z':null,sent_by_name:i===0?'Review Operator':null}))};
fixtures['/api/transport/live']={date:'2026-11-15',asOf:new Date().toISOString(),routes:fixtures['/api/transport'].routes.map((r,i)=>({routeId:r.id,routeName:r.name,vehicleNo:r.vehicle_no,driverName:r.driver_name,driverPhone:'',students:r.students,stopsTotal:r.stops.length,trip:i?null:{id:'trip-review',kind:'morning',state:'running',startedAt:new Date().toISOString(),endedAt:null,nextStop:'Station Road',stopsDone:1,childrenMarked:4,locationStatus:'fresh',at:new Date().toISOString(),position:{lat:25.74,lng:71.39},delay:null}}))};
function respond(method,url,raw,role){
 if(method==='GET'&&['/api/attendance/day','/api/attendance/section','/api/staff-attendance/day'].includes(url.pathname)){
  const answer=base(method,url,raw,role);answer.payload=clone(answer.payload);answer.payload.date=url.searchParams.get('date')||'2026-11-15';return answer;
 }
 return base(method,url,raw,role);
}
module.exports={respond,fixtures};
