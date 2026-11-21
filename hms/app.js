// 🔥 FIREBASE - හැම එකම හැමෝටම පෙන්නන්න
let db = null;
try{
  const firebaseConfig = {
    apiKey: "AIzaSyCXo7kzir_Djpw6ssClEeiNhVlVrhO57dM",
    authDomain: "city-care-hospital-aff77.firebaseapp.com",
    projectId: "city-care-hospital-aff77",
    storageBucket: "city-care-hospital-aff77.firebasestorage.app",
    messagingSenderId: "848549671134",
    appId: "1:848549671134:web:bde28b0b9bc21ef918124f",
    measurementId: "G-Q8363VEPDH"
  };
  if(!firebase.apps.length){ firebase.initializeApp(firebaseConfig); }
  db = firebase.firestore();
}catch(e){ console.log("Firebase OFF", e); }

// හැම Collection එකක්ම Cloud එකට Save කරන්න
async function saveToCloud(){
  if(!db) return;
  try{
    let allData = {
      patients: patients, doctors: doctors, appointments: appointments,
      labs: labs, meds: meds, bills: bills, donors: donors, emr: emrList, staff: staffList
    };
    for(let key in allData){
      let list = allData[key] || [];
      for(let item of list){
        let docId = item.id || item.inv || item.phone || item.name;
        if(!docId) continue;
        await db.collection(key).doc(String(docId)).set({...item, savedAt: Date.now()});
      }
    }
    console.log("✅ All Saved to Cloud!");
  }catch(e){ console.log("Cloud Save Fail", e); }
}

// හැම Collection එකක්ම Cloud එකෙන් ගන්න
async function loadFromCloud(){
  if(!db) return;
  try{
    let map = {patients:'patients', doctors:'doctors', appointments:'appointments', labs:'labs', meds:'meds', bills:'bills', donors:'donors', emr:'emr', staff:'staff'};
    for(let cloudKey in map){
      let localKey = map[cloudKey];
      let snap = await db.collection(cloudKey).orderBy('savedAt','desc').limit(100).get();
      let arr = [];
      snap.forEach(doc => { let d = doc.data(); if(d) arr.push(d); });
      if(arr.length > 0){
        localStorage.setItem('hms_v4_' + localKey, JSON.stringify(arr));
        // Variable එකටත් දාන්න
        if(localKey==='patients') patients = arr;
        if(localKey==='doctors') doctors = arr;
        if(localKey==='appointments') appointments = arr;
        if(localKey==='labs') labs = arr;
        if(localKey==='meds') meds = arr;
        if(localKey==='bills') bills = arr;
        if(localKey==='donors') donors = arr;
        if(localKey==='emr') emrList = arr;
        if(localKey==='staff') staffList = arr;
      }
    }
    renderPatients(); renderDoctors(); renderAppointments(); renderLabs(); renderMeds(); renderBills(); renderDonors(); renderEMR(); renderStaff(); updateDashboard();
    console.log("✅ All Loaded from Cloud!");
  }catch(e){ console.log("Load Fail", e); }
}
setTimeout(loadFromCloud, 1000);

// Live Sync - කවුරු හරි අලුත් දෙයක් දැම්මොත් හැමෝටම පෙන්නන්න
if(db){
  ['patients','doctors','appointments','donors','labs','meds','bills','emr','staff'].forEach(col => {
    db.collection(col).onSnapshot(snap => {
      let cloud = [];
      snap.forEach(doc => { let d = doc.data(); if(d) cloud.push(d); });
      if(cloud.length === 0) return;
      // Duplicate අයින් කරලා Merge කරන්න
      let current = col==='patients'?patients : col==='doctors'?doctors : col==='appointments'?appointments : col==='donors'?donors : col==='labs'?labs : col==='meds'?meds : col==='bills'?bills : col==='emr'?emrList : staffList;
      let merged = [...current];
      cloud.forEach(c => {
        let cid = c.id || c.inv || c.phone || c.name;
        let exists = merged.find(p => (p.id||p.inv||p.phone||p.name) === cid);
        if(!exists) merged.push(c);
        else Object.assign(exists, c); // තියෙන එක Update කරන්න
      });
      localStorage.setItem('hms_v4_' + col, JSON.stringify(merged));
      if(col==='patients') patients = merged;
      if(col==='doctors') doctors = merged;
      if(col==='appointments') appointments = merged;
      if(col==='donors') donors = merged;
      if(col==='labs') labs = merged;
      if(col==='meds') meds = merged;
      if(col==='bills') bills = merged;
      if(col==='emr') emrList = merged;
      if(col==='staff') staffList = merged;
      try{ renderPatients(); renderDoctors(); renderAppointments(); renderDonors(); renderLabs(); renderMeds(); renderBills(); renderEMR(); renderStaff(); updateDashboard(); }catch(e){}
    });
  });
}
const DB_KEY='hms_v4_';const $=id=>document.getElementById(id);
const load=(k,def)=>{try{const v=localStorage.getItem(DB_KEY+k);return v?JSON.parse(v):JSON.parse(JSON.stringify(def))}catch(e){return JSON.parse(JSON.stringify(def))}};
const save=(k,v)=>{localStorage.setItem(DB_KEY+k,JSON.stringify(v)); if(k==='patients'){saveToCloud();}};
function saveAll(){save('patients',patients);save('doctors',doctors);save('appointments',appointments);save('labs',labs);save('meds',meds);save('bills',bills);save('donors',donors);save('emr',emrList);save('staff',staffList);save('audit',auditLog);save('counters',{patCount,appCount,invCount});if($('lastUpdated'))$('lastUpdated').innerText=new Date().toLocaleTimeString(); if(patients.length>0) saveToCloud('patients_backup', { total: patients.length, lastPatient: patients[0] });}
function showToast(m){let t=$('toast');t.innerText=m;t.style.display='block';setTimeout(()=>t.style.display='none',3800)}
function scrollToId(id){$(id)?.scrollIntoView({behavior:'smooth',block:'start'})}
function showError(id,show,inputId){let e=$(id);if(e)e.style.display=show?'block':'none';if(inputId)$(inputId)?.classList.toggle('input-invalid',show)}
function isValidPhone(p){return /^[0-9]{10}$/.test(p.replace(/\s/g,''))}
function isValidName(n){return n&&n.trim().length>=3}
function esc(s){return String(s??'').replace(/</g,'&lt;')}
let patients=load('patients',[{id:'P-1001',name:'Sunil Perera',age:45,gender:'Male',phone:'0771234567',blood:'O+',disease:'Diabetes',ward:'Outpatient - OPD',doc:'Blood Report.pdf',createdAt:'2026-11-20'},{id:'P-1002',name:'Kumari Silva',age:32,gender:'Female',phone:'0719876543',blood:'A+',disease:'Fever',ward:'Outpatient - OPD',doc:'Prescription.pdf',createdAt:'2026-11-20'},{id:'P-1003',name:'Ruwan Fernando',age:28,gender:'Male',phone:'0765554433',blood:'B+',disease:'Fracture',ward:'Inpatient - General Ward A',doc:'X-Ray.pdf',createdAt:'2026-11-19'}]);
let doctors=load('doctors',[{id:'D-101',name:'Dr. Perera',spec:'Cardiology',exp:'15 Years',fee:3500,img:'https://i.pravatar.cc/150?img=12',avail:'Available Today',sched:'Mon-Fri 9AM-5PM',qual:'MBBS, MD',phone:'0771112222'},{id:'D-102',name:'Dr. Kamal',spec:'General Medicine',exp:'10 Years',fee:2000,img:'https://i.pravatar.cc/150?img=33',avail:'Available Today',sched:'Mon-Sat 8AM-4PM',qual:'MBBS',phone:'0773334444'},{id:'D-103',name:'Dr. Nimali',spec:'Pediatrics',exp:'8 Years',fee:2500,img:'https://i.pravatar.cc/150?img=47',avail:'Available Tomorrow',sched:'Tue-Sat 9AM-3PM',qual:'MBBS, DCH',phone:'0775556666'},{id:'D-104',name:'Dr. Silva',spec:'Orthopedic',exp:'12 Years',fee:3000,img:'https://i.pravatar.cc/150?img=53',avail:'Available Today',sched:'Mon-Fri 10AM-6PM',qual:'MBBS, MS',phone:'0777778888'}]);
let appointments=load('appointments',[]);let labs=load('labs',[]);
let meds=load('meds',[{name:'Panadol 500mg',price:50,stock:12,expiry:'2027-05-01',batch:'B-001'},{name:'Amoxicillin 500mg',price:350,stock:200,expiry:'2026-12-01',batch:'B-002'},{name:'Vitamin C 1000mg',price:450,stock:300,expiry:'2027-01-01',batch:'B-003'}]);
let bills=load('bills',[]);let emrList=load('emr',[]);
let staffList=load('staff',[{name:'Nimali Silva',role:'Receptionist',dept:'OPD',phone:'0711112222',attend:'Present'},{name:'Kamal Fernando',role:'Laboratory Staff',dept:'Laboratory',phone:'0713334444',attend:'Present'},{name:'Sunil Perera',role:'Pharmacist',dept:'Pharmacy',phone:'0715556666',attend:'Present'}]);
let donors=load('donors',[{name:'Sunil Perera',phone:'0771234567',blood:'O+',city:'Colombo',age:32,last:'2 months ago'},{name:'Kumari Silva',phone:'0719876543',blood:'A+',city:'Kandy',age:28,last:'1 month ago'},{name:'Ruwan Fernando',phone:'0765554433',blood:'B+',city:'Galle',age:35,last:'3 months ago'},{name:'Nimali Perera',phone:'0777778888',blood:'O-',city:'Colombo',age:29,last:'4 months ago'},{name:'Kasun Jayasinghe',phone:'0712223344',blood:'AB+',city:'Negombo',age:31,last:'2 months ago'},{name:'Dilini Fernando',phone:'0774445555',blood:'A-',city:'Kandy',age:26,last:'5 months ago'},{name:'Chamara Silva',phone:'0761112222',blood:'B-',city:'Colombo',age:34,last:'1 month ago'},{name:'Tharushi Perera',phone:'0719998888',blood:'AB-',city:'Galle',age:27,last:'6 months ago'},{name:'Nuwan Bandara',phone:'0773332222',blood:'O+',city:'Kurunegala',age:30,last:'2 months ago'},{name:'Sanduni Rathnayake',phone:'0715556666',blood:'A+',city:'Colombo',age:24,last:'1 month ago'}]);
let auditLog=load('audit',[{action:'System Started',user:'System',time:new Date().toLocaleString()}]);
let counters=load('counters',{patCount:1004,appCount:5001,invCount:9001,docCount:105});let patCount=counters.patCount,appCount=counters.appCount,invCount=counters.invCount,docCount=counters.docCount;let currentBloodFilter='All',currentDeptFilter='All',currentUser=null,lastActivity=Date.now(),pendingDelete=null,pendingDeleteType=null,pendingDeleteId=null,editTarget=null,lastAddedDoctorId=null;
function addAudit(action){auditLog.unshift({action,user:currentUser||'Guest',time:new Date().toLocaleString()});if(auditLog.length>50)auditLog=auditLog.slice(0,50);saveAll();renderAudit()}
function renderAudit(){$('auditList').innerHTML=auditLog.map(a=>`<div class="audit-item"><b>${esc(a.action)}</b> • 👤 ${esc(a.user)} • 🕒 ${esc(a.time)}</div>`).join('')}
function clearAudit(){auditLog=[];saveAll();renderAudit();showToast('Audit Log Cleared')}
setInterval(()=>{if(currentUser&&Date.now()-lastActivity>15*60*1000){alert('⏱️ Session Expired - 15 min timeout (SRS Security)');doLogout()}if(currentUser&&$('sessionInfo')){let left=Math.max(0,15-Math.floor((Date.now()-lastActivity)/60000));$('sessionInfo').innerText='⏱️ Session: '+currentUser+' • Timeout in '+left+' min'}},30000);
document.addEventListener('click',()=>lastActivity=Date.now());document.addEventListener('keydown',()=>lastActivity=Date.now());
function showLogin(){$('loginModal').style.display='flex'}function closeLogin(){$('loginModal').style.display='none'}
function doLogin(){let u=$('loginUser').value.trim(),p=$('loginPass').value.trim();let map={admin:['admin123','Administrator'],doctor1:['doc123','Doctor'],recep1:['recep123','Receptionist'],lab1:['lab123','Laboratory Staff'],pharm1:['pharm123','Pharmacist'],nurse1:['nurse123','Nurse']};if(map[u]&&map[u][0]===p){currentUser=u;localStorage.setItem(DB_KEY+'loggedUser',u);$('userInfo').innerHTML=`Welcome <b>${u}</b> (${map[u][1]}) | <a href="#" onclick="doLogout();return false" style="color:#f87171">Logout</a>`;closeLogin();showToast('✅ Welcome '+u+' - Role: '+map[u][1]);addAudit('Login - '+u+' ('+map[u][1]+')');lastActivity=Date.now()}else{alert('❌ Wrong Username / Password! Try admin / admin123');addAudit('Failed Login Attempt - '+u)}}
function doLogout(){addAudit('Logout - '+(currentUser||'Guest'));currentUser=null;localStorage.removeItem(DB_KEY+'loggedUser');$('userInfo').innerHTML='👤 Guest | <a href="#" onclick="showLogin();return false">Staff Login</a>';if($('sessionInfo'))$('sessionInfo').innerText='⏱️ Session: Not Logged In';showToast('Logged Out')}
function openSuccess(title,msg,cardHtml){$('successTitle').innerText=title;$('successMsg').innerText=msg;$('successCard').innerHTML=cardHtml||'';$('successModal').style.display='flex'}
function closeSuccess(){$('successModal').style.display='none'}
function closeSuccessAndScroll(){closeSuccess();if(lastAddedDoctorId){setTimeout(()=>{let el=document.querySelector('[data-doctor-id="'+lastAddedDoctorId+'"]');if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('doctor-new');setTimeout(()=>el.classList.remove('doctor-new'),5000)}else{scrollToId('doctorList')}},200)}}
let editData=null;
function openEdit(title,fields,saveFn){$('editTitle').innerText=title;$('editFields').innerHTML=fields;editData=saveFn;$('editModal').style.display='flex'}
function closeEdit(){$('editModal').style.display='none';editData=null}
function saveEdit(){if(editData)editData();closeEdit()}
function askDelete(msg,type,id){pendingDeleteType=type;pendingDeleteId=id;$('confirmMsg').innerText=msg;$('confirmModal').style.display='flex'}
function closeConfirm(){$('confirmModal').style.display='none';pendingDeleteType=null;pendingDeleteId=null}
function confirmYes(){let t=pendingDeleteType,id=pendingDeleteId;closeConfirm();if(t==='patient')deletePatientConfirmed(id);if(t==='doctor')deleteDoctorConfirmed(id);if(t==='appointment')deleteAppointmentConfirmed(id);if(t==='donor')deleteDonorConfirmed(id);if(t==='lab')deleteLabConfirmed(id);if(t==='med')deleteMedConfirmed(id);if(t==='bill')deleteBillConfirmed(id);if(t==='emr')deleteEMRConfirmed(id);if(t==='staff')deleteStaffConfirmed(id)}
function syncDoctorDropdowns(){let opts=doctors.map(d=>`<option>${esc(d.name)} - ${esc(d.spec)}</option>`).join('');['qDoc','aDoc'].forEach(id=>{let el=$(id);if(el){let old=el.value;el.innerHTML=opts;if(old)el.value=old}})}
function renderPatients(list=patients){$('patList').innerHTML=list.map(p=>`<tr><td><b>${esc(p.id)}</b><br><span class="audit">${esc(p.createdAt||'')}</span></td><td><b>${esc(p.name)}</b></td><td>${esc(p.age)} / ${esc(p.gender)}</td><td>${esc(p.phone)}</td><td><span class="badge ${p.blood==='O-'||p.blood==='AB-'?'red':'blue'}">${esc(p.blood||'-')}</span></td><td>${esc(p.disease)}</td><td>${esc(p.ward)}</td><td style="white-space:nowrap"><button class="btn btn-outline btn-sm" onclick="editPatient('${p.id}')">✏️ Edit</button> <button class="btn btn-outline btn-sm" onclick="viewHistory('${p.id}')">📋 History</button> <button class="btn btn-danger-outline btn-sm" onclick="askDelete('Delete patient ${esc(p.name)} (${p.id})?','patient','${p.id}')">🗑️</button></td></tr>`).join('')||'<tr><td colspan="8" class="empty">No patients found - Add your first patient above</td></tr>'}
function filterPatients(){let q=$('patSearch').value.toLowerCase();renderPatients(patients.filter(p=>(p.name+p.phone+p.id+p.disease+(p.blood||'')).toLowerCase().includes(q)))}
function filterPatientsByBlood(b){if(b==='All'){renderPatients();return}renderPatients(patients.filter(p=>p.blood===b));showToast('🩸 Showing '+b+' Patients')}
function addPatient(){let name=$('pName').value.trim(),phone=$('pPhone').value.trim(),blood=$('pBlood').value;let valid=true;if(!isValidName(name)){showError('err-pName',true,'pName');valid=false}else showError('err-pName',false,'pName');if(phone&&!isValidPhone(phone)){showError('err-pPhone',true,'pPhone');valid=false}else showError('err-pPhone',false,'pPhone');if(!blood){alert('Please select Blood Group!');return}if(!valid)return;let newP={id:'P-'+(patCount++),name,age:$('pAge').value||'-',gender:$('pGender').value,phone:phone||'-',blood,disease:$('pDisease').value||'General',ward:$('pWard').value,doc:$('pDoc').value||'No Document',createdAt:new Date().toISOString().slice(0,10)};patients.unshift(newP);saveAll();renderPatients();updateDashboard();addAudit('Patient Registered: '+name+' ('+newP.id+') • Blood: '+blood);saveToCloud('patients', newP);openSuccess('✅ Patient Registered!','Patient saved successfully & Audit logged + Firebase!',`<div class="card"><b>${esc(name)}</b> • ID: ${newP.id}<br>🩸 Blood: ${blood} | 📞 ${phone}<br>🏥 ${$('pWard').value}</div>`);$('pName').value='';$('pPhone').value='';$('pDisease').value=''}
function editPatient(id){let p=patients.find(x=>x.id===id);openEdit('✏️ Edit Patient - '+p.name,`<label>Patient Name</label><input id="edit_name" value="${esc(p.name)}"><label>Disease / Diagnosis</label><input id="edit_disease" value="${esc(p.disease)}"><label>Phone</label><input id="edit_phone" value="${esc(p.phone)}" maxlength="10"><label>Ward</label><input id="edit_ward" value="${esc(p.ward)}">`,()=>{p.name=$('edit_name').value.trim()||p.name;p.disease=$('edit_disease').value||p.disease;p.phone=$('edit_phone').value||p.phone;p.ward=$('edit_ward').value||p.ward;saveAll();renderPatients();addAudit('Patient Updated: '+p.name);showToast('✅ Patient Updated & Saved')})}
function deletePatient(id){askDelete('Delete patient '+id+'?','patient',id)}
function deletePatientConfirmed(id){patients=patients.filter(x=>x.id!==id);saveAll();renderPatients();updateDashboard();addAudit('Patient Deleted: '+id);showToast('Patient Deleted & Audit Logged')}
function viewHistory(id){let p=patients.find(x=>x.id===id);$('historyBox').style.display='block';$('historyName').innerText=p.name+' ('+p.id+') - Blood: '+(p.blood||'-');$('historyContent').innerHTML=`<p><b>Diagnosis:</b> ${esc(p.disease)} | <b>Blood:</b> ${esc(p.blood)} | <b>Ward:</b> ${esc(p.ward)} | <b>Phone:</b> ${esc(p.phone)}</p><p><b>Documents:</b> ${esc(p.doc)}</p><p><b>EMR Records:</b> ${emrList.filter(e=>e.patient.toLowerCase()===p.name.toLowerCase()).map(e=>esc(e.diag)).join(', ')||'No EMR yet'}</p>`;$('historyBox').scrollIntoView({behavior:'smooth'})}
function toggleDonorForm(){let f=$('donorForm');f.style.display=f.style.display==='none'?'grid':'none'}
function renderDonors(list=donors){let filtered=currentBloodFilter==='All'?list:list.filter(d=>d.blood===currentBloodFilter);$('donorList').innerHTML=filtered.map(d=>`<div class="card blood-card"><div class="blood-avatar">${esc(d.blood)}</div><h3 style="margin-top:10px">${esc(d.name)}</h3><p style="color:#64748b;font-size:13px">📍 ${esc(d.city)} | Age ${esc(d.age)} | Last: ${esc(d.last)}</p><p>📞 ${esc(d.phone)}</p><span class="badge green">✅ Available</span><br><br><button class="btn btn-red btn-sm" onclick="contactDonor('${esc(d.name)}','${esc(d.phone)}')">📞 Contact</button> <button class="btn btn-danger-outline btn-sm" onclick="askDelete('Delete donor ${esc(d.name)}?','donor','${esc(d.phone)}')">🗑️</button></div>`).join('')||'<p>No donors found</p>';$('bloodCount').innerText=filtered.length+' Donors • '+(currentBloodFilter==='All'?'All Groups':currentBloodFilter);if($('dashDonors'))$('dashDonors').innerText=donors.length+' Donors'}
function filterBlood(group,btn){currentBloodFilter=group;document.querySelectorAll('.blood-chip').forEach(c=>c.classList.remove('active'));if(btn)btn.classList.add('active');if($('bloodFilterSelect'))$('bloodFilterSelect').value=group;renderDonors();showToast('🩸 Showing '+group+' Donors')}
function filterBloodSearch(){let q=$('bloodSearch').value.toLowerCase();let base=currentBloodFilter==='All'?donors:donors.filter(d=>d.blood===currentBloodFilter);let filtered=base.filter(d=>(d.name+d.phone+d.city+d.blood).toLowerCase().includes(q));$('donorList').innerHTML=filtered.map(d=>`<div class="card blood-card"><div class="blood-avatar">${esc(d.blood)}</div><h3>${esc(d.name)}</h3><p>📍 ${esc(d.city)} | ${esc(d.phone)}</p><span class="badge green">✅ Available</span><br><br><button class="btn btn-red btn-sm" onclick="contactDonor('${esc(d.name)}','${esc(d.phone)}')">📞 Contact</button></div>`).join('')||'<p>No donors found</p>';$('bloodCount').innerText=filtered.length+' Donors Found'}
function addDonor(){let n=$('donorName').value.trim(),ph=$('donorPhone').value.trim();if(!isValidName(n)){alert('Enter valid Donor Name');return}if(!isValidPhone(ph)){alert('Enter valid 10-digit Phone!');return}if(donors.some(d=>d.phone===ph)){alert('This phone already registered!');return}let newD={name:n,phone:ph,blood:$('donorBlood').value,city:$('donorCity').value||'Colombo',age:$('donorAge').value||'-',last:$('donorLast').value||'Just now'};donors.unshift(newD);saveAll();renderDonors();$('donorForm').style.display='none';addAudit('Donor Registered: '+n+' • Blood: '+$('donorBlood').value);saveToCloud('donors', newD);openSuccess('❤️ Thank You, '+n+'!','Donor registered & saved. You can save a life!',`<div class="card" style="text-align:center"><div class="blood-avatar">${$('donorBlood').value}</div><b>${esc(n)}</b><br>📞 ${ph} | 📍 ${$('donorCity').value||'Colombo'}</div>`);$('donorName').value='';$('donorPhone').value=''}
function deleteDonorConfirmed(phone){donors=donors.filter(d=>d.phone!==phone);saveAll();renderDonors();addAudit('Donor Deleted: '+phone);showToast('Donor Deleted')}
function contactDonor(name,phone){showToast('📞 Calling '+name);alert('📞 Contacting Donor:\nName: '+name+'\nPhone: '+phone+'\n\nSMS: Urgent Blood Needed - City Care Hospital - 011-2345678')}
function renderDoctors(list=doctors){
  let filtered=currentDeptFilter==='All'?list:list.filter(d=>d.spec===currentDeptFilter);
  $('doctorList').innerHTML=filtered.map((d,i)=>{
    return `<div class="card doc-card ${d.isNew?'doctor-new':''}" data-doctor-id="${d.id}">${d.isNew?'<span class="doc-new-badge">⭐ NEW • JUST ADDED</span>':''}<img src="${d.img}" class="doc-avatar" onerror="this.src='https://i.pravatar.cc/150?img=5'"><h3 style="margin-top:10px">${esc(d.name)}</h3><p style="color:#64748b">${esc(d.spec)} • ${esc(d.qual||'MBBS')}</p><p>Experience: <b>${esc(d.exp)}</b> | Fee: <b>Rs. ${Number(d.fee||0).toLocaleString()}</b></p><p style="font-size:12px;color:#64748b">📅 ${esc(d.sched)} | 📞 ${esc(d.phone||'-')}</p><span class="badge ${d.avail==='On Leave'?'red':'green'}">${esc(d.avail)}</span><br><br><div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap"><button class="btn btn-teal btn-sm" onclick="selectDoctor('${esc(d.name)} - ${esc(d.spec)}')">📅 Book</button><button class="btn btn-dark btn-sm" onclick="editDoctor('${d.id}')">✏️ Edit</button><button class="btn btn-danger-outline btn-sm" onclick="askDelete('Delete doctor ${esc(d.name)}?','doctor','${d.id}')">🗑️ Delete</button></div></div>`
  }).join('')||'<p style="grid-column:span 3;text-align:center;color:#94a3b8;padding:30px">No doctors in this department. Add one above!</p>';
  $('doctorCount').innerText=filtered.length+' Doctors • '+doctors.length+' Total';
  if($('dashDoctors'))$('dashDoctors').innerText=doctors.length+' Doctors';
}
function filterDoctors(){let q=$('docSearch').value.toLowerCase();currentDeptFilter='All';renderDoctors(doctors.filter(d=>(d.name+d.spec+d.sched).toLowerCase().includes(q)))}
function filterDoctorsByDept(dept){currentDeptFilter=dept;renderDoctors();showToast(dept==='All'?'Showing All Doctors':'Showing '+dept+' Doctors')}
function addDoctor(){
  let n=$('dName').value.trim();
  if(!isValidName(n)){showError('err-dName',true,'dName');return}else showError('err-dName',false,'dName');
  let fee=parseInt($('dFee').value||0);if(fee<0||fee>100000){alert('Fee must be 0 - 100,000');return}
  let phone=$('dPhone').value.trim();if(phone&&!isValidPhone(phone)){alert('Enter valid 10-digit phone or leave blank');return}
  if(doctors.some(d=>d.name.toLowerCase()===n.toLowerCase())){if(!confirm('Doctor with same name exists. Add anyway?'))return}
  let newId='D-'+(docCount++);
  let newDoc={id:newId,name:n,spec:$('dDept').value,exp:$('dExp').value||'5 Years',fee:fee||2000,img:'https://i.pravatar.cc/150?img='+(Math.floor(Math.random()*60)+1),avail:$('dAvail').value,sched:$('dSchedule').value,qual:$('dQual').value||'MBBS',phone:phone||'-',isNew:true,createdAt:new Date().toISOString().slice(0,10)};
  doctors.unshift(newDoc);
  currentDeptFilter='All';
  saveAll();renderDoctors();syncDoctorDropdowns();updateDashboard();addAudit('Doctor Added: '+n+' ('+newId+') • Dept: '+newDoc.spec+' • Fee: Rs. '+newDoc.fee);
  saveToCloud('doctors', newDoc);
  lastAddedDoctorId=newId;
  openSuccess('✅ Doctor Added Successfully!',n+' is now live. Doctor synced to Appointments dropdown & Dashboard. Click below to see in list.',`<div class="card doc-card" style="text-align:center"><img src="${newDoc.img}" class="doc-avatar"><h3>${esc(newDoc.name)}</h3><p>${esc(newDoc.spec)} • ${esc(newDoc.qual)}</p><p>Fee: <b>Rs. ${Number(newDoc.fee).toLocaleString()}</b> | ${esc(newDoc.sched)}</p><span class="badge green">${esc(newDoc.avail)}</span><br><span class="badge gold" style="margin-top:8px;display:inline-block">⭐ NEW • ID: ${newId}</span></div>`);
  $('dName').value='';$('dFee').value='';$('dExp').value='';$('dPhone').value='';$('dQual').value='';
  setTimeout(()=>{newDoc.isNew=false;saveAll();renderDoctors()},6000);
}
function editDoctor(id){let d=doctors.find(x=>x.id===id);if(!d)return;openEdit('✏️ Update Doctor - '+d.name,`<label>Doctor Name</label><input id="edit_name" value="${esc(d.name)}"><label>Department</label><select id="edit_spec"><option ${d.spec==='Cardiology'?'selected':''}>Cardiology</option><option ${d.spec==='General Medicine'?'selected':''}>General Medicine</option><option ${d.spec==='Pediatrics'?'selected':''}>Pediatrics</option><option ${d.spec==='Orthopedic'?'selected':''}>Orthopedic</option><option ${d.spec==='Neurology'?'selected':''}>Neurology</option><option ${d.spec==='Dermatology'?'selected':''}>Dermatology</option><option ${d.spec==='Surgery'?'selected':''}>Surgery</option></select><label>Fee (Rs.)</label><input id="edit_fee" type="number" value="${d.fee}"><label>Schedule</label><input id="edit_sched" value="${esc(d.sched)}"><label>Availability</label><select id="edit_avail"><option ${d.avail==='Available Today'?'selected':''}>Available Today</option><option ${d.avail==='Available Tomorrow'?'selected':''}>Available Tomorrow</option><option ${d.avail==='On Leave'?'selected':''}>On Leave</option></select>`,()=>{d.name=$('edit_name').value.trim()||d.name;d.spec=$('edit_spec').value;d.fee=parseInt($('edit_fee').value||d.fee);d.sched=$('edit_sched').value||d.sched;d.avail=$('edit_avail').value;saveAll();renderDoctors();syncDoctorDropdowns();addAudit('Doctor Updated: '+d.name);showToast('✅ Doctor Updated & Saved')})}
function deleteDoctor(id){askDelete('Delete doctor '+id+'? This will also remove from Appointments dropdown.','doctor',id)}
function deleteDoctorConfirmed(id){let d=doctors.find(x=>x.id===id);doctors=doctors.filter(x=>x.id!==id);saveAll();renderDoctors();syncDoctorDropdowns();updateDashboard();addAudit('Doctor Deleted: '+(d?d.name:id));showToast('Doctor Deleted & Audit Logged')}
function selectDoctor(v){$('aDoc').value=v;scrollToId('appointments');showToast(v+' Selected - Book Appointment below')}
function renderAppointments(){if(!appointments.length){$('appList').innerHTML='<tr><td colspan="7" class="empty">No appointments yet - Book your first appointment above</td></tr>';return}$('appList').innerHTML=appointments.map(a=>`<tr><td><b>${esc(a.id)}</b></td><td><b>${esc(a.name)}</b></td><td>${esc(a.doc)}</td><td>${esc(a.type)}</td><td>${esc(a.date)} / ${esc(a.time)}</td><td><span class="badge ${a.status==='Confirmed'?'green':a.status==='Cancelled'?'red':a.status==='Completed'?'blue':'yellow'}">${esc(a.status)}</span></td><td style="white-space:nowrap"><button class="btn btn-outline btn-sm" onclick="rescheduleApp('${a.id}')">🔄 Reschedule</button> <button class="btn btn-outline btn-sm" onclick="cancelApp('${a.id}')">❌ Cancel</button> <button class="btn btn-danger-outline btn-sm" onclick="askDelete('Delete appointment ${a.id}?','appointment','${a.id}')">🗑️</button></td></tr>`).join('')}
function bookAppointment(){let n=$('aName').value.trim();if(!isValidName(n)){alert('Enter Patient Name');return}let id='B-'+(appCount++);let newA={id,name:n,doc:$('aDoc').value,type:$('aType').value,date:$('aDate').value||'Today',time:$('aTime').value,status:$('aStatus').value,note:$('aNote').value};appointments.unshift(newA);saveAll();renderAppointments();updateDashboard();addAudit('Appointment Booked: '+id+' • '+n+' • '+$('aDoc').value);saveToCloud('appointments', newA);openSuccess('✅ Appointment Booked!','Appointment saved & Audit logged.',`<div class="card"><b>${esc(n)}</b> • ID: ${id}<br>👨‍⚕️ ${esc($('aDoc').value)}<br>📅 ${$('aDate').value||'Today'} / ${$('aTime').value}<br>Status: ${$('aStatus').value}</div>`);$('aName').value=''}
function quickBook(){let n=$('qName').value.trim(),ph=$('qPhone').value.trim();let valid=true;if(!isValidName(n)){showError('err-qName',true,'qName');valid=false}else showError('err-qName',false,'qName');if(!isValidPhone(ph)){showError('err-qPhone',true,'qPhone');valid=false}else showError('err-qPhone',false,'qPhone');if(!valid)return;let id='B-'+(appCount++);let newA={id,name:n,doc:$('qDoc').value,type:'Outpatient - OPD',date:$('qDate').value||'Today',time:'09:00 AM',status:'Confirmed'};appointments.unshift(newA);saveAll();renderAppointments();updateDashboard();addAudit('Quick Appointment: '+id+' • '+n);saveToCloud('appointments', newA);$('qMsg').innerText='✅ Booked & Saved! ID: '+id+' • SMS sent to '+ph;showToast('✅ Appointment Booked & Saved: '+id)}
function cancelApp(id){let a=appointments.find(x=>x.id===id);if(!a)return;a.status='Cancelled';saveAll();renderAppointments();addAudit('Appointment Cancelled: '+id);showToast('Cancelled & Saved')}
function rescheduleApp(id){let a=appointments.find(x=>x.id===id);if(!a)return;openEdit('🔄 Reschedule - '+id,`<label>New Date</label><input type="date" id="edit_date" value="2026-11-25"><label>New Time</label><select id="edit_time"><option>09:00 AM</option><option>11:00 AM</option><option>03:00 PM</option><option>05:00 PM</option></select>`,()=>{a.date=$('edit_date').value||a.date;a.time=$('edit_time').value;a.status='Rescheduled';saveAll();renderAppointments();addAudit('Appointment Rescheduled: '+id+' to '+a.date);showToast('✅ Rescheduled & Saved')})}
function deleteAppointment(id){askDelete('Delete appointment '+id+'?','appointment',id)}
function deleteAppointmentConfirmed(id){appointments=appointments.filter(x=>x.id!==id);saveAll();renderAppointments();updateDashboard();addAudit('Appointment Deleted: '+id);showToast('Deleted & Saved')}
function renderEMR(){$('emrList').innerHTML=emrList.map((e,i)=>`<tr><td><b>${esc(e.patient)}</b></td><td>${esc(e.doctor)}</td><td>${esc(e.diag)}</td><td>${esc(e.pres)}</td><td>${esc(e.treat)}</td><td>${esc(e.date)}</td><td><button class="btn btn-danger-outline btn-sm" onclick="askDelete('Delete EMR for ${esc(e.patient)}?','emr',${i})">🗑️</button></td></tr>`).join('')||'<tr><td colspan="7" class="empty">No medical records yet</td></tr>'}
function addEMR(){let p=$('ePatient').value.trim();if(!p){alert('Enter Patient Name');return}let newE={patient:p,doctor:$('eDoctor').value||'-',diag:$('eDiag').value||'General',pres:$('ePres').value||'-',treat:$('eTreat').value||'-',date:new Date().toISOString().slice(0,10)};emrList.unshift(newE);saveAll();renderEMR();addAudit('EMR Saved: '+p+' • '+$('eDiag').value);saveToCloud('emr', newE);showToast('✅ Medical Record Saved')}
function deleteEMRConfirmed(i){emrList.splice(i,1);saveAll();renderEMR();showToast('EMR Deleted')}
function renderLabs(){$('labList').innerHTML=labs.map((l,i)=>`<tr><td>${esc(l.p)}</td><td>${esc(l.test)}</td><td>${esc(l.sample)}</td><td>${esc(l.result)}</td><td><button class="btn btn-outline btn-sm" onclick="showToast('📄 Report Generated for ${esc(l.p)}')">📄 Generate Report</button></td><td><button class="btn btn-danger-outline btn-sm" onclick="askDelete('Delete lab test for ${esc(l.p)}?','lab',${i})">🗑️</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty">No lab tests yet</td></tr>'}
function addLab(){let p=$('lPatient').value.trim();if(!p){alert('Enter Patient');return}let newL={p,test:$('lTest').value,sample:$('lSample').value,result:$('lResult').value||'Pending'};labs.unshift(newL);saveAll();renderLabs();updateDashboard();addAudit('Lab Test Added: '+p+' • '+$('lTest').value);saveToCloud('lab', newL);showToast('✅ Lab Test Added & Saved')}
function deleteLabConfirmed(i){labs.splice(i,1);saveAll();renderLabs();showToast('Lab Deleted')}
function renderMeds(list=meds){$('medList').innerHTML=list.map(m=>{let isLow=m.stock<20;let isExp=m.expiry&&new Date(m.expiry)<new Date();return `<div class="card"><h3>${esc(m.name)}</h3><p>Batch: ${esc(m.batch)} | Expiry: ${esc(m.expiry)} ${isExp?'⚠️ EXPIRED':''}</p><b>Rs. ${esc(m.price)}</b><p>Stock: ${esc(m.stock)} ${isLow?'⚠️ LOW STOCK':''}</p><span class="badge ${isLow?'red':isExp?'red':'green'}">${isExp?'EXPIRED':isLow?'LOW STOCK':'IN STOCK'}</span><br><br><button class="btn btn-teal btn-sm" onclick="showToast('💊 Prescription Processed: ${esc(m.name)}')">Process Prescription</button> <button class="btn btn-danger-outline btn-sm" onclick="askDelete('Delete ${esc(m.name)}?','med','${esc(m.name)}')">🗑️</button></div>`}).join('')}
function filterMeds(){let q=$('medSearch').value.toLowerCase();renderMeds(meds.filter(m=>m.name.toLowerCase().includes(q)))}
function addMedicine(){let n=$('mName').value.trim();if(!n){alert('Enter Medicine');return}let stock=parseInt($('mStock').value||0);if(stock<0){alert('Stock cannot be negative');return}let newM={name:n,price:$('mPrice').value,stock:stock,expiry:$('mExpiry').value,batch:$('mBatch').value};meds.unshift(newM);saveAll();renderMeds();updateDashboard();addAudit('Medicine Added: '+n+' • Stock: '+stock);saveToCloud('pharmacy', newM);showToast('✅ Medicine Added & Saved')}
function deleteMedConfirmed(name){meds=meds.filter(m=>m.name!==name);saveAll();renderMeds();showToast('Medicine Deleted')}
function renderBills(){$('billList').innerHTML=bills.map((b,i)=>`<tr><td>${esc(b.inv)}</td><td>${esc(b.p)}</td><td>Rs. ${b.total.toLocaleString()}</td><td>${esc(b.pay)}</td><td><span class="badge green">${esc(b.status)}</span></td><td><button class="btn btn-danger-outline btn-sm" onclick="askDelete('Delete invoice ${b.inv}?','bill',${i})">🗑️</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty">No bills yet</td></tr>'}
function calcBill(){let p=$('bPatient').value.trim()||'Patient';let consult=parseInt($('bConsult').value||0),lab=parseInt($('bLab').value||0),pharm=parseInt($('bPharm').value||0),admit=parseInt($('bAdmit').value||0),room=parseInt($('bRoom').value),days=parseInt($('bDays').value||0),disc=parseInt($('bDisc').value||0);if(disc<0||disc>100){alert('Discount must be 0-100%');return}if(consult<0||lab<0||pharm<0){alert('Amounts cannot be negative');return}let sub=consult+lab+pharm+admit+(room*days);let total=sub-(sub*disc/100);let inv='INV-'+(invCount++);let newB={inv,p,total,pay:$('bPayMethod').value,status:'Paid'};bills.unshift(newB);saveAll();renderBills();$('billResult').innerHTML=`Invoice: ${inv} | Patient: ${esc(p)}<br>Sub Total: Rs. ${sub.toLocaleString()} | Discount: ${disc}%<br><h3>Total: Rs. ${total.toLocaleString()} | ${$('bPayMethod').value} - Paid ✅ - Saved + Audit</h3>`;updateDashboard();addAudit('Invoice Generated: '+inv+' • '+p+' • Rs. '+total);saveToCloud('bills', newB);showToast('✅ Invoice Generated & Saved: '+inv)}
function deleteBillConfirmed(i){bills.splice(i,1);saveAll();renderBills();updateDashboard();showToast('Bill Deleted')}
function printBill(){window.print()}
function renderStaff(){$('staffList').innerHTML=staffList.map((s,i)=>`<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.role)}</td><td>${esc(s.dept)}</td><td>${esc(s.phone)}</td><td><span class="badge ${s.attend==='Present'?'green':s.attend==='Absent'?'red':'yellow'}">${esc(s.attend)}</span></td><td><button class="btn btn-danger-outline btn-sm" onclick="askDelete('Delete staff ${esc(s.name)}?','staff',${i})">🗑️</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty">No staff yet</td></tr>'}
function addStaff(){let n=$('sName').value.trim();if(!isValidName(n)){alert('Enter Staff Name');return}let newS={name:n,role:$('sRole').value,dept:$('sDept').value,phone:$('sPhone').value||'-',attend:$('sAttend').value};staffList.unshift(newS);saveAll();renderStaff();updateDashboard();addAudit('Staff Added: '+n+' • '+$('sRole').value);saveToCloud('staff', newS);showToast('✅ Staff Added & Saved')}
function deleteStaffConfirmed(i){staffList.splice(i,1);saveAll();renderStaff();showToast('Staff Deleted')}
function updateDashboard(){$('dashTotal').innerText=(1240+Math.max(0,patients.length-3)).toLocaleString();$('dashToday').innerText=appointments.length;$('dashTodaySub').innerText='Confirmed: '+appointments.filter(a=>a.status==='Confirmed').length+' | Pending: '+appointments.filter(a=>a.status==='Pending').length;$('dashLab').innerText=24+labs.length;$('dashLabSub').innerText='Pending: '+labs.filter(l=>l.result==='Pending').length;$('dashPharm').innerText=meds.filter(m=>m.stock<20).length+' Low Stock';let rev=485000+bills.reduce((s,b)=>s+b.total,0);$('dashRevenue').innerText='Rs. '+rev.toLocaleString();$('dashPatientSub').innerText='+'+patients.length+' Registered in System';if($('dashStaff'))$('dashStaff').innerText=staffList.length+' Staff Members'}
function genReport(type,btn){if(btn){document.querySelectorAll('#reports .tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}$('reportTitle').innerText='📄 '+type+' Report • From Saved Data';let c={Patient:`Total Patients: ${(patients.length+1237).toLocaleString()} | In System: ${patients.length} | Blood Groups: ${[...new Set(patients.map(p=>p.blood))].join(', ')}`,Appointment:`Total: ${appointments.length} | Confirmed: ${appointments.filter(a=>a.status==='Confirmed').length} | Cancelled: ${appointments.filter(a=>a.status==='Cancelled').length} | Completed: ${appointments.filter(a=>a.status==='Completed').length}`,Revenue:`Today: Rs. ${(485000+bills.reduce((s,b)=>s+b.total,0)).toLocaleString()} | Invoices: ${bills.length}`,Blood:`Total Donors: ${donors.length} | O+: ${donors.filter(d=>d.blood==='O+').length} | O-: ${donors.filter(d=>d.blood==='O-').length} | A+: ${donors.filter(d=>d.blood==='A+').length} | AB-: ${donors.filter(d=>d.blood==='AB-').length}`,Pharmacy:`Total Medicines: ${meds.length} | Low Stock: ${meds.filter(m=>m.stock<20).length} | Expired: ${meds.filter(m=>m.expiry&&new Date(m.expiry)<new Date()).length}`,Laboratory:`Total Tests: ${labs.length+24} | In System: ${labs.length} | Pending: ${labs.filter(l=>l.result==='Pending').length}`,Staff:`Total Staff: ${staffList.length} | Present: ${staffList.filter(s=>s.attend==='Present').length} | Doctors: ${doctors.length}`};$('reportContent').innerText=c[type]||'Report ready';showToast(type+' Report Generated')}
function printReport(){window.print()}
function downloadReport(){let csv='Type,Value\nPatients,'+patients.length+'\nDoctors,'+doctors.length+'\nAppointments,'+appointments.length+'\nDonors,'+donors.length+'\nBills,'+bills.length+'\nStaff,'+staffList.length;let blob=new Blob([csv],{type:'text/csv'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='CityCare_Report.csv';a.click();showToast('Report Downloaded')}
function exportData(){let data={patients,doctors,appointments,labs,meds,bills,donors,emr:emrList,staff:staffList,audit:auditLog,exportedAt:new Date().toLocaleString(),version:'4.0',srs:'SRS Compliant'};let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='CityCare_HMS_Backup_'+new Date().toISOString().slice(0,10)+'.json';a.click();addAudit('Backup Downloaded');showToast('✅ Daily Backup Downloaded!')}
function clearAllData(){if(!confirm('Are you sure? All saved data will be reset!'))return;Object.keys(localStorage).forEach(k=>{if(k.startsWith(DB_KEY))localStorage.removeItem(k)});location.reload()}
let savedUser=localStorage.getItem(DB_KEY+'loggedUser');if(savedUser){currentUser=savedUser;$('userInfo').innerHTML=`Welcome <b>${savedUser}</b> (Saved Session) | <a href="#" onclick="doLogout();return false" style="color:#f87171">Logout</a>`}
renderPatients();renderDoctors();syncDoctorDropdowns();renderAppointments();renderLabs();renderMeds();renderBills();renderDonors();renderEMR();renderStaff();renderAudit();updateDashboard();genReport('Patient');
console.log('🏥 City Care HMS v4.0 + Firebase Connected • city-care-hospital-aff77');
// 🔥 HTML එකේ onclick වලට Function ටික පෙන්නන්න
window.addPatient = addPatient;
window.editPatient = editPatient;
window.deletePatient = deletePatient;
window.viewHistory = viewHistory;
window.filterPatients = filterPatients;
window.filterPatientsByBlood = filterPatientsByBlood;
window.addDoctor = addDoctor;
window.editDoctor = editDoctor;
window.deleteDoctor = deleteDoctor;
window.filterDoctors = filterDoctors;
window.filterDoctorsByDept = filterDoctorsByDept;
window.selectDoctor = selectDoctor;
window.bookAppointment = bookAppointment;
window.quickBook = quickBook;
window.cancelApp = cancelApp;
window.rescheduleApp = rescheduleApp;
window.deleteAppointment = deleteAppointment;
window.addEMR = addEMR;
window.addLab = addLab;
window.addMedicine = addMedicine;
window.filterMeds = filterMeds;
window.addDonor = addDonor;
window.toggleDonorForm = toggleDonorForm;
window.filterBlood = filterBlood;
window.filterBloodSearch = filterBloodSearch;
window.contactDonor = contactDonor;
window.addStaff = addStaff;
window.calcBill = calcBill;
window.printBill = printBill;
window.genReport = genReport;
window.printReport = printReport;
window.downloadReport = downloadReport;
window.exportData = exportData;
window.clearAllData = clearAllData;
window.clearAudit = clearAudit;
window.showLogin = showLogin;
window.closeLogin = closeLogin;
window.doLogin = doLogin;
window.doLogout = doLogout;
window.closeSuccess = closeSuccess;
window.closeSuccessAndScroll = closeSuccessAndScroll;
window.closeEdit = closeEdit;
window.saveEdit = saveEdit;



// 🔥 FIX: Duplicate Patients අයින් කරන්න
setTimeout(()=>{
  // ID එක එක වගේ තියෙන අය අයින් කරන්න
  let seen = {};
  patients = patients.filter(p => {
    if(seen[p.id]) return false;
    seen[p.id] = true;
    return true;
  });
  localStorage.setItem('hms_v4_patients', JSON.stringify(patients));
  renderPatients();
  console.log("✅ Duplicates Removed!");
}, 1500);
window.closeConfirm = closeConfirm;
window.confirmYes = confirmYes;
window.askDelete = askDelete;
window.scrollToId = scrollToId;
