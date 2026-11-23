// ================= CONFIG =================
const API = "https://codeorbit-backend-f4lj.onrender.com/api";

// ================= BUILT-IN COURSES =================
const defaultCourses = [
 {id:"html",title:"HTML",category:"Frontend",level:"Beginner",icon:"5",description:"Build the structure of every website, from your first tag to semantic layouts.",lessons:["Introduction to HTML","HTML Editors","HTML Elements","HTML Attributes","Headings & Paragraphs","Links & Images","Tables","Forms","Semantic HTML"],color:"#eaf2ff",ink:"#3974c8"},
 {id:"css",title:"CSS",category:"Frontend",level:"Beginner",icon:"✳",description:"Style beautiful, responsive interfaces with layouts, typography and motion.",lessons:["Introduction to CSS","Selectors","Colors & Backgrounds","Box Model","Flexbox","CSS Grid","Responsive Design","Transitions & Animations"],color:"#e9f8f3",ink:"#26966f"},
 {id:"javascript",title:"JavaScript",category:"Frontend",level:"Beginner",icon:"JS",description:"Bring websites to life with the language of the modern web.",lessons:["JavaScript Introduction","Variables","Data Types","Operators","Conditions","Loops","Functions","Arrays","Objects","DOM Basics"],color:"#fff5dc",ink:"#a77a12"},
 {id:"python",title:"Python",category:"Programming",level:"Beginner",icon:"Py",description:"Start programming with clean syntax, practical examples and mini projects.",lessons:["Python Introduction","Install Python","Python Syntax","Variables","Data Types","Operators","If...Else","While Loops","For Loops","Functions","Lists","Dictionaries","Classes & Objects"],color:"#edf1ff",ink:"#5368bd"},
 {id:"java",title:"Java",category:"Programming",level:"Beginner",icon:"J",description:"Learn object-oriented programming and build a strong software foundation.",lessons:["Java Introduction","JDK & Setup","Syntax","Variables","Data Types","Operators","Conditions","Loops","Methods","Classes & Objects","Inheritance"],color:"#fff0e9",ink:"#c46c43"},
 {id:"cpp",title:"C++",category:"Programming",level:"Beginner",icon:"++",description:"Understand core programming, memory concepts and object-oriented C++.",lessons:["C++ Introduction","Setup","Syntax","Variables","Data Types","Operators","Conditions","Loops","Functions","Arrays","Pointers","OOP"],color:"#eaf5ff",ink:"#397db7"},
 {id:"c",title:"C Language",category:"Programming",level:"Beginner",icon:"C",description:"Master programming fundamentals with one of the most influential languages.",lessons:["C Introduction","Install Compiler","Syntax","Variables","Data Types","Operators","If...Else","Loops","Functions","Arrays","Pointers"],color:"#e9f8f3",ink:"#27866c"},
 {id:"sql",title:"SQL",category:"Database",level:"Beginner",icon:"▤",description:"Query, organize and understand data with practical database examples.",lessons:["SQL Introduction","SELECT","WHERE","ORDER BY","INSERT","UPDATE","DELETE","JOIN","GROUP BY","Database Design"],color:"#f0edff",ink:"#7458c9"},
 {id:"php",title:"PHP",category:"Programming",level:"Beginner",icon:"PHP",description:"Create dynamic server-side websites and connect applications to databases.",lessons:["PHP Introduction","Setup","Syntax","Variables","Data Types","Conditions","Loops","Functions","Forms","MySQL Connection"],color:"#f3edff",ink:"#8063bf"},
 {id:"react",title:"React",category:"Frontend",level:"Intermediate",icon:"⚛",description:"Build reusable user interfaces with components, state and modern React.",lessons:["React Introduction","Create App","JSX","Components","Props","State","Events","Hooks","Lists & Keys","React Router"],color:"#e9f8fc",ink:"#2697b1"},
 {id:"git",title:"Git & GitHub",category:"Career",level:"Beginner",icon:"⑂",description:"Track your work, collaborate with others and publish your projects.",lessons:["Version Control","Install Git","Repositories","Commits","Branches","Merge","GitHub Basics","Pull Requests"],color:"#fff0e9",ink:"#c46c43"},
 {id:"dsa",title:"Data Structures",category:"Programming",level:"Intermediate",icon:"◇",description:"Learn how to organize data and solve problems efficiently.",lessons:["DSA Introduction","Arrays","Linked Lists","Stacks","Queues","Trees","Graphs","Searching","Sorting","Big O Notation"],color:"#f0edff",ink:"#7458c9"}
];

// ================= STATE =================
let remoteCourses = [];          // courses saved in the database
let remoteError = false;
let courses = [...defaultCourses];
let activeCategory = "All";
let session = loadSession();     // {token, user:{name,email,role}} or null
let authMode = "login";          // "login" | "signup"
const grid = document.getElementById("courseGrid");
const $ = id => document.getElementById(id);

// old demo data from localStorage is no longer used
try { localStorage.removeItem("codeorbit_courses"); } catch {}

// ================= SESSION =================
function loadSession(){
  try { return JSON.parse(localStorage.getItem("codeorbit_session")) || null; } catch { return null; }
}
function saveSession(s){
  session = s;
  try { s ? localStorage.setItem("codeorbit_session", JSON.stringify(s)) : localStorage.removeItem("codeorbit_session"); } catch {}
}

// ================= API HELPER =================
async function api(path, options = {}){
  const headers = { "Content-Type": "application/json" };
  if (session) headers.Authorization = "Bearer " + session.token;
  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok){
    if (res.status === 401 && session){ saveSession(null); renderAdmin(); }
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

function fromServer(c){
  return {
    id: c._id,
    title: c.title,
    description: c.description || "",
    category: c.category || "Programming",
    level: c.level || "Beginner",
    icon: c.icon || "✦",
    lessons: ["Introduction","Getting Started","Core Concepts","Practice"],
    remote: true
  };
}

async function loadRemoteCourses(){
  try {
    const list = await api("/courses");
    remoteCourses = list.map(fromServer);
    remoteError = false;
  } catch {
    remoteError = true;
  }
  courses = [...defaultCourses, ...remoteCourses];
  renderCourses();
  renderAdminCourseList();
}

// ================= COURSES UI =================
function escapeHtml(s){return String(s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}

function renderCourses(){
 const q=$("courseSearch").value.trim().toLowerCase();
 const shown=courses.filter(c=>(activeCategory==="All"||c.category===activeCategory)&&(`${c.title} ${c.description} ${c.category}`).toLowerCase().includes(q));
 grid.innerHTML=shown.length?shown.map(c=>`<article class="course-card" data-id="${escapeHtml(c.id)}" style="--icon-bg:${c.color||"#f0edff"};--icon-color:${c.ink||"#7257e8"};--glow:${c.color||"#eeeaff"}"><div class="course-card-top"><div class="course-icon">${escapeHtml(c.icon||"✦")}</div><span class="course-arrow">↗</span></div><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.description)}</p><div class="course-meta"><span>${escapeHtml(c.level)}</span><span>·</span><span>${c.lessons.length} lessons</span><span>·</span><span>${escapeHtml(c.category)}</span></div></article>`).join(""):`<div class="empty-state">No courses found. Try another search.</div>`;
 document.querySelectorAll(".course-card").forEach(card=>card.addEventListener("click",()=>openCourse(card.dataset.id)));
 document.querySelector('[data-category="All"] span').textContent=courses.length;
}

$("courseSearch").addEventListener("input",renderCourses);
$("categoryTabs").addEventListener("click",e=>{const b=e.target.closest("button[data-category]");if(!b)return;activeCategory=b.dataset.category;document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===b));renderCourses()});

function openCourse(id){
  const c=courses.find(x=>x.id===id);
  if(!c)return;
  $("courseModalContent").innerHTML=`<div class="eyebrow">${escapeHtml(c.category)} · ${escapeHtml(c.level)}</div><h2>${escapeHtml(c.title)} Tutorial</h2><p class="modal-subtitle">${escapeHtml(c.description)}</p><div class="lesson-list">${c.lessons.map((l,i)=>`<div class="lesson-item"><span>${String(i+1).padStart(2,"0")} &nbsp; ${escapeHtml(l)}</span><span>Read lesson ↗</span></div>`).join("")}</div><p class="admin-note">Lesson outline preview. Full lesson content and student progress will be connected in the next development stage.</p>`;
  showModal("courseModal");
}

// ================= MODALS =================
function showModal(id){$(id).classList.add("open")}
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.close).classList.remove("open")));
document.querySelectorAll(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.remove("open")}));

// ================= ADMIN PANEL =================
function setMsg(text, isError){
  const el = $("adminMsg");
  el.textContent = text || "";
  el.style.color = isError ? "#d64545" : "";
}

function renderAdmin(){
  const loggedIn = !!session;
  const isAdmin = loggedIn && session.user.role === "admin";

  $("authPanel").hidden = loggedIn;
  $("studioPanel").hidden = !isAdmin;
  $("userPanel").hidden = !(loggedIn && !isAdmin);
  $("sessionLine").hidden = !loggedIn;

  if (!loggedIn){
    const signup = authMode === "signup";
    $("adminTitle").textContent = signup ? "Create account" : "Admin login";
    $("adminSubtitle").textContent = signup ? "Sign up to save your learning progress." : "Log in to manage courses.";
    $("nameField").hidden = !signup;
    $("authSubmit").textContent = signup ? "Create account" : "Log in";
    $("authToggle").textContent = signup ? "Already have an account? Log in" : "New here? Create an account";
    $("authForm").elements.password.autocomplete = signup ? "new-password" : "current-password";
  } else {
    $("sessionName").textContent = session.user.name || session.user.email;
    if (isAdmin){
      $("adminTitle").textContent = "Course studio";
      $("adminSubtitle").textContent = "Courses you add here are saved to the database and shown to every visitor.";
    } else {
      $("adminTitle").textContent = "You're logged in";
      $("adminSubtitle").textContent = "Only the site admin can add or remove courses.";
    }
  }
  renderAdminCourseList();
}

function renderAdminCourseList(){
  const box = $("adminCourseList");
  if (!box) return;
  if (remoteError){
    box.innerHTML = `<p class="admin-note">Couldn't load courses from the server. Check your connection and reload the page.</p>`;
    return;
  }
  box.innerHTML = remoteCourses.length
    ? remoteCourses.map(c=>`<div class="admin-course-row"><span>${escapeHtml(c.icon)} &nbsp;${escapeHtml(c.title)} <small>${escapeHtml(c.category)}</small></span><button type="button" class="admin-delete" data-del="${escapeHtml(c.id)}">Delete</button></div>`).join("")
    : `<p class="admin-note">No courses added yet. Use the form above to add your first one.</p>`;
}

$("adminOpen").addEventListener("click",()=>{ setMsg(""); renderAdmin(); showModal("adminModal"); });

$("authToggle").addEventListener("click",e=>{
  e.preventDefault();
  authMode = authMode === "login" ? "signup" : "login";
  setMsg("");
  renderAdmin();
});

$("authForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const btn = $("authSubmit");
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Please wait…";
  setMsg("Connecting to the server. The first request can take up to a minute.");
  try {
    const body = { email: f.get("email").trim(), password: f.get("password") };
    if (authMode === "signup") body.name = (f.get("name") || "").trim();
    const data = await api(authMode === "signup" ? "/auth/signup" : "/auth/login", { method:"POST", body: JSON.stringify(body) });
    saveSession({ token: data.token, user: data.user });
    e.target.reset();
    setMsg("");
    renderAdmin();
  } catch (err) {
    setMsg(err.message, true);
    btn.textContent = label;
  } finally {
    btn.disabled = false;
    if (!session) btn.textContent = label;
  }
});

$("logoutBtn").addEventListener("click",e=>{
  e.preventDefault();
  saveSession(null);
  authMode = "login";
  setMsg("");
  renderAdmin();
});

$("courseForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const btn = e.target.querySelector('button[type="submit"]');
  const label = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = "Saving…";
  try {
    const created = await api("/courses", { method:"POST", body: JSON.stringify({
      title: f.get("title").trim(),
      description: f.get("description").trim(),
      category: f.get("category"),
      level: f.get("level"),
      icon: f.get("icon") || "✦"
    })});
    remoteCourses.unshift(fromServer(created));
    courses = [...defaultCourses, ...remoteCourses];
    renderCourses();
    renderAdminCourseList();
    e.target.reset();
    setMsg("Course added.");
  } catch (err) {
    setMsg(err.message, true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = label;
  }
});

$("adminCourseList").addEventListener("click",async e=>{
  const b = e.target.closest("[data-del]");
  if (!b) return;
  const course = remoteCourses.find(c=>c.id===b.dataset.del);
  if (!course || !confirm(`Delete "${course.title}"? This can't be undone.`)) return;
  b.disabled = true;
  try {
    await api("/courses/" + encodeURIComponent(course.id), { method:"DELETE" });
    remoteCourses = remoteCourses.filter(c=>c.id!==course.id);
    courses = [...defaultCourses, ...remoteCourses];
    renderCourses();
    renderAdminCourseList();
    setMsg("Course deleted.");
  } catch (err) {
    b.disabled = false;
    setMsg(err.message, true);
  }
});

// ================= PLAYGROUND, THEME, SHORTCUTS =================
$("runCode").addEventListener("click",()=>{const code=$("codeEditor").value;$("previewFrame").srcdoc=code;});
$("runCode").click();
$("themeToggle").addEventListener("click",()=>{document.body.classList.toggle("dark");$("themeToggle").textContent=document.body.classList.contains("dark")?"☀":"☾"});
$("mobileMenu").addEventListener("click",()=>{$("explore").scrollIntoView({behavior:"smooth"})});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("courseSearch").focus()}if(e.key==="Escape")document.querySelectorAll(".modal-backdrop").forEach(m=>m.classList.remove("open"))});

// ================= START =================
renderCourses();
loadRemoteCourses();
