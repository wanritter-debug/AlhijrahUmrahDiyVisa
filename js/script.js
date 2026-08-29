let isLiffReady = false;
let userProfile = null;
const LIFF_ID = "2008429094-YTq3YOaG";

window.addEventListener('load', async () => {
    if (typeof liff === "undefined") {
        console.warn("ไม่พบ LIFF SDK - ระบบจะทำงานในรูปแบบ Standalone Web");
        return;
    }

    try {
        await liff.init({ liffId: LIFF_ID });
        isLiffReady = true;

        if (liff.isInClient() && liff.isLoggedIn()) {
            userProfile = await liff.getProfile();
        }
    } catch (err) {
        console.error("LIFF Init Error:", err);
    }
});

// 2. ฟังก์ชันส่งข้อมูลการจอง
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

    // จัดรูปแบบข้อความ
    const messageText = `📌 รายการจองวีซ่าอุมเราะห์ใหม่\n` +
        `-------------------------\n` +
        `👤 ชื่อ-สกุล: ${fullName}\n` +
        `📞 เบอร์โทร: ${phone}\n` +
        `👥 จำนวน: ${qty} ท่าน\n` +
        `🏨 โรงแรมมักกะฮ์: ${hotelMakkah}\n` +
        `🏨 โรงแรมมาดีนะฮ์: ${hotelMadinah}\n` +
        `💰 ราคารวม: ${priceDisplay}`;

    // กรณีเปิดผ่าน LINE App และ LIFF พร้อมใช้งาน
    // กรณีเปิดผ่าน LINE App
    if (isLiffReady && liff.isInClient()) {
        // เช็คล็อกอินเฉพาะตอนกดส่งข้อมูล
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
            // ถ้าส่งข้อความผ่าน LIFF ไม่ผ่าน ให้ใช้ระบบ Popup สำรอง
            showCopyPopup(messageText);
        }
    } else {
        // กรณีเปิดนอก LINE App -> แสดง Popup คัดลอกข้อความ
        showCopyPopup(messageText);
    }
}

// 3. ฟังก์ชันสร้าง Popup สำหรับคัดลอกข้อความ (รองรับการเปิดผ่าน Chrome/Safari)
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

// 4. ส่วนคำนวณราคาและระบบปุ่มบวกลบ
document.addEventListener('DOMContentLoaded', () => {
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