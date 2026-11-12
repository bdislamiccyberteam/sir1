/**
 * ==========================================================================
 * THE ENGLISH LANGUAGE ACADEMY | JAFOR IQBAL
 * Official Admin Panel JavaScript
 * ==========================================================================
 */

let currentTab = 'dashboard';
let editingItemId = null;
let currentSelectedOrderId = null;
let currentSelectedAdmissionId = null;

document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    initApp();
});

// ===== 1. AUTHENTICATION (USERNAME & PASSWORD SUPPORT) =====
function checkAuth() {
    const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
    const loginWrapper = document.getElementById('loginWrapper');
    const appWrapper = document.getElementById('appWrapper');
    const userDisplay = document.getElementById('adminLoggedInUserDisplay');

    const currentUsername = localStorage.getItem('admin_username') || 'admin';
    if (userDisplay) {
        userDisplay.textContent = `👤 ${currentUsername}`;
    }

    if (isLoggedIn) {
        if (loginWrapper) loginWrapper.style.display = 'none';
        if (appWrapper) appWrapper.style.display = 'flex';
        loadDashboardData();
    } else {
        if (loginWrapper) loginWrapper.style.display = 'flex';
        if (appWrapper) appWrapper.style.display = 'none';
    }
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();

    const storedUser = localStorage.getItem('admin_username') || 'admin';
    const storedPass = localStorage.getItem('admin_password') || 'admin123';

    if (user === storedUser && pass === storedPass) {
        localStorage.setItem('admin_logged_in', 'true');
        showToast(`✓ স্বাগতম ${storedUser}! ড্যাশবোর্ডে প্রবেশ সফল হয়েছে।`);
        checkAuth();
    } else {
        const errorEl = document.getElementById('loginError');
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.textContent = 'ভুল ইউজারনেম বা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।';
        }
    }
}

function handleLogout() {
    if (confirm('আপনি কি নিশ্চিত যে অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?')) {
        localStorage.removeItem('admin_logged_in');
        checkAuth();
    }
}

// ===== 2. INITIALIZATION & ROUTING =====
function initApp() {
    document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    const toggleBtn = document.getElementById('mobileNavToggle');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }

    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAllModals();
        });
    });
}

function switchTab(tab) {
    currentTab = tab;

    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-tab') === tab);
    });

    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.style.display = panel.id === `panel-${tab}` ? 'block' : 'none';
    });

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    switch (tab) {
        case 'dashboard': loadDashboardData(); break;
        case 'hero': loadHeroForm(); break;
        case 'teacher': loadTeacherForm(); break;
        case 'orders': loadOrdersTable(); break;
        case 'admissions': loadAdmissionsTable(); break;
        case 'notices': loadNoticesTable(); break;
        case 'courses': loadCoursesTable(); break;
        case 'books': loadBooksTable(); break;
        case 'videos': loadVideosTable(); break;
        case 'gallery': loadGalleryTable(); break;
        case 'about': loadAcademyForm(); break;
        case 'contact': loadContactSettings(); break;
        case 'messages': loadMessagesTable(); break;
        case 'settings': loadSettingsView(); break;
    }
}

// ===== 3. DASHBOARD METRICS & RECENT TABLES =====
function loadDashboardData() {
    const orders = JSON.parse(localStorage.getItem('portfolio_book_orders') || '[]');
    const admissions = JSON.parse(localStorage.getItem('portfolio_admissions') || '[]');
    const courses = JSON.parse(localStorage.getItem('portfolio_courses') || '[]');
    const books = JSON.parse(localStorage.getItem('portfolio_books') || '[]');
    const videos = JSON.parse(localStorage.getItem('portfolio_videos') || '[]');
    const gallery = JSON.parse(localStorage.getItem('portfolio_gallery') || '[]');
    const notices = JSON.parse(localStorage.getItem('portfolio_notices') || '[]');

    document.getElementById('metricOrders').textContent = orders.length;
    document.getElementById('metricAdmissions').textContent = admissions.length;
    document.getElementById('metricCourses').textContent = courses.length;
    document.getElementById('metricBooks').textContent = books.length;
    document.getElementById('metricVideos').textContent = videos.length;
    document.getElementById('metricNotices').textContent = notices.length;

    // Badges in Sidebar
    const badgeOrder = document.getElementById('badgeOrderCount');
    if (badgeOrder) {
        const pendingOrders = orders.filter(o => o.status === 'পেন্ডিং' || o.status === 'Pending').length;
        if (pendingOrders > 0) {
            badgeOrder.style.display = 'inline-block';
            badgeOrder.textContent = pendingOrders;
        } else {
            badgeOrder.style.display = 'none';
        }
    }

    const badgeAdm = document.getElementById('badgeAdmCount');
    if (badgeAdm) {
        const newAdmissions = admissions.filter(a => a.status === 'নতুন আবেদন' || a.status === 'New').length;
        if (newAdmissions > 0) {
            badgeAdm.style.display = 'inline-block';
            badgeAdm.textContent = newAdmissions;
        } else {
            badgeAdm.style.display = 'none';
        }
    }

    // Recent Orders (First 5)
    const recentOrdersBody = document.getElementById('recentOrdersTableBody');
    if (recentOrdersBody) {
        if (orders.length === 0) {
            recentOrdersBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888; padding: 20px;">এখনও কোনো বইয়ের অর্ডার আসেনি।</td></tr>`;
        } else {
            recentOrdersBody.innerHTML = orders.slice(0, 5).map(o => {
                const cleanPhone = (o.customerPhone || '').replace(/[^0-9]/g, '');
                return `
                    <tr>
                        <td><strong>#${escapeHtml(o.orderId)}</strong></td>
                        <td>
                            <strong>${escapeHtml(o.customerName)}</strong><br>
                            <small>${escapeHtml(o.customerPhone)}</small>
                        </td>
                        <td>${escapeHtml(o.bookTitle)}</td>
                        <td>${escapeHtml(String(o.quantity))} কপি — <strong>৳${escapeHtml(String(o.totalAmount))}</strong></td>
                        <td><span class="status-pill status-${getStatusClass(o.status)}">${escapeHtml(o.status)}</span></td>
                        <td>
                            <div class="action-btn-group">
                                <a href="tel:${cleanPhone}" class="btn-contact-quick btn-quick-call" title="কল দিন">📞</a>
                                <a href="https://wa.me/88${cleanPhone}" target="_blank" class="btn-contact-quick btn-quick-wa" title="WhatsApp বার্তা">💬</a>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Recent Admissions (First 5)
    const recentAdmBody = document.getElementById('recentAdmissionsTableBody');
    if (recentAdmBody) {
        if (admissions.length === 0) {
            recentAdmBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888; padding: 20px;">এখনও কোনো ভর্তি আবেদন আসেনি।</td></tr>`;
        } else {
            recentAdmBody.innerHTML = admissions.slice(0, 5).map(a => {
                const cleanPhone = (a.phone || '').replace(/[^0-9]/g, '');
                return `
                    <tr>
                        <td><strong>#${escapeHtml(a.rollId)}</strong></td>
                        <td>
                            <strong>${escapeHtml(a.name)}</strong><br>
                            <small>${escapeHtml(a.phone)}</small>
                        </td>
                        <td><small>পিতা: ${escapeHtml(a.fatherName || '-')}<br>মাতা: ${escapeHtml(a.motherName || '-')}</small></td>
                        <td>${escapeHtml(a.course)}</td>
                        <td><span class="status-pill status-${getStatusClass(a.status)}">${escapeHtml(a.status)}</span></td>
                        <td>
                            <div class="action-btn-group">
                                <a href="tel:${cleanPhone}" class="btn-contact-quick btn-quick-call" title="কল দিন">📞</a>
                                <a href="https://wa.me/88${cleanPhone}" target="_blank" class="btn-contact-quick btn-quick-wa" title="WhatsApp বার্তা">💬</a>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }
}

// ===== 4. HERO SECTION FORM =====
function loadHeroForm() {
    const hero = JSON.parse(localStorage.getItem('portfolio_hero') || '{}');
    document.getElementById('heroNameInput').value = hero.name || 'Writer – Jafor Iqbal';
    document.getElementById('heroBadgeInput').value = hero.badge || '✦ The English Language Academy · Founder & CEO';
    document.getElementById('heroSubtitleInput').value = hero.subtitle || '';
    document.getElementById('heroTypingInput').value = hero.typingPhrases || '';
    document.getElementById('heroBgInput').value = hero.bgImage || 'images/sir_pic_2.jpg';
    document.getElementById('heroBgPreview').src = hero.bgImage || 'images/sir_pic_2.jpg';
}

function handleHeroSubmit(e) {
    e.preventDefault();
    const hero = {
        name: document.getElementById('heroNameInput').value.trim(),
        badge: document.getElementById('heroBadgeInput').value.trim(),
        subtitle: document.getElementById('heroSubtitleInput').value.trim(),
        typingPhrases: document.getElementById('heroTypingInput').value.trim(),
        bgImage: document.getElementById('heroBgInput').value.trim() || 'images/sir_pic_2.jpg'
    };

    localStorage.setItem('portfolio_hero', JSON.stringify(hero));
    showToast('✓ হোমপেজ ও ব্যানার তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
}

// ===== 5. TEACHER INFO FORM =====
function loadTeacherForm() {
    const teacher = JSON.parse(localStorage.getItem('portfolio_teacher') || '{}');

    document.getElementById('teacherPhotoInput').value = teacher.photo || 'images/sir_pic_1.jpg';
    document.getElementById('teacherPhotoPreview').src = teacher.photo || 'images/sir_pic_1.jpg';
    document.getElementById('teacherNameInput').value = teacher.name || 'Writer – Jafor Iqbal';
    document.getElementById('teacherVerifiedInput').value = teacher.verifiedBadge || 'Verified Educator & Author';

    const roles = Array.isArray(teacher.roles) ? teacher.roles.join('\n') : (teacher.roles || '');
    document.getElementById('teacherRolesInput').value = roles;

    const quals = Array.isArray(teacher.qualifications) ? teacher.qualifications.join('\n') : (teacher.qualifications || '');
    document.getElementById('teacherQualificationsInput').value = quals;

    const exps = Array.isArray(teacher.experience) ? teacher.experience.join('\n') : (teacher.experience || '');
    document.getElementById('teacherExperiencesInput').value = exps;

    const skills = Array.isArray(teacher.skills) ? teacher.skills.join(', ') : (teacher.skills || '');
    document.getElementById('teacherSkillsInput').value = skills;

    document.getElementById('teacherFbInput').value = teacher.fbProfile || '';
    document.getElementById('teacherFbPageInput').value = teacher.fbPage || '';
    document.getElementById('teacherWaInput').value = teacher.whatsapp || '';
}

function handleTeacherSubmit(e) {
    e.preventDefault();

    const photo = document.getElementById('teacherPhotoInput').value.trim() || 'images/sir_pic_1.jpg';
    const name = document.getElementById('teacherNameInput').value.trim();
    const verifiedBadge = document.getElementById('teacherVerifiedInput').value.trim();

    const roles = document.getElementById('teacherRolesInput').value.split('\n').map(s => s.trim()).filter(s => s);
    const qualifications = document.getElementById('teacherQualificationsInput').value.split('\n').map(s => s.trim()).filter(s => s);
    const experience = document.getElementById('teacherExperiencesInput').value.split('\n').map(s => s.trim()).filter(s => s);
    const skills = document.getElementById('teacherSkillsInput').value.split(',').map(s => s.trim()).filter(s => s);

    const fbProfile = document.getElementById('teacherFbInput').value.trim();
    const fbPage = document.getElementById('teacherFbPageInput').value.trim();
    const whatsapp = document.getElementById('teacherWaInput').value.trim();

    const teacher = {
        name,
        verifiedBadge,
        photo,
        roles,
        qualifications,
        experience,
        skills,
        fbProfile,
        fbPage,
        whatsapp
    };

    localStorage.setItem('portfolio_teacher', JSON.stringify(teacher));
    showToast('✓ শিক্ষক পরিচিতি সফলভাবে আপডেট করা হয়েছে!');
}

// ===== 6. BOOK ORDERS MANAGEMENT =====
function loadOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    const orders = JSON.parse(localStorage.getItem('portfolio_book_orders') || '[]');
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #888; padding: 30px;">কোনো বইয়ের অর্ডার নেই।</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => {
        const cleanPhone = (o.customerPhone || '').replace(/[^0-9]/g, '');
        return `
            <tr>
                <td><strong>#${escapeHtml(o.orderId)}</strong></td>
                <td><small>${escapeHtml(o.date)}</small></td>
                <td>
                    <strong>${escapeHtml(o.customerName)}</strong><br>
                    <small>${escapeHtml(o.customerPhone)}</small>
                </td>
                <td style="max-width: 180px; font-size: 0.85rem;">${escapeHtml(o.customerAddress)}</td>
                <td>${escapeHtml(o.bookTitle)}</td>
                <td style="text-align: center;"><strong>${escapeHtml(String(o.quantity))}</strong></td>
                <td><strong>৳${escapeHtml(String(o.totalAmount))}</strong></td>
                <td>
                    <span class="status-pill status-${getStatusClass(o.status)}">${escapeHtml(o.status)}</span>
                </td>
                <td>
                    <div class="action-btn-group">
                        <a href="tel:${cleanPhone}" class="btn-contact-quick btn-quick-call" title="কল দিন">📞</a>
                        <a href="https://wa.me/88${cleanPhone}" target="_blank" class="btn-contact-quick btn-quick-wa" title="WhatsApp বার্তা">💬</a>
                        <button class="btn btn-sm btn-gold" onclick="openOrderStatusModal('${escapeHtml(o.orderId)}')">স্ট্যাটাস</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteOrder('${escapeHtml(o.orderId)}')">ডিলিট</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openOrderStatusModal(orderId) {
    currentSelectedOrderId = orderId;
    const orders = JSON.parse(localStorage.getItem('portfolio_book_orders') || '[]');
    const o = orders.find(item => item.orderId === orderId);
    if (o) {
        document.getElementById('selectOrderStatus').value = o.status;
        document.getElementById('orderStatusModal').classList.add('active');
    }
}

function saveOrderStatus() {
    if (!currentSelectedOrderId) return;
    const newStatus = document.getElementById('selectOrderStatus').value;
    const orders = JSON.parse(localStorage.getItem('portfolio_book_orders') || '[]');
    const o = orders.find(item => item.orderId === currentSelectedOrderId);
    if (o) {
        o.status = newStatus;
        localStorage.setItem('portfolio_book_orders', JSON.stringify(orders));
        closeAllModals();
        loadOrdersTable();
        loadDashboardData();
        showToast(`✓ অর্ডার #${currentSelectedOrderId} স্ট্যাটাস পরিবর্তন হয়েছে: ${newStatus}`);
    }
}

function deleteOrder(orderId) {
    if (confirm(`আপনি কি নিশ্চিত যে #${orderId} অর্ডারটি ডিলিট করতে চান? এই প্রক্রিয়াটি আনডু করা যাবে না।`)) {
        let orders = JSON.parse(localStorage.getItem('portfolio_book_orders') || '[]');
        orders = orders.filter(o => o.orderId !== orderId);
        localStorage.setItem('portfolio_book_orders', JSON.stringify(orders));
        loadOrdersTable();
        loadDashboardData();
        showToast('✓ অর্ডারটি সফলভাবে ডিলিট করা হয়েছে।');
    }
}

// ===== 7. ADMISSIONS MANAGEMENT (পিতা-মাতার নামসহ) =====
function loadAdmissionsTable() {
    const tbody = document.getElementById('admissionsTableBody');
    if (!tbody) return;

    const admissions = JSON.parse(localStorage.getItem('portfolio_admissions') || '[]');
    if (admissions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: #888; padding: 30px;">কোনো ভর্তি আবেদন নেই।</td></tr>`;
        return;
    }

    tbody.innerHTML = admissions.map(a => {
        const cleanPhone = (a.phone || '').replace(/[^0-9]/g, '');
        return `
            <tr>
                <td><strong>#${escapeHtml(a.rollId)}</strong></td>
                <td><small>${escapeHtml(a.date)}</small></td>
                <td>
                    <strong>${escapeHtml(a.name)}</strong><br>
                    <small>${escapeHtml(a.phone)}</small>
                </td>
                <td>
                    <small>
                        <strong>পিতা:</strong> ${escapeHtml(a.fatherName || '-')}<br>
                        <strong>মাতা:</strong> ${escapeHtml(a.motherName || '-')}
                    </small>
                </td>
                <td><small>${escapeHtml(a.email || '-')}</small></td>
                <td><strong>${escapeHtml(a.course)}</strong></td>
                <td style="max-width: 140px; font-size: 0.85rem;">${escapeHtml(a.address)}</td>
                <td style="max-width: 140px; font-size: 0.85rem;">${escapeHtml(a.notes || '-')}</td>
                <td>
                    <span class="status-pill status-${getStatusClass(a.status)}">${escapeHtml(a.status)}</span>
                </td>
                <td>
                    <div class="action-btn-group">
                        <a href="tel:${cleanPhone}" class="btn-contact-quick btn-quick-call" title="কল দিন">📞</a>
                        <a href="https://wa.me/88${cleanPhone}" target="_blank" class="btn-contact-quick btn-quick-wa" title="WhatsApp বার্তা">💬</a>
                        <button class="btn btn-sm btn-primary" onclick="openAdmissionStatusModal('${escapeHtml(a.rollId)}')">অনুমোদন</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAdmission('${escapeHtml(a.rollId)}')">ডিলিট</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openAdmissionStatusModal(rollId) {
    currentSelectedAdmissionId = rollId;
    const admissions = JSON.parse(localStorage.getItem('portfolio_admissions') || '[]');
    const a = admissions.find(item => item.rollId === rollId);
    if (a) {
        document.getElementById('selectAdmissionStatus').value = a.status;
        document.getElementById('admissionStatusModal').classList.add('active');
    }
}

function saveAdmissionStatus() {
    if (!currentSelectedAdmissionId) return;
    const newStatus = document.getElementById('selectAdmissionStatus').value;
    const admissions = JSON.parse(localStorage.getItem('portfolio_admissions') || '[]');
    const a = admissions.find(item => item.rollId === currentSelectedAdmissionId);
    if (a) {
        a.status = newStatus;
        localStorage.setItem('portfolio_admissions', JSON.stringify(admissions));
        closeAllModals();
        loadAdmissionsTable();
        loadDashboardData();
        showToast(`✓ ভর্তি আবেদন #${currentSelectedAdmissionId} স্ট্যাটাস পরিবর্তন: ${newStatus}`);
    }
}

function deleteAdmission(rollId) {
    if (confirm(`আপনি কি নিশ্চিত যে #${rollId} ভর্তি আবেদনটি ডিলিট করতে চান?`)) {
        let admissions = JSON.parse(localStorage.getItem('portfolio_admissions') || '[]');
        admissions = admissions.filter(a => a.rollId !== rollId);
        localStorage.setItem('portfolio_admissions', JSON.stringify(admissions));
        loadAdmissionsTable();
        loadDashboardData();
        showToast('✓ ভর্তি আবেদনটি ডিলিট করা হয়েছে।');
    }
}

// ===== 8. NOTICES & ADMISSION CIRCULARS =====
function loadNoticesTable() {
    const tbody = document.getElementById('noticesTableBody');
    if (!tbody) return;

    const notices = JSON.parse(localStorage.getItem('portfolio_notices') || '[]');
    if (notices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888; padding: 25px;">কোনো নোটিশ যোগ করা হয়নি।</td></tr>`;
        return;
    }

    tbody.innerHTML = notices.map((n, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><span class="status-pill status-confirmed">${escapeHtml(n.category || 'নোটিশ')}</span></td>
            <td>
                <strong>${escapeHtml(n.title)}</strong><br>
                <small style="color: #666;">${escapeHtml(n.details || '')}</small>
            </td>
            <td>${escapeHtml(n.date || '-')}</td>
            <td style="text-align: center;">
                ${n.activeTopBar ? '<span style="color: #27ae60; font-weight: bold;">✓ সক্রিয়</span>' : '<span style="color: #888;">নিষ্ক্রিয়</span>'}
            </td>
            <td>
                <div class="action-btn-group">
                    <button class="btn btn-sm btn-primary" onclick="editNotice(${n.id})">এডিট</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteNotice(${n.id})">ডিলিট</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddNoticeModal() {
    editingItemId = null;
    document.getElementById('noticeModalTitle').textContent = 'নতুন নোটিশ / ভর্তি বিজ্ঞপ্তি যোগ করুন';
    document.getElementById('noticeForm').reset();
    document.getElementById('noticeActiveTopBar').checked = true;
    document.getElementById('noticeModal').classList.add('active');
}

function editNotice(id) {
    const notices = JSON.parse(localStorage.getItem('portfolio_notices') || '[]');
    const n = notices.find(item => item.id === id);
    if (!n) return;

    editingItemId = id;
    document.getElementById('noticeModalTitle').textContent = 'নোটিশ এডিট করুন';
    document.getElementById('noticeTitle').value = n.title || '';
    document.getElementById('noticeCategory').value = n.category || 'ভর্তি বিজ্ঞপ্তি';
    document.getElementById('noticeDate').value = n.date || '';
    document.getElementById('noticeSeats').value = n.seats || '';
    document.getElementById('noticeFee').value = n.fee || '';
    document.getElementById('noticeDetails').value = n.details || '';
    document.getElementById('noticeActiveTopBar').checked = !!n.activeTopBar;

    document.getElementById('noticeModal').classList.add('active');
}

function handleNoticeSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('noticeTitle').value.trim();
    const category = document.getElementById('noticeCategory').value;
    const date = document.getElementById('noticeDate').value.trim();
    const seats = document.getElementById('noticeSeats').value.trim();
    const fee = document.getElementById('noticeFee').value.trim();
    const details = document.getElementById('noticeDetails').value.trim();
    const activeTopBar = document.getElementById('noticeActiveTopBar').checked;

    let notices = JSON.parse(localStorage.getItem('portfolio_notices') || '[]');

    if (activeTopBar) {
        notices.forEach(n => n.activeTopBar = false);
    }

    if (editingItemId) {
        const item = notices.find(n => n.id === editingItemId);
        if (item) {
            item.title = title;
            item.category = category;
            item.date = date;
            item.seats = seats;
            item.fee = fee;
            item.details = details;
            item.activeTopBar = activeTopBar;
        }
    } else {
        notices.unshift({
            id: Date.now(),
            title,
            category,
            date,
            seats,
            fee,
            details,
            activeTopBar
        });
    }

    localStorage.setItem('portfolio_notices', JSON.stringify(notices));
    closeAllModals();
    loadNoticesTable();
    loadDashboardData();
    showToast('✓ নোটিশ সফলভাবে সংরক্ষিত হয়েছে!');
}

function deleteNotice(id) {
    if (confirm('আপনি কি এই নোটিশটি ডিলিট করতে চান?')) {
        let notices = JSON.parse(localStorage.getItem('portfolio_notices') || '[]');
        notices = notices.filter(n => n.id !== id);
        localStorage.setItem('portfolio_notices', JSON.stringify(notices));
        loadNoticesTable();
        loadDashboardData();
        showToast('✓ নোটিশ ডিলিট করা হয়েছে।');
    }
}

// ===== 9. COURSES CRUD =====
function loadCoursesTable() {
    const tbody = document.getElementById('coursesTableBody');
    if (!tbody) return;

    const courses = JSON.parse(localStorage.getItem('portfolio_courses') || '[]');
    if (courses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888; padding: 25px;">কোনো কোর্স পাওয়া যায়নি।</td></tr>`;
        return;
    }

    tbody.innerHTML = courses.map((c, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><strong>${escapeHtml(c.title)}</strong></td>
            <td><strong>${escapeHtml(c.fee)}</strong></td>
            <td>${escapeHtml(c.duration)}</td>
            <td>${escapeHtml(c.batch || '-')}</td>
            <td>
                <div class="action-btn-group">
                    <button class="btn btn-sm btn-primary" onclick="editCourse(${c.id})">এডিট</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCourse(${c.id})">ডিলিট</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddCourseModal() {
    editingItemId = null;
    document.getElementById('courseModalTitle').textContent = 'নতুন কোর্স যোগ করুন';
    document.getElementById('courseForm').reset();
    document.getElementById('courseModal').classList.add('active');
}

function editCourse(id) {
    const courses = JSON.parse(localStorage.getItem('portfolio_courses') || '[]');
    const c = courses.find(item => item.id === id);
    if (!c) return;

    editingItemId = id;
    document.getElementById('courseModalTitle').textContent = 'কোর্স এডিট করুন';
    document.getElementById('courseTitle').value = c.title || '';
    document.getElementById('courseFee').value = c.fee || '';
    document.getElementById('courseDuration').value = c.duration || '';
    document.getElementById('courseBatch').value = c.batch || '';
    document.getElementById('courseDesc').value = c.desc || '';
    document.getElementById('courseFeatures').value = Array.isArray(c.features) ? c.features.join('\n') : '';

    document.getElementById('courseModal').classList.add('active');
}

function handleCourseSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('courseTitle').value.trim();
    const fee = document.getElementById('courseFee').value.trim();
    const duration = document.getElementById('courseDuration').value.trim();
    const batch = document.getElementById('courseBatch').value.trim();
    const desc = document.getElementById('courseDesc').value.trim();
    const features = document.getElementById('courseFeatures').value.split('\n').map(f => f.trim()).filter(f => f);

    let courses = JSON.parse(localStorage.getItem('portfolio_courses') || '[]');

    if (editingItemId) {
        const item = courses.find(c => c.id === editingItemId);
        if (item) {
            item.title = title;
            item.fee = fee;
            item.duration = duration;
            item.batch = batch;
            item.desc = desc;
            item.features = features;
        }
    } else {
        courses.push({
            id: Date.now(),
            title,
            fee,
            duration,
            batch,
            desc,
            features
        });
    }

    localStorage.setItem('portfolio_courses', JSON.stringify(courses));
    closeAllModals();
    loadCoursesTable();
    loadDashboardData();
    showToast('✓ কোর্স সফলভাবে সংরক্ষিত হয়েছে!');
}

function deleteCourse(id) {
    if (confirm('আপনি কি এই কোর্সটি ডিলিট করতে চান?')) {
        let courses = JSON.parse(localStorage.getItem('portfolio_courses') || '[]');
        courses = courses.filter(c => c.id !== id);
        localStorage.setItem('portfolio_courses', JSON.stringify(courses));
        loadCoursesTable();
        loadDashboardData();
        showToast('✓ কোর্স ডিলিট করা হয়েছে।');
    }
}

// ===== 10. BOOKS & PRICING CRUD =====
function loadBooksTable() {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;

    const books = JSON.parse(localStorage.getItem('portfolio_books') || '[]');
    if (books.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888; padding: 25px;">কোনো বই যোগ করা হয়নি।</td></tr>`;
        return;
    }

    tbody.innerHTML = books.map((b, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><img src="${escapeHtml(b.cover || 'images/hero-photo.jpg')}" style="width: 45px; height: 60px; object-fit: cover; border-radius: 4px;"></td>
            <td><strong>${escapeHtml(b.title)}</strong></td>
            <td>${escapeHtml(b.author || 'জাফর ইকবাল')}</td>
            <td><strong style="color: #b3882f; font-size: 1.05rem;">৳${escapeHtml(String(b.price || '450'))}</strong></td>
            <td>
                <div class="action-btn-group">
                    <button class="btn btn-sm btn-primary" onclick="editBook(${b.id})">এডিট</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBook(${b.id})">ডিলিট</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddBookModal() {
    editingItemId = null;
    document.getElementById('bookModalTitle').textContent = 'নতুন বই যোগ করুন';
    document.getElementById('bookForm').reset();
    document.getElementById('bookCoverInput').value = 'images/hero-photo.jpg';
    document.getElementById('bookCoverPreview').src = 'images/hero-photo.jpg';
    document.getElementById('bookModal').classList.add('active');
}

function editBook(id) {
    const books = JSON.parse(localStorage.getItem('portfolio_books') || '[]');
    const b = books.find(item => item.id === id);
    if (!b) return;

    editingItemId = id;
    document.getElementById('bookModalTitle').textContent = 'বই ও দাম এডিট';
    document.getElementById('bookTitle').value = b.title || '';
    document.getElementById('bookAuthor').value = b.author || 'জাফর ইকবাল';
    document.getElementById('bookPrice').value = b.price || 450;
    document.getElementById('bookCoverInput').value = b.cover || 'images/hero-photo.jpg';
    document.getElementById('bookCoverPreview').src = b.cover || 'images/hero-photo.jpg';
    document.getElementById('bookDesc').value = b.desc || '';
    document.getElementById('bookTags').value = b.tags || '';

    document.getElementById('bookModal').classList.add('active');
}

function handleBookSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const price = Number(document.getElementById('bookPrice').value) || 450;
    const cover = document.getElementById('bookCoverInput').value.trim() || 'images/hero-photo.jpg';
    const desc = document.getElementById('bookDesc').value.trim();
    const tags = document.getElementById('bookTags').value.trim();

    let books = JSON.parse(localStorage.getItem('portfolio_books') || '[]');

    if (editingItemId) {
        const item = books.find(b => b.id === editingItemId);
        if (item) {
            item.title = title;
            item.author = author;
            item.price = price;
            item.cover = cover;
            item.desc = desc;
            item.tags = tags;
        }
    } else {
        books.push({
            id: Date.now(),
            title,
            author,
            price,
            cover,
            desc,
            tags
        });
    }

    localStorage.setItem('portfolio_books', JSON.stringify(books));
    closeAllModals();
    loadBooksTable();
    showToast('✓ বই ও দাম সফলভাবে সংরক্ষিত হয়েছে!');
}

function deleteBook(id) {
    if (confirm('আপনি কি এই বইটি তালিকা থেকে মুছে ফেলতে চান?')) {
        let books = JSON.parse(localStorage.getItem('portfolio_books') || '[]');
        books = books.filter(b => b.id !== id);
        localStorage.setItem('portfolio_books', JSON.stringify(books));
        loadBooksTable();
        showToast('✓ বইটি মুছে ফেলা হয়েছে।');
    }
}

// ===== 11. VIDEOS MANAGEMENT (AUTO-DETECT YOUTUBE & FACEBOOK) =====
function loadVideosTable(filterList = null) {
    const tbody = document.getElementById('videosTableBody');
    if (!tbody) return;

    const videos = filterList || JSON.parse(localStorage.getItem('portfolio_videos') || '[]');
    if (videos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888; padding: 25px;">কোনো ভিডিও পাওয়া যায়নি।</td></tr>`;
        return;
    }

    tbody.innerHTML = videos.map((v, idx) => {
        const isYT = v.platform === 'youtube';
        return `
            <tr>
                <td>${idx + 1}</td>
                <td>
                    <span class="platform-pill ${isYT ? 'youtube' : 'facebook'}">
                        ${isYT ? '▶ YouTube' : '📘 Facebook'}
                    </span>
                </td>
                <td>
                    <strong>${escapeHtml(v.title)}</strong><br>
                    <small style="color: #888;">${escapeHtml(v.category || '')}</small>
                </td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <a href="${escapeHtml(v.url)}" target="_blank" style="color: var(--info); font-size: 0.85rem;">${escapeHtml(v.url)}</a>
                </td>
                <td>
                    <div class="action-btn-group">
                        <button class="btn btn-sm btn-primary" onclick="editVideo(${v.id})">এডিট</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteVideo(${v.id})">ডিলিট</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterAdminVideos() {
    const query = (document.getElementById('adminVideoSearch').value || '').toLowerCase().trim();
    const platform = document.getElementById('adminVideoFilterSelect').value;

    const allVideos = JSON.parse(localStorage.getItem('portfolio_videos') || '[]');
    let filtered = allVideos;

    if (platform !== 'all') {
        filtered = filtered.filter(v => v.platform === platform);
    }
    if (query) {
        filtered = filtered.filter(v => 
            (v.title && v.title.toLowerCase().includes(query)) ||
            (v.category && v.category.toLowerCase().includes(query))
        );
    }
    loadVideosTable(filtered);
}

function openAddVideoModal() {
    editingItemId = null;
    document.getElementById('videoModalTitle').textContent = 'নতুন ভিডিও যোগ করুন';
    document.getElementById('videoForm').reset();
    document.getElementById('videoDetectBadge').style.display = 'none';
    document.getElementById('videoPreviewBox').style.display = 'none';
    document.getElementById('videoModal').classList.add('active');
}

function editVideo(id) {
    const videos = JSON.parse(localStorage.getItem('portfolio_videos') || '[]');
    const v = videos.find(item => item.id === id);
    if (!v) return;

    editingItemId = id;
    document.getElementById('videoModalTitle').textContent = 'ভিডিও এডিট করুন';
    document.getElementById('videoUrl').value = v.url || '';
    document.getElementById('videoPlatform').value = v.platform || 'youtube';
    document.getElementById('videoCategory').value = v.category || 'Spoken English';
    document.getElementById('videoTitle').value = v.title || '';
    document.getElementById('videoDesc').value = v.desc || '';

    handleVideoUrlAutoDetect();
    document.getElementById('videoModal').classList.add('active');
}

function handleVideoUrlAutoDetect() {
    const urlInput = document.getElementById('videoUrl').value.trim();
    const badge = document.getElementById('videoDetectBadge');
    const platformSelect = document.getElementById('videoPlatform');
    const previewBox = document.getElementById('videoPreviewBox');
    const previewContainer = document.getElementById('videoPreviewContainer');

    if (!urlInput) {
        badge.style.display = 'none';
        previewBox.style.display = 'none';
        return;
    }

    let detectedPlatform = null;
    let embedUrl = urlInput;

    const ytMatch = urlInput.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (ytMatch && ytMatch[1]) {
        detectedPlatform = 'youtube';
        embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    const fbMatch = urlInput.match(/(?:facebook\.com\/(?:.+?\/videos\/|watch\/\?v=|video\.php\?v=)|fb\.watch\/)/i);
    if (fbMatch) {
        detectedPlatform = 'facebook';
        if (!urlInput.includes('facebook.com/plugins/video.php')) {
            embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(urlInput)}&show_text=false`;
        }
    }

    if (detectedPlatform === 'youtube') {
        platformSelect.value = 'youtube';
        badge.className = 'video-detect-indicator yt';
        badge.style.display = 'flex';
        badge.innerHTML = `<span>✓</span> <strong>YouTube ভিডিও স্বয়ংক্রিয়ভাবে শনাক্ত হয়েছে!</strong>`;
        
        previewContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen></iframe>`;
        previewBox.style.display = 'block';
    } else if (detectedPlatform === 'facebook') {
        platformSelect.value = 'facebook';
        badge.className = 'video-detect-indicator fb';
        badge.style.display = 'flex';
        badge.innerHTML = `<span>✓</span> <strong>Facebook ভিডিও স্বয়ংক্রিয়ভাবে শনাক্ত হয়েছে!</strong>`;
        
        previewContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen></iframe>`;
        previewBox.style.display = 'block';
    } else {
        badge.style.display = 'none';
        if (urlInput.startsWith('http')) {
            previewContainer.innerHTML = `<iframe src="${urlInput}" allowfullscreen></iframe>`;
            previewBox.style.display = 'block';
        } else {
            previewBox.style.display = 'none';
        }
    }
}

function handleVideoSubmit(e) {
    e.preventDefault();

    let url = document.getElementById('videoUrl').value.trim();
    let platform = document.getElementById('videoPlatform').value;
    const title = document.getElementById('videoTitle').value.trim();
    const category = document.getElementById('videoCategory').value.trim();
    const desc = document.getElementById('videoDesc').value.trim();

    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (ytMatch && ytMatch[1]) {
        platform = 'youtube';
        url = `https://www.youtube.com/embed/${ytMatch[1]}`;
    } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
        platform = 'facebook';
        if (!url.includes('facebook.com/plugins/video.php')) {
            url = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
        }
    }

    let videos = JSON.parse(localStorage.getItem('portfolio_videos') || '[]');

    if (editingItemId) {
        const item = videos.find(v => v.id === editingItemId);
        if (item) {
            item.platform = platform;
            item.title = title;
            item.url = url;
            item.category = category;
            item.desc = desc;
        }
    } else {
        videos.unshift({
            id: Date.now(),
            platform,
            title,
            url,
            category,
            desc
        });
    }

    localStorage.setItem('portfolio_videos', JSON.stringify(videos));
    closeAllModals();
    loadVideosTable();
    loadDashboardData();
    showToast('✓ ভিডিও সফলভাবে সংরক্ষিত হয়েছে!');
}

function deleteVideo(id) {
    if (confirm('আপনি কি এই ভিডিওটি ডিলিট করতে চান?')) {
        let videos = JSON.parse(localStorage.getItem('portfolio_videos') || '[]');
        videos = videos.filter(v => v.id !== id);
        localStorage.setItem('portfolio_videos', JSON.stringify(videos));
        loadVideosTable();
        loadDashboardData();
        showToast('✓ ভিডিও মুছে ফেলা হয়েছে।');
    }
}

// ===== 12. GALLERY MANAGEMENT =====
function loadGalleryTable() {
    const tbody = document.getElementById('galleryTableBody');
    if (!tbody) return;

    const gallery = JSON.parse(localStorage.getItem('portfolio_gallery') || '[]');
    if (gallery.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888; padding: 25px;">কোনো ছবি নেই।</td></tr>`;
        return;
    }

    tbody.innerHTML = gallery.map((item, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><img src="${escapeHtml(item.image)}" style="width: 70px; height: 50px; object-fit: cover; border-radius: 6px;"></td>
            <td><strong>${escapeHtml(item.caption)}</strong></td>
            <td>${escapeHtml(item.category || '-')}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteGalleryItem(${item.id})">ডিলিট</button>
            </td>
        </tr>
    `).join('');
}

function openAddGalleryModal() {
    editingItemId = null;
    document.getElementById('galleryForm').reset();
    document.getElementById('galleryImgInput').value = 'images/sir_pic_3.jpg';
    document.getElementById('galleryImgPreview').src = 'images/sir_pic_3.jpg';
    document.getElementById('galleryModal').classList.add('active');
}

function handleGallerySubmit(e) {
    e.preventDefault();

    const image = document.getElementById('galleryImgInput').value.trim() || 'images/sir_pic_3.jpg';
    const caption = document.getElementById('galleryCaption').value.trim();
    const category = document.getElementById('galleryCategory').value.trim();

    const gallery = JSON.parse(localStorage.getItem('portfolio_gallery') || '[]');
    gallery.unshift({
        id: Date.now(),
        image,
        caption,
        category
    });

    localStorage.setItem('portfolio_gallery', JSON.stringify(gallery));
    closeAllModals();
    loadGalleryTable();
    loadDashboardData();
    showToast('✓ গ্যালারিতে ছবি সফলভাবে যোগ হয়েছে!');
}

function deleteGalleryItem(id) {
    if (confirm('আপনি কি এই ছবিটি গ্যালারি থেকে মুছে ফেলতে চান?')) {
        let gallery = JSON.parse(localStorage.getItem('portfolio_gallery') || '[]');
        gallery = gallery.filter(g => g.id !== id);
        localStorage.setItem('portfolio_gallery', JSON.stringify(gallery));
        loadGalleryTable();
        loadDashboardData();
        showToast('✓ ছবিটি মুছে ফেলা হয়েছে।');
    }
}

// ===== 13. DUAL IMAGE INPUT (UPLOAD & LINK) =====
function switchImageInputMode(prefix, mode) {
    const uploadBox = document.getElementById(`${prefix}-upload-box`);
    const linkBox = document.getElementById(`${prefix}-link-box`);
    const parentContainer = uploadBox.closest('.image-input-container');
    const tabs = parentContainer.querySelectorAll('.image-tab-btn');

    if (mode === 'upload') {
        uploadBox.style.display = 'block';
        linkBox.style.display = 'none';
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        uploadBox.style.display = 'none';
        linkBox.style.display = 'block';
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

function handleFileUpload(event, inputTargetId, previewImgId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 900;
            const MAX_HEIGHT = 900;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            document.getElementById(inputTargetId).value = dataUrl;
            document.getElementById(previewImgId).src = dataUrl;
            showToast('✓ ছবি ফাইল সফলভাবে লোড হয়েছে!');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function updateImagePreview(inputId, previewImgId) {
    const val = document.getElementById(inputId).value.trim();
    if (val) {
        document.getElementById(previewImgId).src = val;
    }
}

// ===== 14. ACADEMY INFO FORM =====
function loadAcademyForm() {
    const a = JSON.parse(localStorage.getItem('portfolio_academy') || '{}');
    document.getElementById('academyNameInput').value = a.name || 'The English Language Academy';
    document.getElementById('academyTaglineInput').value = a.tagline || '';
    document.getElementById('academyLogoInput').value = a.logo || 'images/academy-logo.jpg';
    document.getElementById('academyLogoPreview').src = a.logo || 'images/academy-logo.jpg';
}

function handleAcademySubmit(e) {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem('portfolio_academy') || '{}');
    const a = {
        ...existing,
        name: document.getElementById('academyNameInput').value.trim(),
        tagline: document.getElementById('academyTaglineInput').value.trim(),
        logo: document.getElementById('academyLogoInput').value.trim() || 'images/academy-logo.jpg'
    };
    localStorage.setItem('portfolio_academy', JSON.stringify(a));
    showToast('✓ একাডেমি তথ্য সংরক্ষিত হয়েছে!');
}

// ===== 15. CONTACT SETTINGS FORM =====
function loadContactSettings() {
    const c = JSON.parse(localStorage.getItem('portfolio_contact') || '{}');
    document.getElementById('conPhone1').value = c.phone1 || '01707236855';
    document.getElementById('conPhone2').value = c.phone2 || '01992785557';
    document.getElementById('conWhatsapp').value = c.whatsapp || 'https://wa.me/8801707236855';
    document.getElementById('conEmail').value = c.email || 'info@mirrorielts.com';
    document.getElementById('conFbPersonal').value = c.facebookPersonal || 'https://facebook.com/jafor.iqbal.shahib';
    document.getElementById('conFbPage').value = c.facebookPage || 'https://facebook.com/JaforIqbalEnglishAid';
    document.getElementById('conAddress').value = c.address || 'The English Language Academy, রায়পুরা সরকারি কলেজের সামনে, রায়পুরা, নরসিংদী।';
    document.getElementById('conFooterBrand').value = c.footerBrand || 'Writer – Jafor Iqbal · English Educator · IELTS Specialist · Founder & CEO, Mirror IELTS & Abroad.';
}

function handleContactSettingsSubmit(e) {
    e.preventDefault();
    const c = {
        phone1: document.getElementById('conPhone1').value.trim(),
        phone2: document.getElementById('conPhone2').value.trim(),
        whatsapp: document.getElementById('conWhatsapp').value.trim(),
        email: document.getElementById('conEmail').value.trim(),
        facebookPersonal: document.getElementById('conFbPersonal').value.trim(),
        facebookPage: document.getElementById('conFbPage').value.trim(),
        address: document.getElementById('conAddress').value.trim(),
        footerBrand: document.getElementById('conFooterBrand').value.trim()
    };
    localStorage.setItem('portfolio_contact', JSON.stringify(c));
    showToast('✓ যোগাযোগ ও সোশ্যাল লিংক আপডেট সম্পন্ন!');
}

// ===== 16. MESSAGES INBOX =====
function loadMessagesTable() {
    const tbody = document.getElementById('messagesTableBody');
    if (!tbody) return;

    const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    if (messages.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888; padding: 25px;">কোনো মেসেজ নেই।</td></tr>`;
        return;
    }

    tbody.innerHTML = messages.map((m, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><strong>${escapeHtml(m.name)}</strong></td>
            <td>
                ${escapeHtml(m.email)}<br>
                <small>${escapeHtml(m.phone || '-')}</small>
            </td>
            <td>${escapeHtml(m.message)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteMessage(${m.id})">ডিলিট</button>
            </td>
        </tr>
    `).join('');
}

function deleteMessage(id) {
    if (confirm('আপনি কি এই মেসেজটি মুছে ফেলতে চান?')) {
        let messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        messages = messages.filter(m => m.id !== id);
        localStorage.setItem('portfolio_messages', JSON.stringify(messages));
        loadMessagesTable();
        showToast('✓ মেসেজ মুছে ফেলা হয়েছে।');
    }
}

// ===== 17. SETTINGS & SECURITY: USERNAME ও PASSWORD পরিবর্তন =====
function loadSettingsView() {
    const alertBox = document.getElementById('passwordAlertBox');
    if (alertBox) alertBox.style.display = 'none';
    const form = document.getElementById('changeCredentialsForm');
    if (form) form.reset();

    const currentUsername = localStorage.getItem('admin_username') || 'admin';
    const usernameInput = document.getElementById('newUsernameInput');
    if (usernameInput) {
        usernameInput.value = currentUsername;
    }
}

function handleChangeCredentials(e) {
    e.preventDefault();

    const currPass = document.getElementById('currPasswordInput').value.trim();
    const newUsername = document.getElementById('newUsernameInput').value.trim();
    const newPass = document.getElementById('newPasswordInput').value.trim();
    const confirmPass = document.getElementById('confirmNewPasswordInput').value.trim();
    const alertBox = document.getElementById('passwordAlertBox');

    const storedPass = localStorage.getItem('admin_password') || 'admin123';

    // ১. বর্তমান পাসওয়ার্ড দিয়ে যাচাই
    if (currPass !== storedPass) {
        alertBox.className = 'security-alert-box error';
        alertBox.style.display = 'block';
        alertBox.textContent = '❌ বর্তমান পাসওয়ার্ড সঠিক নয়! অনুগ্রহ করে সঠিক বর্তমান পাসওয়ার্ড দিন।';
        return;
    }

    // ২. নতুন Username বৈধতা যাচাই
    if (!newUsername || newUsername.length < 3) {
        alertBox.className = 'security-alert-box error';
        alertBox.style.display = 'block';
        alertBox.textContent = '❌ নতুন Username কমপক্ষে ৩ অক্ষরের হতে হবে!';
        return;
    }

    // ৩. নতুন Password বৈধতা যাচাই
    if (newPass.length < 6) {
        alertBox.className = 'security-alert-box error';
        alertBox.style.display = 'block';
        alertBox.textContent = '❌ নতুন Password কমপক্ষে ৬ অক্ষরের হতে হবে!';
        return;
    }

    // ৪. Confirm Password দিয়ে মিলিয়ে দেখা
    if (newPass !== confirmPass) {
        alertBox.className = 'security-alert-box error';
        alertBox.style.display = 'block';
        alertBox.textContent = '❌ নতুন Password এবং Confirm Password মিলছে না!';
        return;
    }

    // ৫. নতুন তথ্য ব্রাউজারে সংরক্ষণ (পরবর্তী লগইনে ব্যবহার হবে)
    localStorage.setItem('admin_username', newUsername);
    localStorage.setItem('admin_password', newPass);

    alertBox.className = 'security-alert-box success';
    alertBox.style.display = 'block';
    alertBox.innerHTML = `
        ✓ বর্তমান পাসওয়ার্ড যাচাই সফল!<br>
        <strong>নতুন Username:</strong> ${escapeHtml(newUsername)}<br>
        <strong>নতুন Password:</strong> সফলভাবে সংরক্ষিত হয়েছে!<br>
        <small style="color: #03543f;">পরবর্তী লগইনে এই নতুন Username ও Password ব্যবহার করুন।</small>
    `;

    // Update Header Display
    const userDisplay = document.getElementById('adminLoggedInUserDisplay');
    if (userDisplay) {
        userDisplay.textContent = `👤 ${newUsername}`;
    }

    document.getElementById('currPasswordInput').value = '';
    document.getElementById('newPasswordInput').value = '';
    document.getElementById('confirmNewPasswordInput').value = '';

    showToast('✓ Username ও Password সফলভাবে পরিবর্তন করা হয়েছে!');
}

// BACKUP & RESTORE
function exportDataBackup() {
    const backup = {
        admin_username: localStorage.getItem('admin_username') || 'admin',
        admin_password: localStorage.getItem('admin_password') || 'admin123',
        hero: JSON.parse(localStorage.getItem('portfolio_hero') || '{}'),
        teacher: JSON.parse(localStorage.getItem('portfolio_teacher') || '{}'),
        notices: JSON.parse(localStorage.getItem('portfolio_notices') || '[]'),
        courses: JSON.parse(localStorage.getItem('portfolio_courses') || '[]'),
        books: JSON.parse(localStorage.getItem('portfolio_books') || '[]'),
        videos: JSON.parse(localStorage.getItem('portfolio_videos') || '[]'),
        gallery: JSON.parse(localStorage.getItem('portfolio_gallery') || '[]'),
        academy: JSON.parse(localStorage.getItem('portfolio_academy') || '{}'),
        contact: JSON.parse(localStorage.getItem('portfolio_contact') || '{}'),
        book_orders: JSON.parse(localStorage.getItem('portfolio_book_orders') || '[]'),
        admissions: JSON.parse(localStorage.getItem('portfolio_admissions') || '[]'),
        messages: JSON.parse(localStorage.getItem('portfolio_messages') || '[]')
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the_english_language_academy_backup_${Date.now()}.json`;
    a.click();
    showToast('✓ সম্পূর্ণ ওয়েবসাইটের ব্যাকআপ ফাইল ডাউনলোড হয়েছে!');
}

function importDataBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.admin_username) localStorage.setItem('admin_username', data.admin_username);
            if (data.admin_password) localStorage.setItem('admin_password', data.admin_password);
            if (data.hero) localStorage.setItem('portfolio_hero', JSON.stringify(data.hero));
            if (data.teacher) localStorage.setItem('portfolio_teacher', JSON.stringify(data.teacher));
            if (data.notices) localStorage.setItem('portfolio_notices', JSON.stringify(data.notices));
            if (data.courses) localStorage.setItem('portfolio_courses', JSON.stringify(data.courses));
            if (data.books) localStorage.setItem('portfolio_books', JSON.stringify(data.books));
            if (data.videos) localStorage.setItem('portfolio_videos', JSON.stringify(data.videos));
            if (data.gallery) localStorage.setItem('portfolio_gallery', JSON.stringify(data.gallery));
            if (data.academy) localStorage.setItem('portfolio_academy', JSON.stringify(data.academy));
            if (data.contact) localStorage.setItem('portfolio_contact', JSON.stringify(data.contact));
            if (data.book_orders) localStorage.setItem('portfolio_book_orders', JSON.stringify(data.book_orders));
            if (data.admissions) localStorage.setItem('portfolio_admissions', JSON.stringify(data.admissions));
            if (data.messages) localStorage.setItem('portfolio_messages', JSON.stringify(data.messages));

            showToast('✓ সম্পূর্ণ ওয়েবসাইট ব্যাকআপ থেকে রিস্টোর সম্পন্ন হয়েছে!');
            setTimeout(() => location.reload(), 1000);
        } catch (err) {
            showToast('ব্যাকআপ ফাইলটি সঠিক নয়।', 'error');
        }
    };
    reader.readAsText(file);
}

function resetAllData() {
    if (confirm('সতর্কতা: এটি ওয়েবসাইটের সকল এডিট, অর্ডার, ভর্তি আবেদন ও ভিডিও মুছে দিয়ে ডিফল্ট অবস্থায় নিয়ে যাবে। আপনি কি নিশ্চিত?')) {
        localStorage.clear();
        showToast('✓ সাইট রিসেট করা হয়েছে!');
        setTimeout(() => location.reload(), 800);
    }
}

// ===== 18. HELPERS =====
function getStatusClass(status) {
    switch (status) {
        case 'পেন্ডিং': case 'Pending': return 'pending';
        case 'কনফার্মড': case 'Confirmed': return 'confirmed';
        case 'ডেলিভারির পথে': case 'Shipped': return 'shipped';
        case 'ডেলিভারি সম্পন্ন': case 'Delivered': return 'delivered';
        case 'বাতিল': case 'Cancelled': return 'cancelled';
        case 'নতুন আবেদন': case 'New': return 'new';
        case 'অনুমোদিত (Approved)': return 'delivered';
        case 'যোগাযোগ হয়েছে': case 'Contacted': return 'contacted';
        case 'ভর্তি সম্পন্ন': case 'Enrolled': return 'enrolled';
        default: return 'pending';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function showToast(msg) {
    let toast = document.getElementById('adminToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'adminToast';
        toast.className = 'admin-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
