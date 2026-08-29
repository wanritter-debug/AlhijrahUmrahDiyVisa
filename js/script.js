document.addEventListener('DOMContentLoaded', () => {
    const plusBtn = document.getElementById('btn-plus');
    const minusBtn = document.getElementById('btn-minus');
    const qtyInput = document.getElementById('qty-input');
    const priceDisplay = document.getElementById('price-display');
    const discountBadge = document.getElementById('discount-badge');

    function updatePrice() {
        let qty = parseInt(qtyInput.value);
        let pricePerPerson = 6500; // 1-5 ท่าน

        if (qty >= 6 && qty <= 9) {
            pricePerPerson = 5800; // 6-9 ท่าน
            if (discountBadge) {
                discountBadge.textContent = '🎉 ประหยัด 10% (ลด 700 บาท/ท่าน)';
                discountBadge.style.color = '#2e7d32';
            }
        } else if (qty >= 10) {
            pricePerPerson = 5500; // 10 ท่านขึ้นไป
            if (discountBadge) {
                discountBadge.textContent = '🔥 คุ้มที่สุด! ประหยัด 15% (ลด 1,000 บาท/ท่าน)';
                discountBadge.style.color = '#d32f2f';
            }
        } else {
            // กรณี 1-5 ท่าน (ราคาปกติ)
            if (discountBadge) {
                discountBadge.textContent = '💡 เดินทาง 6 ท่านขึ้นไป รับส่วนลดสูงสุด 15%';
                discountBadge.style.color = '#666666';
            }
        }

        let totalPrice = qty * pricePerPerson;
        priceDisplay.textContent = totalPrice.toLocaleString() + ' บาท';
    }

    if (plusBtn && minusBtn && qtyInput && priceDisplay) {
        plusBtn.addEventListener('click', () => {
            let qty = parseInt(qtyInput.value);
            qtyInput.value = qty + 1;
            updatePrice();
        });

        minusBtn.addEventListener('click', () => {
            let qty = parseInt(qtyInput.value);
            if (qty > 1) {
                qtyInput.value = qty - 1;
                updatePrice();
            }
        });
    }
});

function submitBooking() {
  const LIFF_ID = "2008429094-YTq3YOaG";
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxnSgVoJjbVVJyiGGya93ZymSsYPJH3o5snYxtzuy2RdlKjWcq5pFOEtouaDM7GCGMy/exec";

  liff.init({ liffId: LIFF_ID }).then(() => {
    liff.getProfile().then(profile => {
      const formData = {
        userId: profile.userId,
        fullName: document.getElementById("fullName").value,
        phone: document.getElementById("phone").value,
        qty: document.getElementById("qty-input").value,
        hotelMakkah: document.getElementById("hotelMakkah").value,
        hotelMadinah: document.getElementById("hotelMadinah").value,
        totalPrice: document.getElementById("price-display").innerText
      };

      if (!formData.fullName || !formData.phone) {
        alert("กรุณากรอกชื่อ-สกุล และเบอร์โทรศัพท์ให้ครบถ้วน");
        return;
      }

      fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(formData)
      })
      .then(res => res.json())
      .then(data => {
        alert("ส่งข้อมูลการจองเรียบร้อยแล้ว");
        liff.closeWindow();
      })
      .catch(err => alert("เกิดข้อผิดพลาดในการส่งข้อมูล"));
    });
  }).catch(err => {
    console.error("LIFF Init Error:", err);
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อ LINE");
  });
}