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

// 2. ฟังก์ชันสลับหน้า (แทนการเปลี่ยนไฟล์ html)
function showDetailPage() {
    document.getElementById('page-list').style.display = 'none';
    document.getElementById('page-detail').style.display = 'flex';
}

function showListPage() {
    document.getElementById('page-detail').style.display = 'none';
    document.getElementById('page-list').style.display = 'flex';
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

    if (!fullName || !phone) {
        alert("กรุณากรอกชื่อ-สกุล และเบอร์โทรศัพท์ให้ครบถ้วน");
        return;
    }

    const messageText = `📌 รายการจองวีซ่าอุมเราะห์ใหม่\n` +
        `-------------------------\n` +
        `👤 ชื่อ-สกุล: ${fullName}\n` +
        `📞 เบอร์โทร: ${phone}\n` +
        `👥 จำนวน: ${qty} ท่าน\n` +
        `🏨 โรงแรมมักกะฮ์: ${hotelMakkah}\n` +
        `🏨 โรงแรมมาดีนะฮ์: ${hotelMadinah}\n` +
        `💰 ราคารวม: ${priceDisplay}`;

    const liffReady = await liffInitPromise;

    if (liffReady && liff.isInClient()) {
        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }
        try {
            await liff.sendMessages([{ type: "text", text: messageText }]);
            alert("ส่งข้อมูลการจองเรียบร้อยแล้ว");
            liff.closeWindow();
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
            <h3 style="margin-top:0;">📋 สำเร็จการกรอกข้อมูล</h3>
            <p style="font-size:13px;color:#666;">กรุณาคัดลอกข้อความด้านล่างเพื่อส่งไปยัง LINE Chat</p>
            <textarea readonly style="width:100%;height:180px;margin:10px 0;padding:8px;border:1px solid #ccc;border-radius:5px;resize:none;font-size:13px;">${message}</textarea>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:10px;">
                <button id="copyBtn" style="padding:10px 15px;background:#00b900;color:#fff;border:none;border-radius:5px;cursor:pointer;">📋 คัดลอกข้อความ</button>
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

    // ล็อกการ์ดไว้ก่อน ไม่ให้กดจนกว่าเพจจะโหลดครบจริง (รวมรูปภาพ)
    umrahLink.style.pointerEvents = 'none';
    umrahLink.style.opacity = '0.5';

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
            umrahLink.style.pointerEvents = 'auto';
            umrahLink.style.opacity = '1';
        }
    }

    if (total === 0) {
        // ไม่มีรูปให้นับ ปลดล็อกทันที
        overlay.classList.add('hidden');
        umrahLink.style.pointerEvents = 'auto';
        umrahLink.style.opacity = '1';
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
});