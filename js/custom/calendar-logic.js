function initAlmanacApp() {
    const appContainer = document.getElementById("almanac-app");
    if (!appContainer) return;

    appContainer.innerHTML = `
        <div id="liberation-calendar-container">
            <div class="cal-wrapper">
                <div class="cal-details-panel" id="cal-details-panel">
                    <h3 class="cal-date-title" id="cal-display-date">选择右侧日期以查看历史</h3>
                    <div id="cal-display-content">
                        <p>点击日历中带有高亮标记的日期，查阅当天的宏观战报、微观生存日志以及相关影像资料。</p>
                        <p>💡 推荐查看：1944-06-06 (D-Day) 或 1944-08-25 (巴黎解放)。</p>
                    </div>
                </div>
                <div class="cal-nav-panel">
                    <div class="cal-nav-header">
                        <button onclick="calChangeMonth(-1)">&lt;</button>
                        <span id="cal-current-month-year">June 1944</span>
                        <button onclick="calChangeMonth(1)">&gt;</button>
                    </div>
                    <div class="cal-grid" id="cal-grid-container"></div>
                </div>
            </div>
        </div>
    `;

    calRenderCalendar();
}

let calCurrentDate = new Date(1944, 5, 1);

function calRenderCalendar() {
    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();
    const monthNames = ;
    
    const monthLabel = document.getElementById("cal-current-month-year");
    if (monthLabel) monthLabel.innerText = `${monthNames} ${year}`;
    
    const grid = document.getElementById("cal-grid-container");
    if (!grid) return;
    grid.innerHTML = "";
    
    const daysOfWeek =;
    daysOfWeek.forEach(d => {
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

        if (typeof calDatabase !== 'undefined' && calDatabase) {
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
    
    if (typeof calDatabase === 'undefined') {
        if(contentEl) contentEl.innerHTML = "<p>数据加载失败，请检查 database.js。</p>";
        return;
    }

    const data = calDatabase;

    if (data && titleEl && contentEl) {
        titleEl.innerText = data.dateTitle || dateKey;
        let html = "";
        
        if (data.frontline && data.frontline.length > 0) {
            html += `<div class="cal-category"><div class="cal-category-title"><i class="fas fa-map-marker-alt"></i> 前线战况 (Frontline)</div><ul class="cal-event-list">`;
            data.frontline.forEach(item => html += `<li>${item}</li>`);
            html += `</ul></div>`;
        }

        if (data.microHistory) {
            html += `<div class="cal-micro-history">${data.microHistory}</div>`;
        }

        if (data.media && data.media.length > 0) {
            html += `<div class="cal-category"><div class="cal-category-title"><i class="fas fa-photo-video"></i> 影像与档案 (Archives)</div><div class="cal-media-grid">`;
            data.media.forEach(m => {
                html += `<div class="cal-media-card">`;
                if (m.type === "image") {
                    html += `<img src="${m.src}" alt="${m.caption}"><div class="cal-media-caption">${m.caption}</div>`;
                } else if (m.type === "video") {
                    html += `<iframe src="${m.src}" frameborder="0" allowfullscreen></iframe><div class="cal-media-caption">${m.caption}</div>`;
                } else if (m.type === "link") {
                    html += `<div style="padding: 15px; text-align: center;"><a href="${m.url}" target="_blank" style="color: var(--theme-color); font-weight: bold; text-decoration: underline;">${m.text} <i class="fas fa-external-link-alt"></i></a></div>`;
                }
                html += `</div>`;
            });
            html += `</div></div>`;
        }

        contentEl.innerHTML = html;
    } else if (titleEl && contentEl) {
        titleEl.innerText = dateKey;
        contentEl.innerHTML = `<p style="color: #666; font-style: italic;">这一天，战线或许陷入泥泞，防空洞里或许一片死寂。没有宏大的战报，只有普通人为了生存而默默忍耐的一天。他们支撑住的这一天，构成了通向胜利的漫长阶梯。</p>`;
    }
}

function calChangeMonth(offset) {
    calCurrentDate.setMonth(calCurrentDate.getMonth() + offset);
    calRenderCalendar();
    const titleEl = document.getElementById("cal-display-date");
    const contentEl = document.getElementById("cal-display-content");
    if(titleEl) titleEl.innerText = "选择右侧日期以查看历史";
    if(contentEl) contentEl.innerHTML = "<p>请点击高亮日期。</p>";
}

// ====== 启动逻辑 (必须放在文件最底部) ======
function runAlmanac() {
    const container = document.getElementById("almanac-app");
    if (container && !container.innerHTML.includes("cal-wrapper")) {
        console.log("注入日历...");
        initAlmanacApp();
    }
}

// 针对直接输入网址或刷新页面的情况
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAlmanac);
} else {
    runAlmanac();
}

// 针对 Butterfly 主题的 Pjax 无刷新跳转情况
document.addEventListener('pjax:complete', function() {
    console.log("Pjax 触发，重新加载日历...");
    runAlmanac();
});

// 保底：强制检查
setTimeout(runAlmanac, 1000);