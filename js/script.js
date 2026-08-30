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

const makkahHotels = [

    { name: "Aayan Gulf Hotel", stars: 0 },
    { name: "Abd ElQader Naseer Endowment Hotel", stars: 0 },
    { name: "AL FAJER ALBADIA HOTEL 5", stars: 0 },
    { name: "Al Farabi Hotel", stars: 0 },
    { name: "Al Farabi Towers Hotel", stars: 0 },
    { name: "Al Mowhdeen Ajyad", stars: 0 },
    { name: "Al Rakaez Hotel", stars: 0 },
    { name: "Al Resala Al Masi Hotel", stars: 0 },
    { name: "Al Tawfeeg Hotel Azizyah", stars: 0 },
    { name: "Al Tayseer Tower Hotel", stars: 0 },
    { name: "Al Arooj Hotel", stars: 0 },
    { name: "Al-Orabi Hotel", stars: 0 },
    { name: "alawaleen haya hotel", stars: 0 },
    { name: "Alard Almotamyza Hotel", stars: 0 },
    { name: "aleazizia", stars: 0 },
    { name: "AlFajr AlBadie Hotel 1", stars: 0 },
    { name: "Aljumeza Tower", stars: 0 },
    { name: "alroh alhora hotel", stars: 0 },
    { name: "AlSukareya HOTEL", stars: 0 },
    { name: "Amal Al Mashaer Hotel", stars: 0 },
    { name: "Apartment Quadruple Near Alharam Makkah", stars: 0 },
    { name: "Arkan Al Mataf Hotel", stars: 0 },
    { name: "Asfour Hotel 01", stars: 0 },
    { name: "Askant Al Azizyia Hotel", stars: 0 },
    { name: "ASMA MAKKAH TAYSEER", stars: 0 },
    { name: "Awtad Elmotheca", stars: 0 },
    { name: "awtad almutahida Hotel", stars: 0 },
    { name: "BARADIS LAND HOTEL", stars: 0 },
    { name: "Baron Al zahabeya Hotel", stars: 0 },
    { name: "Blue Pearl Hotel", stars: 0 },
    { name: "Concrete Alsahab Hotel Makkah", stars: 0 },
    { name: "Dairy Al Majd Hotel", stars: 0 },
    { name: "Dairy Al Majd Hotel", stars: 0 },
    { name: "Durrat Al Bisan", stars: 0 },
    { name: "EMAAR AL KHALIL", stars: 0 },
    { name: "Forsan Ajyad", stars: 0 },
    { name: "Funduq Areej Al Zahabi Makkah", stars: 0 },
    { name: "Ghazala Beautiful Hotel", stars: 0 },
    { name: "Ghida Al Shishah hotel", stars: 0 },
    { name: "Golden Hospitality Hotel", stars: 0 },
    { name: "Grand Jawaher Alhashmiye Hotel Makkah", stars: 0 },
    { name: "Hayatt Suites & Hotel", stars: 0 },
    { name: "HDN HOTEL", stars: 0 },
    { name: "Hijaz Maqam", stars: 0 },
    { name: "Hotel Elazizizabarek Awtad", stars: 0 },
    { name: "Jawad Al Taj Hotel", stars: 0 },
    { name: "Jawaher Al Hashmiya- 6", stars: 0 },
    { name: "Jawharat Al Diyar - 1", stars: 0 },
    { name: "Jawharat Al Salah Hotel Makkah", stars: 0 },
    { name: "jwana alazizia", stars: 0 },
    { name: "Karam Hotel", stars: 0 },
    { name: "Karim Mecca Hotel", stars: 0 },
    { name: "Kenana Azizia", stars: 0 },
    { name: "Kenanah AlAziziyah", stars: 0 },
    { name: "Kinan Al Azizia Makkah Hotel", stars: 0 },
    { name: "Lidan Hotel", stars: 0 },
    { name: "Lifespans Resort", stars: 0 },
    { name: "MANAIR OSOUL HOTEL", stars: 0 },
    { name: "Manar Al Azhar Hotel", stars: 0 },
    { name: "Manara Al Muna-2", stars: 0 },
    { name: "Manarat Al Aziza-3", stars: 0 },
    { name: "Manarat Al Aziziyah Hotel", stars: 0 },
    { name: "Manarat Al Mashaer Hotel", stars: 0 },
    { name: "Manazel Alasala Makka Hotel 1", stars: 0 },
    { name: "Manazel Alzaereen Hotel 2", stars: 0 },
    { name: "Mashrab Riwa Almansour Hotel", stars: 0 },
    { name: "massat almashaeir hotel", stars: 0 },
    { name: "Mawakib Al Kawthar Hotel Makkah by moro", stars: 0 },
    { name: "Mawten Lamar Hotel", stars: 0 },
    { name: "Mayr Moyasar", stars: 0 },
    { name: "Meezab Alkher Hotel", stars: 0 },
    { name: "Moro Global Gold Al Aziziyah Hotel", stars: 0 },
    { name: "Murjan Al Mashaer Hotel", stars: 0 },
    { name: "Najmat Al Abrar Hotel", stars: 0 },
    { name: "Nawazi Towers Hotel", stars: 0 },
    { name: "Orouq Al-Dahab Hotel", stars: 0 },
    { name: "Orvana Thakher Hotel", stars: 0 },
    { name: "OSCCON AL Tayseer Hotel", stars: 0 },
    { name: "Owais Hotel", stars: 0 },
    { name: "Radwan Al Diyafah Hotel", stars: 0 },
    { name: "RAFAHEYAT ALMASHAAER", stars: 0 },
    { name: "Rafaheyat Alsetten Hotel", stars: 0 },
    { name: "Rahaf Almashaer Hotel", stars: 0 },
    { name: "Romance Room hotel", stars: 0 },
    { name: "Saif Plus 1", stars: 0 },
    { name: "Saif plus 2", stars: 0 },
    { name: "Samama Almaqam Hotel - Ajyad", stars: 0 },
    { name: "Saraya Abeer Hotel Company", stars: 0 },
    { name: "Saraya Al Misk Hotel", stars: 0 },
    { name: "Shumukh Alshalah Hotel", stars: 0 },
    { name: "Snood Al Baraka", stars: 0 },
    { name: "Snood Al Houda Hotel", stars: 0 },
    { name: "Snood Al Marowa Hotel", stars: 0 },
    { name: "Taj Al Zahabiya Hotel", stars: 0 },
    { name: "TARA ALYASMEEN HOTEL", stars: 0 },
    { name: "Tariq Alhajrih Hotel", stars: 0 },
    { name: "VERTA HOTEL MAKKAH", stars: 0 },
    { name: "Verta Hotel Al Mahabas", stars: 0 },
    { name: "Violet Al Shisha Hotel", stars: 0 },
    { name: "vivyan al Gemmayzeh", stars: 0 },
    { name: "World hospitality", stars: 0 },
    { name: "Zad Al-Mashaer Hotel", stars: 0 },
    { name: "Zahrat Al Saad 5", stars: 0 },
    { name: "Zahret Alforsan Hotel", stars: 0 },
    { name: "Zahrt Elsaad 6", stars: 0 },
    { name: "Zouk AlKhayal Hotel", stars: 0 },
    { name: "Aayan Al Barakah", stars: 1 },
    { name: "Abdul Hafez Al Humaidan Hotel", stars: 1 },
    { name: "Abraj Almisk Hotel", stars: 1 },
    { name: "ABRAJ ALMISK HOTEL", stars: 1 },
    { name: "Aeyan Almueabadh 1700M To Alharam", stars: 1 },
    { name: "Afraa Hotel", stars: 1 },
    { name: "Ajm Mina Hotel", stars: 1 },
    { name: "Al Adl Jewel Hotel", stars: 1 },
    { name: "Al Aseel Rafada", stars: 1 },
    { name: "Al Awtad United 4 Hotel AL Rawda", stars: 1 },
    { name: "Al Bilad Athnain 1 Hotel Makkah", stars: 1 },
    { name: "Al Bostan Al Masi Hotel", stars: 1 },
    { name: "Al Dera Hotel", stars: 1 },
    { name: "Al Janadriyah Towers Hotel", stars: 1 },
    { name: "Al Rakaez Hotel", stars: 1 },
    { name: "Al Refa Al Aziziyah Hotel", stars: 1 },
    { name: "Al Tawfiq Plaza Hotel", stars: 1 },
    { name: "Al Wahdat Al Mutamayiz Hotel", stars: 1 },
    { name: "Alayam Elite Hotel", stars: 1 },
    { name: "AlHayat Line Hotel", stars: 1 },
    { name: "Alhegaz Hotel", stars: 1 },
    { name: "AlRawda Almakyah Hotel", stars: 1 },
    { name: "alryada grand", stars: 1 },
    { name: "Amjad Al Deafah Hotel", stars: 1 },
    { name: "aosccon almasi 1", stars: 1 },
    { name: "Asfour Hotel 02", stars: 1 },
    { name: "Aziziyah", stars: 1 },
    { name: "Bab al-maltazam concorde hotel", stars: 1 },
    { name: "Beyab Al Azizeyyah Hotel", stars: 1 },
    { name: "Beyab Azizia Hotel", stars: 1 },
    { name: "Capital Guest hotel", stars: 1 },
    { name: "Cent Al Khair Hotel", stars: 1 },
    { name: "Dar Hadi Hotel", stars: 1 },
    { name: "Dhiafat Al-Raja Hotel", stars: 1 },
    { name: "Diouf Al Maqam Hotel 2", stars: 1 },
    { name: "Diyar Al-Mashaer Hotel", stars: 1 },
    { name: "Diyaralmashaer Al Hadiyah Hotel", stars: 1 },
    { name: "Durrat Al Salah", stars: 1 },
    { name: "Durrat Albayan hotel", stars: 1 },
    { name: "Durrat Mina Hotel", stars: 1 },
    { name: "Ehdaa Alwesam", stars: 1 },
    { name: "Emaar Al Manar", stars: 1 },
    { name: "Emaar Andalusia", stars: 1 },
    { name: "EMMAR AL NOOR", stars: 1 },
    { name: "Hayatt Makarem Hotel", stars: 1 },
    { name: "Hotel Akaber Alhyat Eltayser", stars: 1 },
    { name: "Hotel Burj Al Diyafa Mubarak", stars: 1 },
    { name: "Hotel To Alharam And Accept Your Room By Supervisor Contact Mobile Only", stars: 1 },
    { name: "Jawaher Al Bait 2 Hotel Makkah by Moro", stars: 1 },
    { name: "Jawharet Al Majd Hotel", stars: 1 },
    { name: "Joury Al mashaar", stars: 1 },
    { name: "Karam Al Refaa Hotel", stars: 1 },
    { name: "Kawther Albarka", stars: 1 },
    { name: "Knooz Aldiafah", stars: 1 },
    { name: "knooz Aldiafah 2", stars: 1 },
    { name: "Kol Alayam Hotel", stars: 1 },
    { name: "Mahd Al Resala 1 Hotel", stars: 1 },
    { name: "Maidan Al Bait", stars: 1 },
    { name: "Makkah Jewel Hotel", stars: 1 },
    { name: "Manara Al Muna-2", stars: 1 },
    { name: "Manazel Ajyad Hotel By Elaf", stars: 1 },
    { name: "Manazel Al Ain Ajyad Hotel", stars: 1 },
    { name: "Manazel Al Zaireen", stars: 1 },
    { name: "Manart Al Misk Hotel", stars: 1 },
    { name: "Masar Almisk Hotel", stars: 1 },
    { name: "Mathaba Hotel Makkah", stars: 1 },
    { name: "Mawten Snood Hotel", stars: 1 },
    { name: "Miaad Al Majd Hotel", stars: 1 },
    { name: "Miaad Al Majd Hotel", stars: 1 },
    { name: "Mila Hotels Makkah", stars: 1 },
    { name: "Mira Al Shaeb Hotel Makkah", stars: 1 },
    { name: "Mira Al Sudd Hotel Makkah", stars: 1 },
    { name: "Mira Nafaq Hotel Makkah", stars: 1 },
    { name: "Misk Umm Al Qura Hotel", stars: 1 },
    { name: "Nada Al Majd Hotel", stars: 1 },
    { name: "Najmat Alnoor Hotel", stars: 1 },
    { name: "New Level Hotel", stars: 1 },
    { name: "New Level Hotel Batha Quraish", stars: 1 },
    { name: "Noor Manazil", stars: 1 },
    { name: "Nour Manazel Alkeram Hotel", stars: 1 },
    { name: "Nukhbat Aljiwar Hotel Makkah by Moro", stars: 1 },
    { name: "Nuzhat Al Naseem Hotel", stars: 1 },
    { name: "Olyaan Silver", stars: 1 },
    { name: "Orvana Al Otaibiya Hotel", stars: 1 },
    { name: "Orvana AlNaseem", stars: 1 },
    { name: "Ouruq aldhahab almakiya", stars: 1 },
    { name: "Paradise Nice Hotel - AL Mahbas", stars: 1 },
    { name: "Park Inn By Radisson Makkah Aziziyah", stars: 1 },
    { name: "Qurtoba Al Aziziah", stars: 1 },
    { name: "RAFAHEYAT Hotel", stars: 1 },
    { name: "Rayhanat Almakan Hotel", stars: 1 },
    { name: "Razana Al Hafayyer", stars: 1 },
    { name: "Razana Al Rowdah", stars: 1 },
    { name: "Revan Hotel", stars: 1 },
    { name: "Rizq Palace Hotel", stars: 1 },
    { name: "Riyadh Al Deafah", stars: 1 },
    { name: "Rowaa Lindy Hotel Makkah", stars: 1 },
    { name: "Rowaa Makarem", stars: 1 },
    { name: "Royal Al Mashaer Hotel", stars: 1 },
    { name: "Rsael Almotaheda Hotel", stars: 1 },
    { name: "Rushud Al Majd Hotel", stars: 1 },
    { name: "Safeer Almisk Hotel", stars: 1 },
    { name: "Safeer Almisk Hotel", stars: 1 },
    { name: "Safwat Almiead Hotel", stars: 1 },
    { name: "Saif Al Majd Hotel", stars: 1 },
    { name: "Saif Plus 3", stars: 1 },
    { name: "Sama Al Amani Hotel", stars: 1 },
    { name: "Sama Al Deafah", stars: 1 },
    { name: "Sama Samah Hotel", stars: 1 },
    { name: "Sanam Al khair", stars: 1 },
    { name: "Saraya Abeer Hotel Makkah", stars: 1 },
    { name: "Saraya Almisk Hotel", stars: 1 },
    { name: "Sedra Mecca Hotel", stars: 1 },
    { name: "Shaza Al Azizia Al Massi", stars: 1 },
    { name: "Snood Al Marowa Hotel", stars: 1 },
    { name: "Snood Al Rayyan Hotel", stars: 1 },
    { name: "Sudair Karam Hotel", stars: 1 },
    { name: "Taj Park Hotel", stars: 1 },
    { name: "Verta Hotel AL shisha Makkah", stars: 1 },
    { name: "Wefaq Al Saha Hotel", stars: 1 },
    { name: "Wifaq Alnuzhah Hotel", stars: 1 },
    { name: "Abdul Hafez Al Humaidan Hotel", stars: 2 },
    { name: "Abed Massoudi Ajyad Hotel", stars: 2 },
    { name: "Adwa Manazil Alkiramhotel Services", stars: 2 },
    { name: "Al Barakah Mawaddah Hotel", stars: 2 },
    { name: "Al Balad Al Tayeb Ajyad Hotel", stars: 2 },
    { name: "Al Jabri Hotel", stars: 2 },
    { name: "Al Shahba Hotel Makkah", stars: 2 },
    { name: "Al Zaireen 2", stars: 2 },
    { name: "Al-Magd Hotel", stars: 2 },
    { name: "Al-Rehab Hotel", stars: 2 },
    { name: "Alabraj Hafawa Hotel Company", stars: 2 },
    { name: "Al Asail Sakai", stars: 2 },
    { name: "Awali Rose Hotel Suites", stars: 2 },
    { name: "Beyza Hotel", stars: 2 },
    { name: "Ehdaa Hotel", stars: 2 },
    { name: "Ehdaa Hotel Makkah", stars: 2 },
    { name: "Fundaq Bilal Makkah", stars: 2 },
    { name: "Hamad Saif Batal Hotel", stars: 2 },
    { name: "Kyona Hijra Hotel", stars: 2 },
    { name: "Landmark Darkm Hotel Makkah", stars: 2 },
    { name: "Loulouat Al Anood Hotel Mecca", stars: 2 },
    { name: "Luluat Al Badaie Hotel", stars: 2 },
    { name: "Mabani Al Mostqbal 2", stars: 2 },
    { name: "Makarem Mina Hotel", stars: 2 },
    { name: "Masat Al Majd Hotel", stars: 2 },
    { name: "Mizab Al Rawdah Hotel", stars: 2 },
    { name: "Namma Mawaddah Hotel", stars: 2 },
    { name: "Nasamat Makkah", stars: 2 },
    { name: "Nasamat Makkah Hotel", stars: 2 },
    { name: "Nice Suites & Hotels", stars: 2 },
    { name: "Nouran hotel", stars: 2 },
    { name: "Osturat Emaar Hotel", stars: 2 },
    { name: "Oyo 474 Alyousr Royal Hotel", stars: 2 },
    { name: "Palestine Hotel Makkah", stars: 2 },
    { name: "Rabwat Al Safwa 1 hotel", stars: 2 },
    { name: "rawdat myar", stars: 2 },
    { name: "Reef Global Hotel", stars: 2 },
    { name: "Rizq palace", stars: 2 },
    { name: "Sama al Misk hotel", stars: 2 },
    { name: "Shuail Nuzul", stars: 2 },
    { name: "Snood Ajyad Hotel Tower 1", stars: 2 },
    { name: "Taj Golden Hotel Taj Al Dhahabiya Al Rawda", stars: 2 },
    { name: "Tulen Rose Hotel", stars: 2 },
    { name: "Tulen Rose Hotel", stars: 2 },
    { name: "Violet Al Azizia Hotel", stars: 2 },
    { name: "Violet Al Shisha Hotel", stars: 2 },
    { name: "Wahat Al Refa Hotel", stars: 2 },
    { name: "Wahat Al Rifaa Hotel Makkah", stars: 2 },
    { name: "Wahat Almisk Hotel", stars: 2 },
    { name: "Wahet Al Deafah Makkah", stars: 2 },
    { name: "Whdat Tayesser", stars: 2 },
    { name: "Zahrat Lavender Hotel", stars: 2 },
    { name: "4 Al Rayyan Towers", stars: 3 },
    { name: "Abeer Al Azizia Hotel", stars: 3 },
    { name: "Abeer Al Deafah Hotel", stars: 3 },
    { name: "Abiat Alnasem Haven", stars: 3 },
    { name: "Aemadat Al Zahab Hotel", stars: 3 },
    { name: "Ajwad Ajyad Hotel", stars: 3 },
    { name: "Al Azhar Nuzhah Hotel", stars: 3 },
    { name: "Al Bayraq Hotel", stars: 3 },
    { name: "Al Hidayah Towers Hotel", stars: 3 },
    { name: "Al Jaad Kudai Hotel", stars: 3 },
    { name: "Al Joud Hotel Makkah", stars: 3 },
    { name: "Al Kiram Hotel", stars: 3 },
    { name: "Al Kiram Hotel", stars: 3 },
    { name: "Al Kiswah Tower 5 Hotel", stars: 3 },
    { name: "Al Kiswah Towers Hotel", stars: 3 },
    { name: "Al Massa Bader hotel", stars: 3 },
    { name: "Al Mozen Al Motalgh", stars: 3 },
    { name: "Al Naseem Hotel", stars: 3 },
    { name: "Al Olayan Golden Hotel Misfalah", stars: 3 },
    { name: "Al Olyan Golden Hotel", stars: 3 },
    { name: "Al Rabeh Hotel", stars: 3 },
    { name: "Al Rawhanya Hotel", stars: 3 },
    { name: "Al Rayyan Makiya Towers 4", stars: 3 },
    { name: "Al Rayyan Makiya Towers Hotel 1", stars: 3 },
    { name: "Al Rayyan Towers Hotel", stars: 3 },
    { name: "Al Refa Al Saad Hotel", stars: 3 },
    { name: "Al Refa Reea Bakhsh Hotel", stars: 3 },
    { name: "Al Safat Tower", stars: 3 },
    { name: "Al Safwah Orchid", stars: 3 },
    { name: "Al Tayseer Towers Hotel", stars: 3 },
    { name: "Al Thill Hotel", stars: 3 },
    { name: "Al-Rabih hotel", stars: 3 },
    { name: "Alarab Mashaer Hotel", stars: 3 },
    { name: "ALFAJAR ALBADIE HOTEL 6", stars: 3 },
    { name: "Alfateh Private Apartments", stars: 3 },
    { name: "Alzaer Almutamyez Ajyad", stars: 3 },
    { name: "Anan Hotel By Snood", stars: 3 },
    { name: "Apartments", stars: 3 },
    { name: "Aseel Almisk Hotel", stars: 3 },
    { name: "Askant Al Hafayer", stars: 3 },
    { name: "Askant Golden Hotel", stars: 3 },
    { name: "Bakkah Al Salah Hotel Makkah", stars: 3 },
    { name: "Bakkah Royal", stars: 3 },
    { name: "Beyab Al Azizeyya", stars: 3 },
    { name: "Blue Coral Hotel", stars: 3 },
    { name: "Borg Al Alam Hotel", stars: 3 },
    { name: "Boudl Ajyad", stars: 3 },
    { name: "Boudl Ajyad", stars: 3 },
    { name: "Burj Al Saif Hotel", stars: 3 },
    { name: "Burj Farah Hotel", stars: 3 },
    { name: "Cent Azizia", stars: 3 },
    { name: "Concorde Mina Hotel", stars: 3 },
    { name: "Diar Alkhalidiya Hotel", stars: 3 },
    { name: "Diyar Al Deafah Hotel", stars: 3 },
    { name: "Diwan Al Nuzha Serviced Apartments", stars: 3 },
    { name: "Elaf Bakkah Hotel", stars: 3 },
    { name: "Emaar Elite Hotel", stars: 3 },
    { name: "Emaar Elite Hotel", stars: 3 },
    { name: "EMAAR INTERNATIONAL", stars: 3 },
    { name: "Emaar Legend", stars: 3 },
    { name: "Ewg Al Azizia Hotel", stars: 3 },
    { name: "Ghadeer Ajyad", stars: 3 },
    { name: "Golden Baron Hotel", stars: 3 },
    { name: "Grand Al Massa Hotel", stars: 3 },
    { name: "Guest House Hotel", stars: 3 },
    { name: "Hibatullah Hotel Makkah managed by Accorhotels", stars: 3 },
    { name: "Hotel 21", stars: 3 },
    { name: "Hotel 21 Makkah", stars: 3 },
    { name: "Hotel Wedam 4", stars: 3 },
    { name: "Hussain Biyari Hotel", stars: 3 },
    { name: "Hussein Beyari Hotel", stars: 3 },
    { name: "ibis Styles Makkah", stars: 3 },
    { name: "jadda al khalil hotel", stars: 3 },
    { name: "Jar Albait Hotel", stars: 3 },
    { name: "Jawaher Al Bait Hotel", stars: 3 },
    { name: "Karim Mecca Hotel", stars: 3 },
    { name: "Kawther almahabba hotel", stars: 3 },
    { name: "Kayan Al Raya Hotel Makkah", stars: 3 },
    { name: "Kyona Alaziziyah", stars: 3 },
    { name: "Lamar Ajyad First Hotel Tower A", stars: 3 },
    { name: "Lamar Ajyad Hotel 2 Tower B", stars: 3 },
    { name: "Lamar Ajyad Hotel 2 Tower B", stars: 3 },
    { name: "Lamar Al Bait", stars: 3 },
    { name: "Land Premium Hotel 1 Makkah", stars: 3 },
    { name: "Le Meridien Makkah", stars: 3 },
    { name: "Le Meridien Towers Makkah", stars: 3 },
    { name: "Luluah Al-Iman Hotel", stars: 3 },
    { name: "Luluat Al Misk Hotel", stars: 3 },
    { name: "Maather Al Jiwaar Hotel", stars: 3 },
    { name: "Mahd Al Resala 3 Hotel", stars: 3 },
    { name: "Makkah Zad Al Tayseer", stars: 3 },
    { name: "MANART ALMISK HOTEL", stars: 3 },
    { name: "Manarat Gaza Hotel Al Haram Tower", stars: 3 },
    { name: "Maysan Al Maqam Hotel", stars: 3 },
    { name: "Maysan Al Moltazem Almahbas", stars: 3 },
    { name: "Mira Ajyad", stars: 3 },
    { name: "Mira Ajyad Hotel", stars: 3 },
    { name: "Mira Al Rawda", stars: 3 },
    { name: "Mira Al Rayyan Tower", stars: 3 },
    { name: "Montana Al Azizia Hotel", stars: 3 },
    { name: "Nada Al Deafah Hotel", stars: 3 },
    { name: "Nasaem Aljoury Hotel", stars: 3 },
    { name: "Nasamat Al Rayyan Concorde Hotel Makkah", stars: 3 },
    { name: "Nawazi Tower Hotel", stars: 3 },
    { name: "Noor Al Salah Hotel", stars: 3 },
    { name: "Nour Al Thuria Hotel", stars: 3 },
    { name: "Nur Al Naseem", stars: 3 },
    { name: "Nuzha Sqaure Hotel", stars: 3 },
    { name: "Olayan Diamond Hotel Al Maabda", stars: 3 },
    { name: "Olayan Plaza Hotel", stars: 3 },
    { name: "Open Hotel Makka", stars: 3 },
    { name: "Orvana Soul Serviced Apartments", stars: 3 },
    { name: "OYO 403 Hidaya Towers Hotel", stars: 3 },
    { name: "Qasr Al Azhar Hotel", stars: 3 },
    { name: "Qasr Al Sahab Hotel Makkah", stars: 3 },
    { name: "Qasr Alazizia Hotel", stars: 3 },
    { name: "Rafahya Hotel Makkah", stars: 3 },
    { name: "Rahaf Al Mashaer Hotel", stars: 3 },
    { name: "Ramada by Wyndham", stars: 3 },
    { name: "Rawhat Al Maqam Hotel", stars: 3 },
    { name: "Reefaf Al Sultan Hotel", stars: 3 },
    { name: "Rekaz Apart hotel", stars: 3 },
    { name: "Roots Hotel", stars: 3 },
    { name: "Rowaa Al Aziziyah", stars: 3 },
    { name: "Ruba Al Hijaz Hotel", stars: 3 },
    { name: "Sadan Plaza Hotel", stars: 3 },
    { name: "Safwat Ajyad 2", stars: 3 },
    { name: "Sama Al Amani Hotel", stars: 3 },
    { name: "Sama AlMisk Hotel", stars: 3 },
    { name: "Saraya Al Deafah Hotel", stars: 3 },
    { name: "Selat Al Bait Hotel", stars: 3 },
    { name: "Snaf Inn Azizia Hotel", stars: 3 },
    { name: "Snood AL-Dana Hotel", stars: 3 },
    { name: "Snood Ajyad Hotel Tower 1", stars: 3 },
    { name: "Snood Al Azama Hotel", stars: 3 },
    { name: "Snood Al Salam", stars: 3 },
    { name: "Snood Alazizyh Hotel", stars: 3 },
    { name: "Souoff Al Shouhada Hotel 3 Bedroom Apartment", stars: 3 },
    { name: "Spark By Hilton Makkah Aziziyah", stars: 3 },
    { name: "Sunrise Ajyad Hotel", stars: 3 },
    { name: "Three Pearls Musalli Makkah", stars: 3 },
    { name: "Three Points Musalli Makkah Hotel", stars: 3 },
    { name: "Wedam 3 Hotel 3 plagg", stars: 3 },
    { name: "Wefaq Al-Mashaer Hotel", stars: 3 },
    { name: "Worth Elite Hotel", stars: 3 },
    { name: "Yasmin Al Majd Hotel", stars: 3 },
    { name: "Zewar Al Mashaer Qasr Hotel", stars: 3 },
    { name: "Abraj Al Tayseer Tuwa Hotel", stars: 4 },
    { name: "Al Ebaa Hotel", stars: 4 },
    { name: "Al Ebaa Hotel", stars: 4 },
    { name: "Al Ebaa Hotel", stars: 4 },
    { name: "Al Jaad Mahbas Hotel", stars: 4 },
    { name: "Al Massa Dar Al Fayzeen Makkah", stars: 4 },
    { name: "Al Olayan Palace", stars: 4 },
    { name: "Al Safwah Hotel Tower 1", stars: 4 },
    { name: "Al Shohada by Palm Rich Makkah", stars: 4 },
    { name: "Awan Hotel", stars: 4 },
    { name: "Barakat Burhan Hotel", stars: 4 },
    { name: "Batoul Ajyad Hotel", stars: 4 },
    { name: "Batoul Ajyad Zouk AlKhayal Hotel", stars: 4 },
    { name: "Best Western Ajyad Makkah", stars: 4 },
    { name: "Best Western Ajyad Makkah", stars: 4 },
    { name: "Best Western Plus Al Massa", stars: 4 },
    { name: "Burj Al Deafah", stars: 4 },
    { name: "Concorde Makkah", stars: 4 },
    { name: "Copthorne Makkah Al Naseem", stars: 4 },
    { name: "Courtyard By Marriott Makkah", stars: 4 },
    { name: "Dar Raies Hotel", stars: 4 },
    { name: "Diyar Al Mashaer For Serviced Apartments", stars: 4 },
    { name: "DoubleTree by Hilton Makkah Aziziyah", stars: 4 },
    { name: "Doubletree by Hilton Jabal Omar Makkah", stars: 4 },
    { name: "Elaf Kinda Hotel", stars: 4 },
    { name: "Elaf Qinwan Hotel", stars: 4 },
    { name: "Elegant 3 Bedroom Retreat in Batha Quraish", stars: 4 },
    { name: "el maqam el zahbe", stars: 4 },
    { name: "EMMAR AL NOOR", stars: 4 },
    { name: "Four Points by Sheraton Makkah Al Naseem", stars: 4 },
    { name: "Infinity Hotel Makkah", stars: 4 },
    { name: "Jabal Al Nour Apartment", stars: 4 },
    { name: "Luxurious 2 Bedroom Apartment in Batha Quraish Makkah Al Rusaifah Apartment", stars: 4 },
    { name: "M Hotel Al Dana Makkah by Millennium", stars: 4 },
    { name: "Makarem Al Bait Hotel", stars: 4 },
    { name: "Makarem Umm Al Qura Hotel", stars: 4 },
    { name: "Makkah Hotel & Towers", stars: 4 },
    { name: "Maysan Al Mashaer Hotel", stars: 4 },
    { name: "Meezab Aldeyafah Hotel", stars: 4 },
    { name: "Mercure Makkah Aziziah", stars: 4 },
    { name: "Midan Hotel", stars: 4 },
    { name: "Millennium Makkah Al Naseem", stars: 4 },
    { name: "Mira Al Rawda Hotel Makkah", stars: 4 },
    { name: "Mnair Alosoul Hotel", stars: 4 },
    { name: "Montana Hotel Makkah", stars: 4 },
    { name: "Narjes Al Hadeqa Hotel", stars: 4 },
    { name: "NASAYIM ALJOURY", stars: 4 },
    { name: "Novotel Makkah Thakher City", stars: 4 },
    { name: "Park Inn by Radisson Makkah Thakher Algharbi", stars: 4 },
    { name: "Park Inn by Radisson Makkah Thakher Alsharqi", stars: 4 },
    { name: "Qurtuba Al Azizia 2 Hotel", stars: 4 },
    { name: "Ramada by Wyndham Makkah Zad Al Rawda", stars: 4 },
    { name: "Reefaf Alhaya Hotel", stars: 4 },
    { name: "Saja Hotels Makkah", stars: 4 },
    { name: "Sari Mina Hotel", stars: 4 },
    { name: "Sheraton Makkah Jabal Al Kaaba Hotel", stars: 4 },
    { name: "TIME Ruba Hotel & Suites", stars: 4 },
    { name: "voco Makkah by IHG", stars: 4 },
    { name: "Wassad Hotel Makkah", stars: 4 },
    { name: "Wirgan Al Noor, Tapestry Collection by Hilton", stars: 4 },
    { name: "Z-Residence by Dayf", stars: 4 },
    { name: "Zahrat Al Saad Hotel 3", stars: 4 },
    { name: "Zamzam Pullman Makkah", stars: 4 },
    { name: "Zwar Al Bait Hotel", stars: 4 },
    { name: "Address Jabal Omar Makkah", stars: 5 },
    { name: "Al Ghufran Safwah Hotel Makkah", stars: 5 },
    { name: "Al Marwa Rayhaan by Rotana", stars: 5 },
    { name: "Al Safwah Hotel Tower 3", stars: 5 },
    { name: "Al Tawfeeg Hotel Azizyah", stars: 5 },
    { name: "Anjum Hotel Makkah", stars: 5 },
    { name: "Conrad Jabal Omar Makkah", stars: 5 },
    { name: "EMAAR GRAND", stars: 5 },
    { name: "Hilton Hotel & Convention Jabal Omar Makkah", stars: 5 },
    { name: "Hilton Suites Jabal Omar Makkah", stars: 5 },
    { name: "Holiday Suites Al Azizia", stars: 5 },
    { name: "Intercontinental Dar Al Tawhid Makkah by IHG", stars: 5 },
    { name: "Jabal Omar Hyatt Regency Makkah", stars: 5 },
    { name: "Jabal Omar Marriott Hotel, Makkah", stars: 5 },
    { name: "Jumeirah Jabal Omar Makkah", stars: 5 },
    { name: "M Hotel Makkah by Millennium", stars: 5 },
    { name: "Makarem Ajyad Makkah Hotel", stars: 5 },
    { name: "Makkah Al Aziziah", stars: 5 },
    { name: "Makkah Clock Royal Tower, A Fairmont Hotel", stars: 5 },
    { name: "Makkah Hotel", stars: 5 },
    { name: "Makkah Towers", stars: 5 },
    { name: "Mövenpick Hotel & Residence Hajar Tower Makkah", stars: 5 },
    { name: "Park Inn by Radisson Makkah Aziziyah", stars: 5 },
    { name: "Park Inn by Radisson, Makkah Al Naseem", stars: 5 },
    { name: "Prestige Al Mashaer Hotel", stars: 5 },
    { name: "Raffles Makkah Palace", stars: 5 },
    { name: "Rotana Jabal Omar", stars: 5 },
    { name: "Swissôtel Al Maqam Makkah", stars: 5 },
    { name: "Swissôtel Makkah", stars: 5 },
    { name: "Tilal Jabal Alkabah", stars: 5 }
    // เพิ่มรายชื่อจริงตามต้องการ พร้อมระบุ stars: 0-5
];

const madinahHotels = [
    // ใส่รายชื่อโรงแรมมาดีนะฮ์แบบเดียวกัน { name, stars }
];

function renderHotelOptions(hotelList, datalistId, starValue) {
    const datalist = document.getElementById(datalistId);
    datalist.innerHTML = '';
    const filtered = starValue === 'all'
        ? hotelList
        : hotelList.filter(h => h.stars === parseInt(starValue));
    filtered.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h.name;
        datalist.appendChild(opt);
    });
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
        // ----- ฟิลเตอร์โรงแรมตามดาว -----
    const makkahFilter = document.getElementById('makkahStarFilter');
    const madinahFilter = document.getElementById('madinahStarFilter');

    renderHotelOptions(makkahHotels, 'makkah-hotels', 'all');
    renderHotelOptions(madinahHotels, 'madinah-hotels', 'all');

    makkahFilter.addEventListener('change', () => {
        renderHotelOptions(makkahHotels, 'makkah-hotels', makkahFilter.value);
    });
    madinahFilter.addEventListener('change', () => {
        renderHotelOptions(madinahHotels, 'madinah-hotels', madinahFilter.value);
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