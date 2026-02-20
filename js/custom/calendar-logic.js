// calendar-logic.js

// ====== 0. 国际化配置 (I18n) ======
let currentLang = 'zh'; // 默认中文 'zh' 或 'en'

const i18n = {
    zh: {
        months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        weekdays: ["日", "一", "二", "三", "四", "五", "六"],
        switchBtn: "Switch to English",
        selectTip: "选择日期查看历史",
        guideTip: "请拨动右侧的时间滚轮，选择年份和月份。<br>💡 推荐：1944年6月 (D-Day)。",
        emptyDate: "这一天，战线或许陷入泥泞，防空洞里或许一片死寂。没有宏大的战报，只有普通人为了生存而默默忍耐的一天。",
        catFrontline: "前线战况",
        catArchives: "影像与档案"
    },
    en: {
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        switchBtn: "切换回中文",
        selectTip: "Select a Date",
        guideTip: "Use the wheel picker on the right to select Year and Month.<br>💡 Recommended: June 1944 (D-Day).",
        emptyDate: "On this day, the frontlines may have been stuck in mud. No grand reports, just ordinary people enduring another day of survival.",
        catFrontline: "Frontline Status",
        catArchives: "Archives & Media"
    }
};

// ====== 1. 初始化 ======
function initAlmanacApp() {
    const appContainer = document.getElementById("almanac-app");
    if (!appContainer) return;
    if (appContainer.innerHTML.includes("cal-wrapper")) return;

    // 注入 HTML (增加了切换按钮)
    appContainer.innerHTML = `
        <div id="liberation-calendar-container">
            <div class="lang-switch-wrapper">
                <button class="lang-btn" onclick="toggleLanguage()">
                    <i class="fas fa-language"></i> <span id="lang-btn-text">${i18n[currentLang].switchBtn}</span>
                </button>
            </div>

            <div class="cal-wrapper">
                <div class="cal-details-panel" id="cal-details-panel">
                    <h3 class="cal-date-title" id="cal-display-date">${i18n[currentLang].selectTip}</h3>
                    <div id="cal-display-content">
                        <p>${i18n[currentLang].guideTip}</p>
                    </div>
                </div>

                <div class="cal-nav-panel">
                    <!-- 滚轮选择器 -->
                    <div class="date-picker-wrapper">
                        <div class="date-picker-highlight"></div>
                        <div class="picker-column" id="picker-year"><div class="picker-padding"></div><div class="picker-padding"></div></div>
                        <div class="picker-column" id="picker-month"><div class="picker-padding"></div><div class="picker-padding"></div></div>
                    </div>
                    <div class="cal-grid" id="cal-grid-container"></div>
                </div>
            </div>
        </div>
    `;

    initWheelPicker();
    calRenderCalendar();
}

let calCurrentDate = new Date(1944, 5, 1);

// ====== 语言切换逻辑 ======
function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    const langData = i18n[currentLang];

    // 1. 更新按钮文字
    document.getElementById('lang-btn-text').innerText = langData.switchBtn;

    // 2. 更新滚轮里的月份文字 (不重新生成DOM，只改字，保持滚动位置)
    const monthItems = document.querySelectorAll('#picker-month .picker-item');
    monthItems.forEach(item => {
        const idx = parseInt(item.dataset.val);
        item.innerText = langData.months[idx];
    });

    // 3. 重新渲染日历网格 (更新星期几)
    calRenderCalendar();

    // 4. 如果当前已经打开了某天的详情，重新加载详情以更新语言
    const activeCell = document.querySelector('.cal-active-date');
    if (activeCell) {
        // 从 activeCell 重新触发加载
        // 由于没有存当前选中的key，我们简单重置提示
        document.getElementById("cal-display-date").innerText = langData.selectTip;
        document.getElementById("cal-display-content").innerHTML = `<p>${langData.guideTip}</p>`;
    } else {
        // 更新默认提示
        document.getElementById("cal-display-date").innerText = langData.selectTip;
        document.getElementById("cal-display-content").innerHTML = `<p>${langData.guideTip}</p>`;
    }
}

// ====== 2. 滚轮逻辑 ======
function initWheelPicker() {
    const yearCol = document.getElementById("picker-year");
    const monthCol = document.getElementById("picker-month");
    
    for (let y = 1939; y <= 1950; y++) {
        const div = document.createElement("div");
        div.className = "picker-item";
        div.innerText = y;
        div.dataset.val = y;
        div.onclick = function() { smoothScrollTo(yearCol, this); };
        yearCol.insertBefore(div, yearCol.lastElementChild);
    }

    // 初始化月份 (使用当前语言)
    const months = i18n[currentLang].months;
    months.forEach((m, index) => {
        const div = document.createElement("div");
        div.className = "picker-item";
        div.innerText = m;
        div.dataset.val = index;
        div.onclick = function() { smoothScrollTo(monthCol, this); };
        monthCol.insertBefore(div, monthCol.lastElementChild);
    });

    let isScrolling = false;
    const handleScroll = (container, type) => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                detectSelection(container, type);
                isScrolling = false;
            });
            isScrolling = true;
        }
    };

    yearCol.addEventListener("scroll", () => handleScroll(yearCol, 'year'), { passive: true });
    monthCol.addEventListener("scroll", () => handleScroll(monthCol, 'month'), { passive: true });

    setTimeout(scrollToCurrentDate, 100);
}

function detectSelection(container, type) {
    const center = container.scrollTop + (container.clientHeight / 2);
    const items = container.querySelectorAll(".picker-item");
    let closest = null;
    let minDiff = Infinity;

    items.forEach(item => {
        const itemCenter = item.offsetTop + (item.clientHeight / 2);
        const diff = Math.abs(itemCenter - center);
        if (diff < minDiff) { minDiff = diff; closest = item; }
    });

    if (closest && minDiff < 20) {
        container.querySelectorAll(".picker-item-active").forEach(el => el.classList.remove("picker-item-active"));
        closest.classList.add("picker-item-active");

        if (type === 'year') {
            const newYear = parseInt(closest.dataset.val);
            if (calCurrentDate.getFullYear() !== newYear) {
                calCurrentDate.setFullYear(newYear);
                debounceRender();
            }
        } else {
            const newMonth = parseInt(closest.dataset.val);
            if (calCurrentDate.getMonth() !== newMonth) {
                calCurrentDate.setMonth(newMonth);
                debounceRender();
            }
        }
    }
}

let renderTimeout;
function debounceRender() {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(calRenderCalendar, 150);
}

function smoothScrollTo(container, targetEl) {
    const targetScroll = targetEl.offsetTop - (container.clientHeight / 2) + (targetEl.clientHeight / 2);
    container.scrollTo({ top: targetScroll, behavior: 'smooth' });
}

function scrollToCurrentDate() {
    const yearCol = document.getElementById("picker-year");
    const monthCol = document.getElementById("picker-month");
    if(!yearCol || !monthCol) return;

    const targetYear = calCurrentDate.getFullYear();
    const targetMonth = calCurrentDate.getMonth();

    const yearEl = Array.from(yearCol.children).find(el => el.dataset.val == targetYear);
    const monthEl = Array.from(monthCol.children).find(el => el.dataset.val == targetMonth);

    if(yearEl) {
        const top = yearEl.offsetTop - (yearCol.clientHeight / 2) + (yearEl.clientHeight / 2);
        yearCol.scrollTo({ top: top, behavior: 'auto' });
    } 
    if(monthEl) {
        const top = monthEl.offsetTop - (monthCol.clientHeight / 2) + (monthEl.clientHeight / 2);
        monthCol.scrollTo({ top: top, behavior: 'auto' });
    }
}

// ====== 3. 日历渲染逻辑 ======
function calRenderCalendar() {
    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();
    const langData = i18n[currentLang];
    
    // 更新导航栏上的文字 (虽然被CSS隐藏了，但保留逻辑无害)
    const monthLabel = document.getElementById("cal-current-month-year");
    if (monthLabel) monthLabel.innerText = `${langData.months[month]} ${year}`;
    
    const grid = document.getElementById("cal-grid-container");
    if (!grid) return;
    grid.innerHTML = "";
    
    // 渲染星期表头 (根据当前语言)
    langData.weekdays.forEach(d => {
        const div = document.createElement("div");
        div.className = "cal-day-header";
        div.innerText = d;
        grid.appendChild(div);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        grid.appendChild(document.createElement("div"));
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const div = document.createElement("div");
        div.className = "cal-date-cell";
        div.innerText = i;
        
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(i).padStart(2, '0');
        const dateKey = `${year}-${monthStr}-${dayStr}`;

        if (typeof calDatabase !== 'undefined' && calDatabase[dateKey]) {
            div.classList.add("cal-has-event");
        }

        div.onclick = () => calLoadDetails(dateKey, div);
        grid.appendChild(div);
    }
}

function calLoadDetails(dateKey, element) {
    document.querySelectorAll('.cal-date-cell').forEach(el => el.classList.remove('cal-active-date'));
    if(element) element.classList.add('cal-active-date');

    const titleEl = document.getElementById("cal-display-date");
    const contentEl = document.getElementById("cal-display-content");
    const langData = i18n[currentLang];
    
    if (typeof calDatabase === 'undefined') return;

    const data = calDatabase[dateKey];

    if (data) {
        // 智能获取标题：如果有英文版且当前是英文模式，用英文标题；否则用默认标题
        const titleText = (currentLang === 'en' && data.dateTitle_en) ? data.dateTitle_en : data.dateTitle;
        titleEl.innerText = titleText;
        
        let html = "";
        
        // 智能获取前线数据
        const frontlineList = (currentLang === 'en' && data.frontline_en) ? data.frontline_en : data.frontline;
        if (frontlineList && frontlineList.length > 0) {
            html += `<div class="cal-category"><div class="cal-category-title"><i class="fas fa-map-marker-alt"></i> ${langData.catFrontline}</div><ul class="cal-event-list">`;
            frontlineList.forEach(item => html += `<li>${item}</li>`);
            html += `</ul></div>`;
        }

        // 智能获取微观历史
        const microHistoryText = (currentLang === 'en' && data.microHistory_en) ? data.microHistory_en : data.microHistory;
        if (microHistoryText) {
            html += `<div class="cal-micro-history">${microHistoryText}</div>`;
        }

        if (data.media && data.media.length > 0) {
            html += `<div class="cal-category"><div class="cal-category-title"><i class="fas fa-photo-video"></i> ${langData.catArchives}</div><div class="cal-media-grid">`;
            data.media.forEach(m => {
                const captionText = (currentLang === 'en' && m.caption_en) ? m.caption_en : m.caption;
                html += `<div class="cal-media-card">`;
                if (m.type === "image") {
                    html += `<img src="${m.src}" alt="${captionText}"><div class="cal-media-caption">${captionText}</div>`;
                } else if (m.type === "video") {
                    html += `<iframe src="${m.src}" frameborder="0" allowfullscreen></iframe><div class="cal-media-caption">${captionText}</div>`;
                } else if (m.type === "link") {
                    html += `<div style="padding: 15px; text-align: center;"><a href="${m.url}" target="_blank" style="color: var(--theme-color); font-weight: bold; text-decoration: underline;">${m.text} <i class="fas fa-external-link-alt"></i></a></div>`;
                }
                html += `</div>`;
            });
            html += `</div></div>`;
        }

        contentEl.innerHTML = html;
    } else {
        titleEl.innerText = dateKey;
        contentEl.innerHTML = `<p style="color: #666; font-style: italic;">${langData.emptyDate}</p>`;
    }
}

function runAlmanac() {
    const container = document.getElementById("almanac-app");
    if (container && !container.querySelector(".cal-wrapper")) {
        initAlmanacApp();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAlmanac);
} else {
    runAlmanac();
}
document.addEventListener('pjax:complete', runAlmanac);
setTimeout(runAlmanac, 500);