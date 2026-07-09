
const drinks=[
 {name:"Augustiner",price:2,stock:89,emoji:"🍺"},
 {name:"Chiemseer",price:2,stock:76,emoji:"🍺"},
 {name:"Monster Energy",price:2.5,stock:34,emoji:"🟢"},
 {name:"Red Bull",price:2,stock:41,emoji:"🔴"},
 {name:"Kaffee",price:2,stock:28,emoji:"☕"},
 {name:"Wasser",price:1,stock:53,emoji:"💧"},
 {name:"Cola 250 ml",price:1.5,stock:63,emoji:"🥤"},
 {name:"Fanta 250 ml",price:1.5,stock:44,emoji:"🥤"},
 {name:"Sprite 250 ml",price:1.5,stock:38,emoji:"🥤"}
];
const users={
 florian:{password:"club123",name:"Florian",role:"member",balance:24.50,bookings:[]},
 admin:{password:"admin123",name:"Admin",role:"admin",balance:0,bookings:[]}
};
let current=null, page="home";
const app=document.getElementById("app");
const euro=n=>n.toLocaleString("de-DE",{style:"currency",currency:"EUR"});
function logo(){return `<div class="logo"><div class="chain">∞</div><h1>AD INFINITUM</h1><p>ClubCash · Vereins-Getränkekasse</p></div>`}
function renderLogin(msg=""){
 app.innerHTML=`<div class="app">${logo()}<div class="card"><h2>Anmelden</h2>${msg?`<p class="warn">${msg}</p>`:""}<input id="u" placeholder="Benutzername" autocomplete="username"><input id="p" placeholder="Passwort" type="password" autocomplete="current-password"><button onclick="login()">Einloggen</button><p class="small">Demo: florian / club123 · admin / admin123</p></div></div>`;
}
function login(){const u=document.getElementById("u").value.trim().toLowerCase(); const p=document.getElementById("p").value; if(users[u]&&users[u].password===p){current=u;page="home";render()} else renderLogin("Benutzername oder Passwort falsch.");}
function nav(){return `<div class="nav"><button class="${page==='home'?'active':''}" onclick="page='home';render()">Start</button><button class="${page==='drinks'?'active':''}" onclick="page='drinks';render()">Getränke</button><button class="${page==='bookings'?'active':''}" onclick="page='bookings';render()">Buchungen</button>${users[current].role==='admin'?`<button class="${page==='admin'?'active':''}" onclick="page='admin';render()">Admin</button>`:""}<button onclick="current=null;renderLogin()">Logout</button></div>`}
function render(){ if(!current) return renderLogin(); const u=users[current]; if(page==="drinks") return renderDrinks(); if(page==="bookings") return renderBookings(); if(page==="admin") return renderAdmin(); app.innerHTML=`<div class="app">${logo()}<div class="card"><h2>Hallo ${u.name} 👋</h2><p>Schön, dass du da bist.</p></div><div class="card"><p>Dein Guthaben</p><div class="balance">${euro(u.balance)}</div>${u.balance<5?`<p class="warn">Bitte bald Guthaben aufladen.</p>`:""}</div><button onclick="page='drinks';render()">🍺 Getränke kaufen</button><button onclick="page='bookings';render()">📜 Meine Buchungen</button>${nav()}</div>`}
function renderDrinks(){const u=users[current]; app.innerHTML=`<div class="app"><h2>Getränke kaufen</h2><p>Guthaben: <b>${euro(u.balance)}</b></p>${drinks.map((d,i)=>`<div class="card drink"><div class="emoji">${d.emoji}</div><div style="flex:1"><b>${d.name}</b><br><span style="color:var(--gold)">${euro(d.price)}</span> <span class="small">Bestand: ${d.stock}</span></div><button onclick="buy(${i})">+</button></div>`).join("")}${nav()}</div>`}
function buy(i){const u=users[current], d=drinks[i]; if(d.stock<=0) return alert("Nicht auf Lager"); if(u.balance<d.price) return alert("Nicht genügend Guthaben."); u.balance=+(u.balance-d.price).toFixed(2); d.stock--; u.bookings.unshift({drink:d.name,price:d.price,date:new Date().toLocaleString("de-DE")}); alert(d.name+" gebucht. Neues Guthaben: "+euro(u.balance)); renderDrinks();}
function renderBookings(){const u=users[current]; app.innerHTML=`<div class="app"><h2>Meine Buchungen</h2>${u.bookings.length?u.bookings.map(b=>`<div class="card"><b>${b.drink}</b><br>${euro(b.price)}<br><span class="small">${b.date}</span></div>`).join(""):`<div class="card">Noch keine Buchungen.</div>`}${nav()}</div>`}
function renderAdmin(){let total=Object.values(users).reduce((s,u)=>s+u.balance,0); app.innerHTML=`<div class="app"><h2>Admin Dashboard</h2><div class="admin-grid"><div class="card"><b>Mitglieder</b><div class="balance">25</div></div><div class="card"><b>Guthaben Umlauf</b><div class="balance">${euro(total)}</div></div></div><div class="card"><h3>Guthaben freigeben</h3><p>Florian +20,00 €</p><button onclick="users.florian.balance+=20;alert('20 € freigegeben');renderAdmin()">Freigeben</button></div><h3>Lagerbestand</h3>${drinks.map(d=>`<div class="card row"><span>${d.name}</span><b>${d.stock}</b></div>`).join("")}${nav()}</div>`}
renderLogin();
