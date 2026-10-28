const $ = (id) => document.getElementById(id);
let selectedRole = "student";
const stage = $("stage"), grade = $("grade"), track = $("track"), trackWrap = $("trackWrap");
const tracks = {
  "الثانوية العامة": ["علمي علوم", "علمي رياضيات", "أدبي"],
  "البكالوريا": ["الطب وعلوم الحياة", "الآداب والفنون", "الهندسة", "إدارة الأعمال"]
};
function fillGrades(){
  const s = stage.value;
  grade.innerHTML = '<option value="">اختر الصف</option>';
  const n = s === "الابتدائية" ? 6 : (s ? 3 : 0);
  for(let i=1;i<=n;i++){
    const o=document.createElement("option"); o.value=String(i); o.textContent=`الصف ${["الأول","الثاني","الثالث","الرابع","الخامس","السادس"][i-1] || i}`; grade.appendChild(o);
  }
  trackWrap.hidden = !tracks[s];
  track.innerHTML = '<option value="">اختر الشعبة أو المسار</option>';
  (tracks[s]||[]).forEach(t=>{const o=document.createElement("option");o.value=t;o.textContent=t;track.appendChild(o)});
  track.required=!!tracks[s];
}
stage.addEventListener("change",fillGrades);
document.querySelectorAll(".role-tab").forEach(btn=>btn.addEventListener("click",()=>{
  selectedRole=btn.dataset.role;
  document.querySelectorAll(".role-tab").forEach(b=>b.classList.toggle("active",b===btn));
  $("studentFields").hidden=selectedRole!=="student";
  $("adminCodeWrap").hidden=selectedRole!=="admin";
  $("authMessage").textContent="";
  ["stage","grade","track"].forEach(id=>$(id).required=selectedRole==="student" && (id!=="track" || !!tracks[stage.value]));
}));
$("themeToggle").addEventListener("click",()=>document.body.classList.toggle("dark"));
const validPhone = p => /^(010|011|012)\d{8}$/.test(p);
$("authForm").addEventListener("submit",e=>{
  e.preventDefault();
  const phone=$("phone").value.trim(), password=$("password").value;
  if(!validPhone(phone)){ $("authMessage").textContent="رقم الهاتف لازم يكون 11 رقمًا ويبدأ بـ 010 أو 011 أو 012."; return; }
  if(password.length<4){ $("authMessage").textContent="كلمة المرور التجريبية يجب ألا تقل عن 4 أحرف."; return; }
  if(selectedRole==="admin" && $("adminCode").value!=="HIBA-DEMO"){ $("authMessage").textContent="كود تجريبي غير صحيح. هذه الواجهة ليست نظام إدارة آمنًا."; return; }
  if(selectedRole==="student" && (!stage.value||!grade.value||(tracks[stage.value]&&!track.value))){ $("authMessage").textContent="أكمل المرحلة والصف والشعبة/المسار."; return; }
  showDashboard({role:selectedRole,stage:stage.value,grade:grade.value,track:track.value,phone});
});
function showDashboard(u){
  $("welcome").hidden=true;
  $("dashboard").hidden=false;
  $("authForm").closest(".auth-panel").hidden=true;
  const titles={student:"لوحة الطالب",teacher:"مساحة المعلم",admin:"لوحة المدير"};
  const subtitles={
    student:`${u.stage} • الصف ${u.grade}${u.track?" • "+u.track:""}`,
    teacher:"إدارة صفحتك التعليمية ومحتواك المرسل للمراجعة.",
    admin:"متابعة الحسابات والمحتوى وطلبات المراجعة."
  };
  $("dashboardTitle").textContent=titles[u.role];
  $("dashboardSubtitle").textContent=subtitles[u.role];
  const data={
    student:[["دروسي","محتوى تجريبي حسب صفك"],["اختباراتي","تدريب ونتائج تجريبية"],["تقدمي","سيُفعّل الحفظ الحقيقي لاحقًا"]],
    teacher:[["محتواي","إضافة الدروس والملفات مستقبلًا"],["قيد المراجعة","المحتوى يحتاج موافقة الإدارة"],["إحصائياتي","عرض تجريبي للإحصائيات"]],
    admin:[["حسابات المستخدمين","واجهة إدارية تجريبية"],["مراجعة المحتوى","قبول أو رفض المحتوى لاحقًا"],["الإحالات والمكافآت","تحتاج نظامًا خلفيًا آمنًا"]]
  };
  $("dashboardCards").innerHTML=data[u.role].map(x=>`<article class="dash-card"><strong>${x[0]}</strong><span>${x[1]}</span></article>`).join("");
  const details={
    student:`<strong>المحتوى المخصص لك</strong><ul><li>تُعرض هذه المعلومات كتجربة واجهة فقط.</li><li>التصفية الحقيقية حسب الصف يجب فرضها من قاعدة بيانات وخادم آمن.</li><li>لا توجد دروس رسمية مرفوعة في النموذج الحالي.</li></ul>`,
    teacher:`<strong>أدوات المعلم المخططة</strong><ul><li>إنشاء درس وتحديد المرحلة والصف والشعبة.</li><li>إرسال الملفات للمراجعة قبل النشر.</li><li>حساب المعلم الفعلي يجب أن توافق عليه الإدارة.</li></ul>`,
    admin:`<strong>أدوات الإدارة المخططة</strong><ul><li>مراجعة طلبات المعلمين والمحتوى.</li><li>إدارة الحسابات والمجموعات والصلاحيات.</li><li>لا تعتمد على هذه الصفحة لحماية بيانات أو إدارة مستخدمين حقيقيين.</li></ul>`
  };
  $("dashboardDetails").innerHTML=details[u.role];
}
$("logoutBtn").addEventListener("click",()=>{
  $("dashboard").hidden=true;$("welcome").hidden=false;$("authForm").closest(".auth-panel").hidden=false;
  $("authForm").reset();fillGrades();$("authMessage").textContent="تم الخروج من العرض التجريبي.";
});
fillGrades();
if("serviceWorker" in navigator && location.protocol.startsWith("http")) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
