const LIFF_ID = "2008429094-YTq3YOaG";
let userProfile = null;

// 1. เรียก liff.init() ครั้งเดียวตอนโหลดเว็บ ไม่ต้อง re-init อีกเลยตลอดการใช้งาน
let liffInitPromise = (async () => {
    if (typeof liff === "undefined") {
        console.warn("ไม่พบ LIFF SDK - ระบบจะทำงานในรูปแบบ Standalone Web");
        return false;
    }
    try {
        await liff.init({ liffId: LIFF_ID });
        if (liff.isInClient() && liff.isLoggedIn()) {
            userProfile = await liff.getProfile();
        }
        return true;
    } catch (err) {
        console.error("LIFF Init Error:", err);
        return false;
    }
})();

const ALL_PAGES = ['page-home', 'page-list', 'page-detail', 'page-detail-tourism', 'page-diy-detail'];

function showPage(pageId) {
    ALL_PAGES.forEach(id => {
        document.getElementById(id).style.display = (id === pageId) 
            ? (id === 'page-home' ? 'flex' : 'flex') 
            : 'none';
    });
}

function showDetailPage() { showPage('page-detail'); }
function showTourismDetailPage() { showPage('page-detail-tourism'); }
function showDiyDetailPage() { showPage('page-diy-detail'); }
function showHomePage() { showPage('page-home'); }
function showListPage() { showPage('page-list'); }

function showComingSoon() {
    const popup = document.createElement('div');
    popup.className = 'coming-soon-popup';
    popup.innerHTML = `
        <div class="coming-soon-card">
            <p>แพ็กเกจนี้กำลังจะเปิดให้จองทางช่องทางนี้เร็วๆ นี้ครับ/ค่ะ</p>
            <button id="comingSoonOkBtn">รับทราบ</button>
        </div>
    `;
    document.body.appendChild(popup);
    document.getElementById('comingSoonOkBtn').onclick = () => popup.remove();
}

// 3. ฟังก์ชันส่งข้อมูลการจอง
async function submitBooking(event) {
    if (event) event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const qty = document.getElementById("qty-input").value;
    const hotelMakkah = document.getElementById("hotelMakkah").value.trim() || '-';
    const hotelMadinah = document.getElementById("hotelMadinah").value.trim() || '-';
    const priceDisplay = document.getElementById("price-display").textContent.trim();
     // เคลียร์ข้อความเตือนเก่าก่อนเช็คใหม่ทุกครั้ง
    ["fullName", "phone", "hotelMakkah", "hotelMadinah"].forEach(id => {
        document.getElementById("err-" + id).textContent = "";
    });

    let hasError = false;
    if (!fullName) {
        document.getElementById("err-fullName").textContent = "กรุณากรอกชื่อ-สกุล";
        hasError = true;
    }
    if (!phone) {
        document.getElementById("err-phone").textContent = "กรุณากรอกเบอร์โทรศัพท์";
        hasError = true;
    }
    if (!hotelMakkah || hotelMakkah === '-') {
        document.getElementById("err-hotelMakkah").textContent = "กรุณาเลือกโรงแรมมักกะฮ์";
        hasError = true;
    }
    if (!hotelMadinah || hotelMadinah === '-') {
        document.getElementById("err-hotelMadinah").textContent = "กรุณาเลือกโรงแรมมาดีนะฮ์";
        hasError = true;
    }

    if (hasError) return;

    const now = new Date();
const bookingId = 'UMR' + now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') + '-' +
    String(Math.floor(Math.random() * 9000) + 1000);

const bookingDate = now.toLocaleDateString('th-TH', {
    day: 'numeric', month: 'long', year: 'numeric'
});
const bookingTime = now.toLocaleTimeString('th-TH', {
    hour: '2-digit', minute: '2-digit'
});

const pricePerPerson = (parseInt(qty) > 0)
    ? Math.round(parseInt(priceDisplay.replace(/[^\d]/g, '')) / parseInt(qty)).toLocaleString()
    : '';

const messageText =
    `ข้อความการจองวีซ่าอุมเราะห์\n` +
    `เลขที่จอง: ${bookingId}\n` +
    `═══════════════════\n` +
    `ชื่อ-สกุล: ${fullName}\n` +
    `เบอร์โทร: ${phone}\n` +
    `จำนวนผู้เดินทาง: ${qty} ท่าน\n` +
    `═══════════════════\n` +
    `ที่พักมักกะห์: ${hotelMakkah}\n` +
    `ที่พักมาดีนะห์: ${hotelMadinah}\n` +
    `═══════════════════\n` +
    `ราคาต่อท่าน: ${pricePerPerson} บาท\n` +
    `ราคารวมทั้งหมด: ${priceDisplay}\n` +
    `═══════════════════\n` +
    `เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันการจองภายใน 24 ชม.`;

    const liffReady = await liffInitPromise;

    if (liffReady && liff.isInClient()) {
        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }
        try {
            await liff.sendMessages([{ type: "text", text: messageText }]);
            showSuccessPopup();
        } catch (err) {
            console.error("sendMessages Error:", err);
            showCopyPopup(messageText);
        }
    } else {
        showCopyPopup(messageText);
    }
}

async function submitBookingTourism(event) {
    if (event) event.preventDefault();

    const fullName = document.getElementById("fullNameTourism").value.trim();
    const phone = document.getElementById("phoneTourism").value.trim();
    const qty = document.getElementById("qty-input-tourism").value;
    const priceDisplay = document.getElementById("price-display-tourism").textContent.trim();

    ["fullNameTourism", "phoneTourism"].forEach(id => {
        document.getElementById("err-" + id).textContent = "";
    });

    let hasError = false;
    if (!fullName) {
        document.getElementById("err-fullNameTourism").textContent = "กรุณากรอกชื่อ-สกุล";
        hasError = true;
    }
    if (!phone) {
        document.getElementById("err-phoneTourism").textContent = "กรุณากรอกเบอร์โทรศัพท์";
        hasError = true;
    }
    if (hasError) return;

    const now = new Date();
    const bookingId = 'TUR' + now.getFullYear().toString().slice(-2) +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') + '-' +
        String(Math.floor(Math.random() * 9000) + 1000);

    const pricePerPerson = (parseInt(qty) > 0)
        ? Math.round(parseInt(priceDisplay.replace(/[^\d]/g, '')) / parseInt(qty)).toLocaleString()
        : '';

    const messageText =
        `ข้อความการจองวีซ่าท่องเที่ยว\n` +
        `เลขที่จอง: ${bookingId}\n` +
        `═══════════════════\n` +
        `ชื่อ-สกุล: ${fullName}\n` +
        `เบอร์โทร: ${phone}\n` +
        `จำนวนผู้เดินทาง: ${qty} ท่าน\n` +
        `═══════════════════\n` +
        `ราคาต่อท่าน: ${pricePerPerson} บาท\n` +
        `ราคารวมทั้งหมด: ${priceDisplay}\n` +
        `═══════════════════\n` +
        `เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันการจองภายใน 24 ชม.`;

    const liffReady = await liffInitPromise;

    if (liffReady && liff.isInClient()) {
        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }
        try {
            await liff.sendMessages([{ type: "text", text: messageText }]);
            showSuccessPopup();
        } catch (err) {
            console.error("sendMessages Error:", err);
            showCopyPopup(messageText);
        }
    } else {
        showCopyPopup(messageText);
    }
}


// 4. ฟังก์ชันสร้าง Popup สำหรับคัดลอกข้อความ (รองรับการเปิดผ่าน Chrome/Safari)
function showCopyPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'message-popup';
    popup.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;';

    popup.innerHTML = `
        <div style="background:#fff;padding:20px;border-radius:10px;max-width:90%;width:400px;text-align:center;">
            <h3 style="margin-top:0;">สำเร็จการกรอกข้อมูล</h3>
            <p style="font-size:13px;color:#666;">กรุณาคัดลอกข้อความด้านล่างเพื่อส่งไปยัง LINE Chat</p>
            <textarea readonly style="width:100%;height:180px;margin:10px 0;padding:8px;border:1px solid #ccc;border-radius:5px;resize:none;font-size:13px;">${message}</textarea>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:10px;">
                <button id="copyBtn" style="padding:10px 15px;background:#00b900;color:#fff;border:none;border-radius:5px;cursor:pointer;">คัดลอกข้อความ</button>
                <button onclick="this.closest('.message-popup').remove()" style="padding:10px 15px;background:#666;color:#fff;border:none;border-radius:5px;cursor:pointer;">ปิด</button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById('copyBtn').onclick = function () {
        navigator.clipboard.writeText(message).then(() => {
            this.textContent = '✅ คัดลอกแล้ว!';
            this.style.background = '#4caf50';
        }).catch(() => {
            alert('กรุณาคัดลอกข้อความด้วยตนเองจากช่องข้อความ');
        });
    };
}

function showSuccessPopup() {
    const popup = document.createElement('div');
    popup.className = 'message-popup';
    popup.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);display:flex;justify-content:center;align-items:center;z-index:9999;';

    popup.innerHTML = `
        <div style="background:#fff;padding:32px 28px 24px;border-radius:24px;max-width:85%;width:300px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.15);">
            <img src="img/check-circle 1.svg" alt="สำเร็จ" style="width:72px;height:72px;margin-bottom:16px;">
            <div style="font-size:14px;color:#333;line-height:1.6;margin-bottom:20px;">
                ส่งข้อมูลเรียบร้อยแล้วค่ะ<br>
                เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด
            </div>
            <button id="successOkBtn" style="width:100%;padding:12px;border:1.5px solid #333;border-radius:24px;background:#fff;font-size:15px;font-weight:600;cursor:pointer;">ตกลง</button>
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById('successOkBtn').onclick = function () {
        popup.remove();
        if (typeof liff !== "undefined" && liff.isInClient && liff.isInClient()) {
            liff.closeWindow();
        }
    };
}

let makkahHotels = [];
let madinahHotels = [];
let hotelsLoaded = false;

async function loadHotelData() {
    if (hotelsLoaded) return; // โหลดแล้วไม่ต้องโหลดซ้ำ
    try {
        const res = await fetch('data/hotels.json');
        if (!res.ok) throw new Error('โหลดข้อมูลโรงแรมไม่สำเร็จ');
        const data = await res.json();
        makkahHotels = data.makkah;
        madinahHotels = data.madinah;
        hotelsLoaded = true;
    } catch (err) {
        console.error('Load hotels error:', err);
    }
}

const STAR_CATEGORIES = [
    { value: 'all', text: 'โรงแรมทุกระดับดาว', starCount: 0 },
    { value: '0', text: 'โรงแรมที่ยังไม่มีการกำหนดจำนวนดาว', starCount: 0 },
    { value: '1', text: 'โรงแรม', starCount: 1 },
    { value: '2', text: 'โรงแรม', starCount: 2 },
    { value: '3', text: 'โรงแรม', starCount: 3 },
    { value: '4', text: 'โรงแรม', starCount: 4 },
    { value: '5', text: 'โรงแรม', starCount: 5 }
];

function closeHotelPicker() {
    const existing = document.getElementById('hotelPickerModal');
    if (existing) existing.remove();
}

async function openHotelPicker(type) {
    await loadHotelData();
    renderCategoryStep(type);
}

function renderCategoryStep(type) {
    closeHotelPicker();
    const modal = document.createElement('div');
    modal.id = 'hotelPickerModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.45);display:flex;justify-content:center;align-items:center;z-index:9999;padding:20px;';

    const rows = STAR_CATEGORIES.map(item => {
        const starsHtml = item.starCount > 0
            ? Array(item.starCount).fill('<img src="img/star 1.svg" alt="star" class="hotel-picker-star">').join('')
            : '';
        return `<div class="hotel-picker-row hotel-picker-row-category" data-value="${item.value}">${item.text} ${starsHtml}</div>`;
    }).join('');;

    modal.innerHTML = `<div class="hotel-picker-card hotel-picker-category-card">${rows}</div>`;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeHotelPicker();
    });

    modal.querySelectorAll('.hotel-picker-row-category').forEach(row => {
        row.addEventListener('click', () => {
            renderSearchStep(type, row.getAttribute('data-value'));
        });
    });
}

function renderSearchStep(type, starValue) {
    closeHotelPicker();
    const hotelList = type === 'makkah' ? makkahHotels : madinahHotels;
    const filtered = starValue === 'all'
        ? hotelList
        : hotelList.filter(h => h.stars === parseInt(starValue));

    const modal = document.createElement('div');
    modal.id = 'hotelPickerModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.45);display:flex;justify-content:center;align-items:center;z-index:9999;padding:20px;';

    const cityLabel = type === 'makkah' ? 'มักกะฮ์' : 'มาดีนะฮ์';

    modal.innerHTML = `
        <div class="hotel-picker-card hotel-picker-search-card">
            <div class="hotel-picker-search-title">ค้นหาชื่อโรงแรม${cityLabel}</div>
            <div class="hotel-picker-search-box">
                <input type="text" id="hotelPickerSearchInput" placeholder="พิมพ์ชื่อโรงแรม">
                <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            <div id="hotelPickerResults" class="hotel-picker-results"></div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeHotelPicker();
    });

    function renderResults(list) {
        const container = document.getElementById('hotelPickerResults');
        if (list.length === 0) {
            container.innerHTML = '<div class="hotel-picker-empty">ไม่พบโรงแรมที่ค้นหา</div>';
            return;
        }
        container.innerHTML = list.map(h =>
            `<div class="hotel-picker-row" data-name="${h.name}">${h.name}</div>`
        ).join('');
        container.querySelectorAll('.hotel-picker-row').forEach(row => {
            row.addEventListener('click', () => {
                selectHotel(type, row.getAttribute('data-name'));
            });
        });
    }

    renderResults(filtered);

    document.getElementById('hotelPickerSearchInput').addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        renderResults(filtered.filter(h => h.name.toLowerCase().includes(q)));
    });
}

function selectHotel(type, name) {
    const inputId = type === 'makkah' ? 'hotelMakkah' : 'hotelMadinah';
    document.getElementById(inputId).value = name;
    closeHotelPicker();
}

    // 5. เมื่อ DOM พร้อม: ผูกปุ่ม, ระบบคำนวณราคา, ระบบล็อกการ์ดจนกว่าเพจจะโหลดครบ
    document.addEventListener('DOMContentLoaded', () => {
    // ----- สลับหน้า -----
    const umrahLink = document.getElementById('umrah-link');
    const backLink = document.getElementById('back-link');

    umrahLink.addEventListener('click', showDetailPage);
    backLink.addEventListener('click', (e) => {
        e.preventDefault();
        showListPage();
        
    });

    const DIY_CATEGORIES = [
        { id: 'visa',   title: 'วีซ่า',        desc: 'ทางเราเป็นผู้ประสานงานขอวีซ่าไปยังประเทศซาอุดีอาระเบียโดยตรง', price: 'ราคาเริ่มต้นที่ 5,900 บาท', icon: 'fa-passport', hasDocStack: true },
        { id: 'flight', title: 'ตั๋วเครื่องบิน', desc: 'จองสายการบินชั้นนำโดยผู้เชี่ยวชาญ และพร้อมให้คำแนะนำตามทุกความประสงค์ของคุณ', price: 'ราคาเริ่มต้นที่ 3,500 บาท', hasPlaneImg: true, cardStyle: 'light' },        
        { id: 'car', title: 'รถ', 
        desc: 'สำหรับเดินทางในประเทศ สำหรับรับส่งสนามบิน หรือซียาเราะห์', 
        price: 'ราคาเริ่มต้นที่ -- บาท', 
        hasCarImg: true,
        cardStyle: 'car' },
        { id: 'hotel', title: 'ที่พัก', 
        desc: 'บริการของที่พักราคาประหยัด จนไปถึง 5 ดาว', 
        price: 'ราคาเริ่มต้นที่ -- บาท', 
        hasHotelImg: true,
        cardStyle: 'hotel' },
        { id: 'food', title: 'อาหาร', 
        desc: 'บริการอาหารแบบเซตบ็อกและบุฟเฟ่ย์สไตล์ อินโด ', 
         price: 'ราคาเริ่มต้นที่กล่องละ -- บาท', 
        hasFoodImg: true,
        cardStyle: 'food' },        
        { id: 'guide', title: 'มูตอวิฟ', 
            desc: 'พาทำอุมเราะห์โดยผู้มีประสบการณ์', 
            price: 'ราคาเริ่มต้นที่ -- บาท', 
            hasGuideImg: true,
            cardStyle: 'guide' },    
    ];

    const selectedDiyItems = new Set();

    function buildCategoryMedia(cat) {
        if (cat.hasDocStack) {
            return `
                <div class="diy-doc-stack">
                    <img src="img/Group 16.svg" alt="เอกสาร" class="diy-doc-img diy-doc-img--back">
                </div>`;

        }
        if (cat.hasPlaneImg) {   // เพิ่มเงื่อนไขใหม่
            return `
                <div class="diy-plane-frame">
                    <img src="img/aa 1.svg" alt="ตั๋วเครื่องบิน">
                </div>`;

        }
        if (cat.hasCarImg) {   // ← เพิ่มใหม่
            return `<div class="diy-car-frame">
                <img src="img/Group 17.svg" alt="รถ">
            </div>`;
    
        }

        if (cat.hasHotelImg) {   // ← เพิ่มตรงนี้ด้วย
            return `<div class="diy-hotel-frame">
                <img src="img/2bccb986 2.svg" alt="ที่พัก">
            </div>`;
        }

        if (cat.hasFoodImg) {
            return `<div class="diy-food-frame">
                <img src="img/20260709_195126 2.svg" alt="อาหาร">
            </div>`;
        }

        if (cat.hasGuideImg) {
            return `<div class="diy-guide-frame">
                <img src="img/482213693_1595903955134083_1501763222359019617_n 1.svg" alt="มูตอวิฟ">
            </div>`;
        }

        return `
            <div class="diy-photo-frame">
                <i class="fa-solid ${cat.icon} diy-photo-icon"></i>
            </div>`;
    }

    function renderDiyCarousel() {
        const carousel = document.getElementById('diy-carousel');
        const dotsContainer = document.getElementById('diy-dots');
        if (!carousel || !dotsContainer) return;

        carousel.innerHTML = '';
        dotsContainer.innerHTML = '';

        DIY_CATEGORIES.forEach((cat, index) => {
            const slide = document.createElement('div');
            slide.className = 'diy-slide';
            slide.dataset.id = cat.id;
            slide.innerHTML = `
                ${buildCategoryMedia(cat)}
                <div class="diy-price-card ${cat.cardStyle ? 'diy-price-card--' + cat.cardStyle : ''}">
                    <h2 class="diy-price-title">${cat.title}</h2>
                    <p class="diy-price-desc">${cat.desc}</p>
                    <div class="diy-price-tag">${cat.price}</div>
                    <button type="button" class="diy-price-plus" data-id="${cat.id}">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            `;
            carousel.appendChild(slide);

            const dot = document.createElement('span');
            dot.className = 'dot' + (index === 0 ? ' active' : '');
            dotsContainer.appendChild(dot);
        });

        carousel.querySelectorAll('.diy-price-plus').forEach(btn => {
            btn.addEventListener('click', () => toggleDiyItem(btn.dataset.id, btn));
        });
    }

    function toggleDiyItem(id, btnEl) {
        if (selectedDiyItems.has(id)) {
            selectedDiyItems.delete(id);
            btnEl.classList.remove('added');
            btnEl.innerHTML = '<i class="fa-solid fa-plus"></i>';
        } else {
            selectedDiyItems.add(id);
            btnEl.classList.add('added');
            btnEl.innerHTML = '<i class="fa-solid fa-check"></i>';
        }
        updateDiySelectedCount();
    }

    function updateDiySelectedCount() {
        const countEl = document.getElementById('diy-selected-count');
        if (!countEl) return;
        const count = selectedDiyItems.size;
        countEl.textContent = count > 0 ? count : '';
    }

    function updateDiyActiveDot(index) {
        const dots = document.querySelectorAll('#diy-dots .dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
        const currentTab = document.getElementById('diy-tab-current');
        if (currentTab && DIY_CATEGORIES[index]) {
            currentTab.textContent = DIY_CATEGORIES[index].title;
        }
    }

        renderDiyCarousel();

        const carousel = document.getElementById('diy-carousel');
        if (carousel) {
            carousel.addEventListener('scroll', () => {
                const slideWidth = carousel.clientWidth;
                const index = Math.round(carousel.scrollLeft / slideWidth);
                updateDiyActiveDot(index);
            });
        }

    const backLinkList = document.getElementById('back-link-list');
    backLinkList.addEventListener('click', (e) => {
        e.preventDefault();
        showDiyDetailPage();
    });

    document.getElementById('diy-tab-list').addEventListener('click', () => {
    showListPage();
    });

    const tourismLink = document.getElementById('tourism-link');
    const backLinkTourism = document.getElementById('back-link-tourism');

    tourismLink.addEventListener('click', showTourismDetailPage);
    backLinkTourism.addEventListener('click', (e) => {
        e.preventDefault();
        showListPage();
    });

        // ----- ผูกการ์ดหน้า Home -----
    document.getElementById('fullpackage-link').addEventListener('click', showComingSoon);
    document.getElementById('plus-link').addEventListener('click', showComingSoon);
    document.getElementById('diy-link').addEventListener('click', showDiyDetailPage);

        // ----- ฟิลเตอร์โรงแรมตามดาว -----
    document.getElementById('makkahPickerTrigger').addEventListener('click', () => openHotelPicker('makkah'));
    document.getElementById('madinahPickerTrigger').addEventListener('click', () => openHotelPicker('madinah'));

    document.getElementById('diy-detail-continue-btn').addEventListener('click', showListPage);
    document.getElementById('back-link-diy-detail').addEventListener('click', (e) => {
        e.preventDefault();
        showHomePage();
    });

    // ล็อกการ์ดไว้ก่อน ไม่ให้กดจนกว่าเพจจะโหลดครบจริง (รวมรูปภาพ)
    const homeCards = [
        document.getElementById('fullpackage-link'),
        document.getElementById('diy-link'),
        document.getElementById('plus-link')
    ];
    homeCards.forEach(c => { c.style.pointerEvents = 'none'; c.style.opacity = '0.5'; });
    // ----- แสดง % โหลดจากจำนวนรูปภาพจริง -----
    const overlay = document.getElementById('loading-overlay');
    const percentText = document.getElementById('loading-percent');
    const barFill = document.getElementById('loading-bar-fill');

    const images = Array.from(document.images); // นับรูปทั้งหมดในหน้า (ทั้งสอง section)
    const total = images.length;
    let loadedCount = 0;

    function updateProgress() {
        loadedCount++;
        const percent = total > 0 ? Math.round((loadedCount / total) * 100) : 100;
        percentText.textContent = percent + '%';
        barFill.style.width = percent + '%';

        if (loadedCount >= total) {
            overlay.classList.add('hidden');
            homeCards.forEach(c => { c.style.pointerEvents = 'auto'; c.style.opacity = '1'; });
        }
    }

    if (total === 0) {
        // ไม่มีรูปให้นับ ปลดล็อกทันที
        overlay.classList.add('hidden');
        homeCards.forEach(c => { c.style.pointerEvents = 'auto'; c.style.opacity = '1'; });
    } else {
        images.forEach((img) => {
            if (img.complete) {
                updateProgress();
            } else {
                img.addEventListener('load', updateProgress);
                img.addEventListener('error', updateProgress); // นับรวมด้วยแม้โหลดพลาด กันค้าง 100% ไม่ถึง
            }
        });
    }

    // ----- คำนวณราคาและระบบปุ่มบวกลบ -----
    const plusBtn = document.getElementById('btn-plus');
    const minusBtn = document.getElementById('btn-minus');
    const qtyInput = document.getElementById('qty-input');
    const priceDisplay = document.getElementById('price-display');
    const discountBadge = document.getElementById('discount-badge');

    function updatePrice() {
        let qty = parseInt(qtyInput.value) || 1;
        let pricePerPerson = 6500;

        if (qty >= 6 && qty <= 9) {
            pricePerPerson = 5800;
            if (discountBadge) {
                discountBadge.textContent = '🎉 ประหยัด 10% (ลด 700 บาท/ท่าน)';
                discountBadge.style.color = '#2e7d32';
            }
        } else if (qty >= 10) {
            pricePerPerson = 5500;
            if (discountBadge) {
                discountBadge.textContent = '🔥 คุ้มที่สุด! ประหยัด 15% (ลด 1,000 บาท/ท่าน)';
                discountBadge.style.color = '#d32f2f';
            }
        } else {
            if (discountBadge) {
                discountBadge.textContent = '💡 เดินทาง 6 ท่านขึ้นไป รับส่วนลดสูงสุด 15%';
                discountBadge.style.color = '#666666';
            }
        }

        let totalPrice = qty * pricePerPerson;
        if (priceDisplay) priceDisplay.textContent = totalPrice.toLocaleString() + ' บาท';
    }

    if (plusBtn && minusBtn && qtyInput && priceDisplay) {
        plusBtn.addEventListener('click', () => {
            let qty = parseInt(qtyInput.value) || 1;
            qtyInput.value = qty + 1;
            updatePrice();
        });

        minusBtn.addEventListener('click', () => {
            let qty = parseInt(qtyInput.value) || 1;
            if (qty > 1) {
                qtyInput.value = qty - 1;
                updatePrice();
            }
        });

        qtyInput.addEventListener('input', () => {
            updatePrice();
        });
    }


    const plusBtnTourism = document.getElementById('btn-plus-tourism');
    const minusBtnTourism = document.getElementById('btn-minus-tourism');
    const qtyInputTourism = document.getElementById('qty-input-tourism');
    const priceDisplayTourism = document.getElementById('price-display-tourism');


    function updatePriceTourism() {
        let qty = parseInt(qtyInputTourism.value) || 1;
        let pricePerPerson = 5900; // ราคาฐานวีซ่าท่องเที่ยว
        let totalPrice = qty * pricePerPerson;
        if (priceDisplayTourism) priceDisplayTourism.textContent = totalPrice.toLocaleString() + ' บาท';
    }

    if (plusBtnTourism && minusBtnTourism && qtyInputTourism && priceDisplayTourism) {
        plusBtnTourism.addEventListener('click', () => {
            let qty = parseInt(qtyInputTourism.value) || 1;
            qtyInputTourism.value = qty + 1;
            updatePriceTourism();
        });

        minusBtnTourism.addEventListener('click', () => {
            let qty = parseInt(qtyInputTourism.value) || 1;
            if (qty > 1) {
                qtyInputTourism.value = qty - 1;
                updatePriceTourism();
            }
        });

        qtyInputTourism.addEventListener('input', () => {
            updatePriceTourism();
        });
    }

});


