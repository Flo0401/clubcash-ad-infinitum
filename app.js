
const initial = {
  current:null,page:"home",cashTab:"drinks",adminTab:"money",
  users:{
    florian:{password:"club123",name:"Florian",role:"member",balance:24.50,bookings:[],bike:"Harley-Davidson Street Bob"},
    admin:{password:"admin123",name:"Admin",role:"admin",balance:0,bookings:[],bike:"Ad Infinitum Verwaltung"}
  },
  drinks:[
    {name:"Augustiner",price:2,stock:89,min:20,emoji:"🍺"},
    {name:"Chiemseer",price:2,stock:76,min:20,emoji:"🍺"},
    {name:"Monster Energy",price:2.5,stock:34,min:10,emoji:"🟢"},
    {name:"Red Bull",price:2,stock:41,min:10,emoji:"🔴"},
    {name:"Kaffee",price:2,stock:28,min:8,emoji:"☕"},
    {name:"Wasser",price:1,stock:53,min:20,emoji:"💧"},
    {name:"Cola 250 ml",price:1.5,stock:63,min:20,emoji:"🥤"},
    {name:"Fanta 250 ml",price:1.5,stock:44,min:20,emoji:"🥤"},
    {name:"Sprite 250 ml",price:1.5,stock:38,min:20,emoji:"🥤"}
  ],
  chat:[
    {from:"Admin",text:"Willkommen im Ad Infinitum Club-Chat.",time:"Heute 18:00"},
    {from:"Florian",text:"Wer ist heute Abend im Clubhaus?",time:"Heute 18:22"}
  ],
  events:[
    {title:"Clubabend",date:"Samstag, 19:00 Uhr",place:"Clubhaus"},
    {title:"Saison-Ausfahrt",date:"Sonntag, 10:00 Uhr",place:"Treffpunkt Clubhaus"}
  ],
  tours:[
    {title:"Saison-Ausfahrt",duration:"2 Stunden",via:"Bad Tölz · Tegernsee · Sylvenstein",style:"Kurvig & landschaftlich"}
  ],
  ledger:[
    {type:"Einzahlung",member:"Florian",amount:20,time:"Demo",admin:"Admin"}
  ]
};
let state = JSON.parse(localStorage.getItem("adInfinitumClubAppV03") || JSON.stringify(initial));
const app=document.getElementById("app");
const save=()=>localStorage.setItem("adInfinitumClubAppV03",JSON.stringify(state));
const euro=n=>Number(n).toLocaleString("de-DE",{style:"currency",currency:"EUR"});
function hero(){return `<div class="hero"><div class="infinity"></div><h1>AD INFINITUM</h1><p>ClubApp · Cash · Chat · Touren</p></div>`}
function loginScreen(msg=""){app.innerHTML=`<div class="app">${hero()}<div class="card gold"><h2>Anmelden</h2>${msg?`<p class="warn">${msg}</p>`:""}<input id="username" placeholder="Benutzername"><input id="password" placeholder="Passwort" type="password"><button onclick="login()">Einloggen</button><p class="small">Demo: florian / club123 · admin / admin123</p></div></div>`}
function login(){const u=document.getElementById("username").value.trim().toLowerCase();const p=document.getElementById("password").value;if(state.users[u]&&state.users[u].password===p){state.current=u;state.page="home";save();render()}else loginScreen("Benutzername oder Passwort falsch.")}
function nav(){const admin=state.users[state.current].role==="admin";const items=[["home","🏠","Start"],["cash","🍺","Cash"],["chat","💬","Chat"],["tours","🗺️","Touren"],[admin?"admin":"profile",admin?"👑":"👤",admin?"Admin":"Profil"]];return `<div class="nav">${items.map(i=>`<button class="${state.page===i[0]?'active':''}" onclick="state.page='${i[0]}';save();render()">${i[1]}<br>${i[2]}</button>`).join("")}</div>`}
function render(){if(!state.current)return loginScreen();if(state.page==="cash")return cash();if(state.page==="chat")return chat();if(state.page==="tours")return tours();if(state.page==="admin")return admin();if(state.page==="profile")return profile();return home()}
function home(){const u=state.users[state.current];app.innerHTML=`<div class="app">${hero()}<div class="card gold"><h2>Hallo ${u.name} 👋</h2><span class="badge">Mitglied · Ad Infinitum</span><p>Dein Guthaben</p><div class="balance">${euro(u.balance)}</div>${u.balance<5?`<p class="warn">Bitte bald Guthaben aufladen.</p>`:`<p class="ok">Guthaben aktiv</p>`}</div><div class="grid"><div class="tile" onclick="state.page='cash';render()">🍺<b>Getränke</b><span class="small">Direkt buchen</span></div><div class="tile" onclick="state.page='chat';render()">💬<b>Club-Chat</b><span class="small">${state.chat.length} Nachrichten</span></div><div class="tile" onclick="state.page='tours';render()">🗺️<b>Touren</b><span class="small">${state.tours.length} geplant</span></div><div class="tile" onclick="state.page='profile';render()">🏍️<b>Garage</b><span class="small">${u.bike}</span></div></div><div class="card"><h3>Nächster Termin</h3><b>${state.events[0]?.title||"Kein Termin"}</b><br><span class="small">${state.events[0]?.date||""} · ${state.events[0]?.place||""}</span></div>${nav()}</div>`}
function cash(){const u=state.users[state.current];app.innerHTML=`<div class="app"><h2>ClubCash</h2><div class="card gold"><p>Guthaben</p><div class="balance">${euro(u.balance)}</div></div><div class="tabs"><button class="${state.cashTab==='drinks'?'active':''}" onclick="state.cashTab='drinks';cash()">Getränke</button><button class="${state.cashTab==='history'?'active':''}" onclick="state.cashTab='history';cash()">Historie</button></div>${state.cashTab==='drinks'?drinkList():historyList()}${nav()}</div>`}
function drinkList(){return state.drinks.map((d,i)=>`<div class="card drink"><div class="emoji">${d.emoji}</div><div class="info"><b>${d.name}</b><br><span style="color:var(--gold)">${euro(d.price)}</span> <span class="small">· Bestand: ${d.stock}</span></div><button onclick="buy(${i})">+</button></div>`).join("")}
function historyList(){const u=state.users[state.current];return `<div class="card"><h3>Meine Buchungen</h3>${u.bookings.length?u.bookings.map(b=>`<p class="msg"><b>${b.drink}</b> · ${euro(b.price)}<br><span class="small">${b.time}</span></p>`).join(""):`<p class="small">Noch keine Buchungen.</p>`}</div>`}
function buy(i){const u=state.users[state.current],d=state.drinks[i];if(d.stock<=0)return alert("Nicht auf Lager.");if(u.balance<d.price)return alert("Nicht genügend Guthaben.");d.stock--;u.balance=+(u.balance-d.price).toFixed(2);const entry={drink:d.name,price:d.price,time:new Date().toLocaleString("de-DE")};u.bookings.unshift(entry);state.ledger.unshift({type:"Getränk",member:u.name,amount:-d.price,item:d.name,time:entry.time,admin:"System"});save();alert(`${d.name} gebucht. Neues Guthaben: ${euro(u.balance)}`);cash()}
function chat(){app.innerHTML=`<div class="app"><h2>Club-Chat</h2><div class="card gold"><b>Allgemeiner Chat</b><p class="small">Nur eingeloggte Mitglieder von Ad Infinitum.</p></div>${state.chat.map(m=>`<div class="card"><b>${m.from}</b><br><p>${m.text}</p><span class="small">${m.time}</span></div>`).join("")}<div class="card"><input id="chatText" placeholder="Nachricht schreiben..."><button onclick="sendChat()">Senden</button></div><div class="card"><h3>Admin-Ankündigungen</h3><p class="msg"><b>Vorstand:</b> Samstag Clubabend ab 19:00 Uhr.</p></div>${nav()}</div>`}
function sendChat(){const text=document.getElementById("chatText").value.trim();if(!text)return;state.chat.push({from:state.users[state.current].name,text,time:new Date().toLocaleString("de-DE")});save();chat()}
function tours(){app.innerHTML=`<div class="app"><h2>Tourenplaner</h2><div class="mapbox">🗺️ Kartenbereich<br><span class="small">Später mit echter Route über Google Maps / OpenRouteService</span></div><div class="card gold"><h3>Route erstellen</h3><input id="tourTitle" placeholder="Name der Tour"><input id="tourDuration" placeholder="Fahrzeit, z. B. 1 Stunde"><textarea id="tourVia" rows="3" placeholder="Über welche Städte?"></textarea><select id="tourStyle"><option>Kurvig & landschaftlich</option><option>Schnellste Route</option><option>Rundtour</option></select><button onclick="saveTour()">Tour speichern</button></div><div class="card"><h3>Geplante Touren</h3>${state.tours.map(t=>`<p class="msg"><b>${t.title}</b><br><span class="small">${t.duration} · ${t.style}</span><br><span>${t.via}</span></p>`).join("")}</div>${nav()}</div>`}
function saveTour(){const title=document.getElementById("tourTitle").value.trim()||"Neue Tour";const duration=document.getElementById("tourDuration").value.trim()||"1 Stunde";const via=document.getElementById("tourVia").value.trim()||"Noch keine Orte";const style=document.getElementById("tourStyle").value;state.tours.unshift({title,duration,via,style});save();tours()}
function profile(){const u=state.users[state.current];app.innerHTML=`<div class="app"><h2>Profil & Garage</h2><div class="card gold"><h3>${u.name}</h3><p>Motorrad</p><b>${u.bike}</b></div><div class="card"><h3>Motorrad ändern</h3><input id="bike" value="${u.bike}"><button onclick="state.users[state.current].bike=document.getElementById('bike').value;save();profile()">Speichern</button></div><div class="card"><h3>Datenschutz</h3><p class="small">Mitglieder sehen nur ihre eigenen Buchungen und ihr eigenes Guthaben.</p><button class="secondary" onclick="state.current=null;save();loginScreen()">Abmelden</button></div>${nav()}</div>`}
function admin(){const total=Object.values(state.users).reduce((s,u)=>s+u.balance,0);app.innerHTML=`<div class="app"><h2>Adminbereich</h2><div class="grid"><div class="tile"><b>Mitglieder</b><div class="balance">25</div></div><div class="tile"><b>Guthaben</b><div class="balance">${euro(total)}</div></div></div><div class="tabs"><button class="${state.adminTab==='money'?'active':''}" onclick="state.adminTab='money';admin()">Guthaben</button><button class="${state.adminTab==='stock'?'active':''}" onclick="state.adminTab='stock';admin()">Lager</button></div>${state.adminTab==='money'?adminMoney():adminStock()}${nav()}</div>`}
function adminMoney(){return `<div class="card gold"><h3>Guthaben freigeben</h3><select id="member"><option value="florian">Florian</option></select><input id="amount" type="number" step="0.01" placeholder="Betrag, z. B. 20"><button onclick="addBalance()">Freigeben</button></div><div class="card"><h3>Protokoll</h3>${state.ledger.slice(0,10).map(l=>`<p class="msg"><b>${l.type}</b> · ${l.member} · ${euro(l.amount)}<br><span class="small">${l.time}</span></p>`).join("")}</div>`}
function addBalance(){const m=document.getElementById("member").value;const amount=Number(document.getElementById("amount").value||0);if(amount<=0)return alert("Bitte Betrag eingeben.");state.users[m].balance=+(state.users[m].balance+amount).toFixed(2);state.ledger.unshift({type:"Einzahlung",member:state.users[m].name,amount,time:new Date().toLocaleString("de-DE"),admin:state.users[state.current].name});save();admin()}
function adminStock(){const low=state.drinks.filter(d=>d.stock<d.min);return `<div class="card"><h3>Lagerwarnung</h3>${low.length?low.map(d=>`<p class="warn">${d.name}: nur ${d.stock} Stück</p>`).join(""):`<p class="ok">Alle Bestände okay.</p>`}</div><div class="card"><h3>Bestand erhöhen</h3><select id="drink">${state.drinks.map((d,i)=>`<option value="${i}">${d.name}</option>`).join("")}</select><input id="stockAmount" type="number" placeholder="Menge"><button onclick="addStock()">Bestand hinzufügen</button></div><div class="card"><h3>Getränke & Bestand</h3>${state.drinks.map(d=>`<div class="row"><span>${d.name}</span><b>${d.stock}</b></div>`).join("<hr style='border-color:#222'>")}</div>`}
function addStock(){const i=Number(document.getElementById("drink").value);const amount=Number(document.getElementById("stockAmount").value||0);if(amount<=0)return alert("Bitte Menge eingeben.");state.drinks[i].stock+=amount;save();admin()}
loginScreen();
