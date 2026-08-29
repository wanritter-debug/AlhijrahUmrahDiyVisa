// ฟังก์ชันส่งข้อมูลการจองผ่าน LIFF
function submitBooking(event) {
  if (event) event.preventDefault(); // ป้องกันหน้าเว็บ Reload หรือเด้งกลับหน้าแรก

  const LIFF_ID = "2008429094-YTq3YOaG";
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxnSgVoJjbVVJyiGGya93ZymSsYPJH3o5snYxtzuy2RdlKjWcq5pFOEtouaDM7GCGMy/exec";

  const fullName = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!fullName || !phone) {
    alert("กรุณากรอกชื่อ-สกุล และเบอร์โทรศัพท์ให้ครบถ้วน");
    return;
  }

  // ตรวจสอบความพร้อมของ LIFF
  if (typeof liff === "undefined") {
    alert("ไม่พบ LIFF SDK กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
    return;
  }

  liff.init({ liffId: LIFF_ID })
    .then(() => {
      if (!liff.isLoggedIn() && !liff.isInClient()) {
        liff.login();
        return;
      }
      return liff.getProfile();
    })
    .then(profile => {
      if (!profile) return;

      const formData = {
        userId: profile.userId,
        fullName: fullName,
        phone: phone,
        qty: document.getElementById("qty-input").value,
        hotelMakkah: document.getElementById("hotelMakkah").value,
        hotelMadinah: document.getElementById("hotelMadinah").value,
        totalPrice: document.getElementById("price-display").textContent.trim()
      };

return fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(formData)
      });
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
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล: " + (err.message || err));
    });
}

// ส่วนคำนวณราคาและระบบปุ่มบวกลบ (รวมไว้บล็อกเดียว)
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