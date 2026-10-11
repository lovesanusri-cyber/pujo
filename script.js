const MEMBER_PASSWORD = "RAKSHAKALI";

let currentRole = "member";
let isUserSignUp = false;
let membersData = JSON.parse(localStorage.getItem('puja_members_list')) || [];
let registeredUsers = JSON.parse(localStorage.getItem('registered_app_users')) || [];

// রোল নির্বাচন
function switchLoginRole(role) {
    currentRole = role;
    document.getElementById('role-member-btn').classList.toggle('active', role === 'member');
    document.getElementById('role-user-btn').classList.toggle('active', role === 'user');

    document.getElementById('member-login-form').style.display = role === 'member' ? 'block' : 'none';
    document.getElementById('user-login-form').style.display = role === 'user' ? 'block' : 'none';
}

// মেম্বার লগইন
document.getElementById('member-login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const inputPass = document.getElementById('member-password').value;

    if (inputPass === MEMBER_PASSWORD) {
        startFireworks();
        setTimeout(() => openApp('Member'), 1000);
    } else {
        alert("ভুল মেম্বার পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।");
    }
});

// ইউজার মোড পরিবর্তন
function toggleUserAuthMode() {
    isUserSignUp = !isUserSignUp;
    document.getElementById('user-form-title').innerText = isUserSignUp ? "ইউজার সাইনআপ" : "ইউজার লগইন";
    document.getElementById('user-submit-btn').innerText = isUserSignUp ? "সাইনআপ করুন" : "লগইন করুন";
    document.querySelector('.toggle-text').innerText = isUserSignUp ? "অ্যাাকাউন্ট আছে? লগইন করুন" : "নতুন অ্যাকাউন্ট তৈরি করতে চান? সাইনআপ করুন";
}

// ইউজার লগইন/সাইনআপ
document.getElementById('user-login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;

    if (isUserSignUp) {
        if (registeredUsers.find(u => u.email === email)) {
            alert("এই ইমেইলটি দিয়ে ইতিমধ্যেই অ্যাকাউন্ট খোলা হয়েছে!");
            return;
        }
        registeredUsers.push({ email, password });
        localStorage.setItem('registered_app_users', JSON.stringify(registeredUsers));
        alert("সাইনআপ সফল হয়েছে! এবার লগইন করুন।");
        toggleUserAuthMode();
    } else {
        if (registeredUsers.find(u => u.email === email && u.password === password)) {
            startFireworks();
            setTimeout(() => openApp('General User'), 1000);
        } else {
            alert("ভুল ইমেইল বা পাসওয়ার্ড!");
        }
    }
});

function openApp(roleName) {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('logged-role-badge').innerText = `লগইন: ${roleName}`;

    if (roleName === 'General User') {
        document.querySelectorAll('.member-only').forEach(el => el.style.display = 'none');
    } else {
        document.querySelectorAll('.member-only').forEach(el => el.style.display = 'inline-block');
    }

    renderTable();
}

function logout() {
    location.reload();
}

function startFireworks() {
    const container = document.getElementById('fireworks-container');
    for (let i = 0; i < 25; i++) {
        const firework = document.createElement('div');
        firework.classList.add('firework');
        const x = (Math.random() - 0.5) * window.innerWidth;
        const y = (Math.random() - 0.5) * window.innerHeight;
        firework.style.setProperty('--x', `${x}px`);
        firework.style.setProperty('--y', `${y}px`);
        firework.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        container.appendChild(firework);
        setTimeout(() => firework.remove(), 1000);
    }
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// চাঁদা ডাটা যোগ (ঠিকানাসহ)
document.getElementById('add-member-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('member-name-input').value.trim();
    const address = document.getElementById('member-address-input').value.trim();
    const amount = parseFloat(document.getElementById('chanda-amount-input').value);

    if (name && address && !isNaN(amount)) {
        membersData.push({ id: Date.now(), name: name, address: address, amount: amount, paid: false });
        saveAndRender();
        document.getElementById('member-name-input').value = '';
        document.getElementById('member-address-input').value = '';
        document.getElementById('chanda-amount-input').value = '';
        alert("নতুন ডাটা সফলভাবে যোগ করা হয়েছে!");
    }
});

function deleteMember(id) {
    if (confirm("আপনি কি নিশ্চিত যে এই রেকর্ডটি বাতিল/মুছে ফেলতে চান?")) {
        membersData = membersData.filter(m => m.id !== id);
        saveAndRender();
    }
}

function togglePaidStatus(id) {
    membersData = membersData.map(m => m.id === id ? { ...m, paid: !m.paid } : m);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('puja_members_list', JSON.stringify(membersData));
    renderTable();
}

// হিসাব আপডেট ও টেবিল রেন্ডার
function renderTable() {
    const tbody = document.getElementById('member-list-body');
    tbody.innerHTML = '';

    let totalPaid = 0;
    let totalPending = 0;
    let unpaidCount = 0;

    membersData.forEach(member => {
        if (member.paid) {
            totalPaid += member.amount;
        } else {
            totalPending += member.amount;
            unpaidCount++;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${member.name}</td>
            <td>${member.address || 'N/A'}</td>
            <td>₹${member.amount}</td>
            <td style="color: ${member.paid ? '#2ed573' : '#ff3838'}; font-weight: bold;">
                ${member.paid ? 'পেইড (Paid)' : 'বাকি আছে'}
            </td>
            <td>
                <button class="btn-pay" onclick="togglePaidStatus(${member.id})">${member.paid ? 'Unpaid করুন' : 'Paid চিহ্নিত করুন'}</button>
                <button class="btn-delete" onclick="deleteMember(${member.id})">বাতিল করুন</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // সামারি রিয়েল-টাইমে আপডেট
    document.getElementById('total-paid').innerText = `₹${totalPaid}`;
    document.getElementById('total-pending').innerText = `₹${totalPending}`;
    document.getElementById('unpaid-members-count').innerText = `${unpaidCount} জন`;
}

function filterTable() {
    const filter = document.getElementById('search-member').value.toLowerCase();
    const rows = document.getElementById('member-list-body').getElementsByTagName('tr');

    for (let row of rows) {
        const nameText = row.getElementsByTagName('td')[0]?.innerText.toLowerCase() || '';
        const addressText = row.getElementsByTagName('td')[1]?.innerText.toLowerCase() || '';
        row.style.display = (nameText.includes(filter) || addressText.includes(filter)) ? '' : 'none';
    }
}