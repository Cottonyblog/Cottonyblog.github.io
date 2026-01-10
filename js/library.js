// source/js/library.js

(function() {
  console.log('Library System Starting...');

  const App = {
    data: {},
    state: {
      tab: 'novel',
      filters: {},
      search: '',
      page: 1,
      size: 12, // 每页显示数量
      list: []  // 当前筛选结果
    },

    // 筛选配置
    config: {
      novel: [
        { key: 'genre', name: '类型', vals: ['现言','古言','无CP'] },
        { key: 'ml_status', name: '男主', vals: ['SC','初恋','非C','有前任'] },
        { key: 'love_type', name: '模式', vals: ['男暗恋女','双向暗恋','女主先'] }
      ],
      book: [
        { key: 'topic', name: '分类', vals: ['二战','文学','历史','社科'] },
        { key: 'rating', name: '评分', vals: [5, 4] }
      ],
      media: [
        { key: 'type', name: '形式', vals: ['电影','剧集','动漫'] },
        { key: 'topic', name: '题材', vals: ['二战','战争','纪录片'] }
      ]
    },

    init: function() {
      // 1. 读取第一步脚本注入的数据
      if (window.LIBRARY_DATA) {
        this.data = window.LIBRARY_DATA;
      } else {
        console.error("数据未加载！请检查 scripts/lib-injector.js 是否生效");
        return;
      }

      // 2. 渲染基础 HTML 结构
      this.renderLayout();

      // 3. 绑定事件
      this.bindEvents();

      // 4. 启动默认 Tab
      this.switchTab('novel');
    },

    // 渲染 HTML 骨架 (直接用 JS 生成，避免 Markdown 干扰)
    renderLayout: function() {
      const container = document.getElementById('library-app');
      container.innerHTML = `
        <!-- Tabs -->
        <div class="lib-tabs">
          <div class="lib-tab-item active" data-tab="novel">💘 晋江·暗恋</div>
          <div class="lib-tab-item" data-tab="book">📖 严肃·藏书</div>
          <div class="lib-tab-item" data-tab="media">🎬 影音·二战</div>
        </div>

        <!-- Panel -->
        <div class="lib-panel">
          <div class="lib-search-box">
            <span class="search-icon">🔍</span>
            <input type="text" class="lib-search-input" placeholder="搜索书名、作者、标签...">
          </div>
          <div id="filter-container"></div>
          <div class="lib-stat-bar">
            <span>筛选结果: <b id="count-num" style="color:#49b1f5">0</b></span>
            <span id="reset-btn" style="cursor:pointer; text-decoration:underline">重置条件</span>
          </div>
        </div>

        <!-- Grid -->
        <div id="lib-grid" class="lib-grid"></div>

        <!-- Loader -->
        <div class="load-more-box">
          <button id="load-btn" class="load-btn hidden">加载更多</button>
        </div>
      `;
    },

    bindEvents: function() {
      const container = document.getElementById('library-app');
      
      // Tab 切换
      container.querySelectorAll('.lib-tab-item').forEach(btn => {
        btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
      });

      // 搜索
      container.querySelector('.lib-search-input').addEventListener('input', (e) => {
        this.state.search = e.target.value.toLowerCase().trim();
        this.state.page = 1;
        this.process();
      });

      // 重置
      container.querySelector('#reset-btn').addEventListener('click', () => {
        this.state.filters = {};
        this.state.search = '';
        container.querySelector('.lib-search-input').value = '';
        this.renderFilters();
        this.process();
      });

      // 加载更多
      container.querySelector('#load-btn').addEventListener('click', () => {
        this.state.page++;
        this.renderList(true);
      });
    },

    switchTab: function(tab) {
      this.state.tab = tab;
      this.state.filters = {};
      this.state.search = '';
      this.state.page = 1;
      
      // 更新 Tab 样式
      document.querySelectorAll('.lib-tab-item').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tab);
      });

      // 更新二战主题
      const panel = document.querySelector('.lib-panel');
      if (tab !== 'novel') panel.classList.add('ww2-mode');
      else panel.classList.remove('ww2-mode');

      // 渲染筛选器
      this.renderFilters();
      // 处理数据
      this.process();
    },

    renderFilters: function() {
      const container = document.getElementById('filter-container');
      const conf = this.config[this.state.tab];
      let html = '';

      if (conf) {
        conf.forEach(group => {
          html += `<div class="filter-row"><span class="filter-label">${group.name}</span>`;
          group.vals.forEach(val => {
            const display = val === 5 ? '⭐⭐⭐⭐⭐' : val;
            html += `<span class="tag-btn" onclick="LibraryApp.toggleFilter('${group.key}', '${val}', this)">${display}</span>`;
          });
          html += `</div>`;
        });
      }
      container.innerHTML = html;
    },

    toggleFilter: function(key, val, el) {
      if (!isNaN(val)) val = Number(val);
      el.classList.toggle('active');

      if (!this.state.filters[key]) this.state.filters[key] = [];
      const idx = this.state.filters[key].indexOf(val);
      
      if (idx > -1) this.state.filters[key].splice(idx, 1);
      else this.state.filters[key].push(val);

      if (this.state.filters[key].length === 0) delete this.state.filters[key];

      this.state.page = 1;
      this.process();
    },

    process: function() {
      const source = this.data[this.state.tab] || [];
      
      this.state.list = source.filter(item => {
        // 搜索
        if (this.state.search) {
          const str = (item.title + item.author + (item.comment||'') + (item.topic||'')).toLowerCase();
          if (!str.includes(this.state.search)) return false;
        }
        // 筛选
        for (let key in this.state.filters) {
          const wants = this.state.filters[key];
          const has = item[key];
          if (!has) return false;
          
          let match = false;
          wants.forEach(w => {
            if (String(has).includes(String(w))) match = true;
          });
          if (!match) return false;
        }
        return true;
      });

      document.getElementById('count-num').innerText = this.state.list.length;
      this.renderList(false);
    },

    renderList: function(append) {
      const grid = document.getElementById('lib-grid');
      const btn = document.getElementById('load-btn');
      
      if (!append) grid.innerHTML = '';

      const start = append ? (this.state.page - 1) * this.state.size : 0;
      const end = this.state.page * this.state.size;
      const data = this.state.list.slice(start, end);

      if (this.state.list.length === 0) {
        grid.innerHTML = '<div style="padding:40px; text-align:center; width:100%; color:#999">暂无相关数据</div>';
        btn.classList.add('hidden');
        return;
      }

      let html = '';
      data.forEach(item => {
        const isWW2 = (item.topic && item.topic.includes('二战'));
        const typeClass = `type-${this.state.tab} ${isWW2 ? 'is-ww2' : ''}`;
        
        // 标签生成
        let tags = '';
        const keys = ['genre', 'ml_status', 'love_type', 'topic', 'type'];
        keys.forEach(k => {
          if (item[k]) {
            const isHl = this.state.filters[k] && JSON.stringify(this.state.filters[k]).includes(item[k]);
            tags += `<span class="mini-tag ${isHl?'hl':''}">${item[k]}</span>`;
          }
        });
        if (item.rating) tags += `<span class="mini-tag" style="color:#f39c12">★${item.rating}</span>`;

        html += `
          <div class="lib-card ${typeClass}">
            <a href="${item.link || 'javascript:;'}" target="_blank" class="card-title">${item.title}</a>
            <div class="card-meta">
              ${item.author ? '👤 '+item.author : ''} 
              ${item.year ? ' · '+item.year : ''}
            </div>
            <div class="card-tags">${tags}</div>
            <div class="card-comment">${item.comment || '暂无评价'}</div>
          </div>
        `;
      });

      if (append) grid.insertAdjacentHTML('beforeend', html);
      else grid.innerHTML = html;

      // 按钮显隐
      if (end >= this.state.list.length) btn.classList.add('hidden');
      else btn.classList.remove('hidden');
    }
  };

  // 挂载到全局
  window.LibraryApp = App;
  
  // 启动
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
  
  // PJAX 适配
  document.addEventListener('pjax:complete', () => App.init());

})();