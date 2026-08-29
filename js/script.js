// ฟังก์ชันส่งข้อมูลการจองผ่าน LIFF (ใช้ liff.sendMessages ส่งข้อความเข้าห้องแชทโดยตรง)
function submitBooking(event) {
  if (event) event.preventDefault(); // ป้องกันหน้าเว็บ Reload หรือเด้งกลับหน้าแรก

  const LIFF_ID = "2008429094-YTq3YOaG";

  const fullName = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!fullName || !phone) {
    alert("กรุณากรอกชื่อ-สกุล และเบอร์โทรศัพท์ให้ครบถ้วน");
    return;
  }

  // ตรวจสอบความพร้อมของ LIFF SDK
  if (typeof liff === "undefined") {
    alert("ไม่พบ LIFF SDK กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
    return;
  }

  liff.init({ liffId: LIFF_ID })
    .then(() => {
      // ตรวจสอบว่าเปิดผ่านแอป LINE หรือไม่ (liff.sendMessages ใช้ได้เฉพาะในแอป LINE เท่านั้น)
      if (!liff.isInClient()) {
        alert("กรุณาเปิดใช้งานและส่งข้อมูลผ่านแอปพลิเคชัน LINE เท่านั้น");
        return;
      }

      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      // จัดรูปแบบข้อความที่จะส่งลงในห้องแชท LINE
      const messageText = `📌 รายการจองวีซ่าอุมเราะห์ใหม่\n` +
        `-------------------------\n` +
        `👤 ชื่อ-สกุล: ${fullName}\n` +
        `📞 เบอร์โทร: ${phone}\n` +
        `👥 จำนวน: ${document.getElementById("qty-input").value} ท่าน\n` +
        `🏨 โรงแรมมักกะฮ์: ${document.getElementById("hotelMakkah").value || '-'}\n` +
        `🏨 โรงแรมมาดีนะฮ์: ${document.getElementById("hotelMadinah").value || '-'}\n` +
        `💰 ราคารวม: ${document.getElementById("price-display").textContent.trim()}`;

      // คำสั่งส่งข้อความเข้าห้องแชท
      return liff.sendMessages([
        {
          type: "text",
          text: messageText
        }
      ]);
    })
    .then(() => {
      alert("ส่งข้อมูลการจองเรียบร้อยแล้ว");
      if (liff.isInClient()) {
        setTimeout(() => {
          liff.closeWindow();
        }, 500);
      }
    })
.catch(err => {
      console.error("LIFF Error:", err);
      alert("เกิดข้อผิดพลาด: " + JSON.stringify(err));
    });
}

// ส่วนคำนวณราคาและระบบปุ่มบวกลบ
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