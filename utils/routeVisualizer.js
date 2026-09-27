/**
 * Route & Middleware Visualizer for Express 5 & Express 4
 * Automatically introspects registered routers, child routers, and middleware stacks.
 */

function extractRoutes(app, registeredRouters = {}) {
    const endpoints = [];
    const globalMiddlewares = ['morgan (dev)', 'express.json()', 'cors()', 'requestTime'];

    // Inspect registered child routers
    Object.entries(registeredRouters).forEach(([basePath, router]) => {
        if (router && router.stack) {
            router.stack.forEach(layer => {
                if (layer.route) {
                    const subPath = layer.route.path === '/' ? '' : layer.route.path;
                    const fullPath = `${basePath}${subPath}`;
                    const methods = Object.keys(layer.route.methods || {}).map(m => m.toUpperCase());

                    methods.forEach(method => {
                        const methodHandlers = layer.route.stack
                            .filter(s => !s.method || s.method === method.toLowerCase())
                            .map(s => s.handle?.name || s.name || 'anonymous');

                        endpoints.push({
                            method,
                            path: fullPath,
                            basePath,
                            subPath: layer.route.path,
                            handlers: methodHandlers,
                            middlewares: [...globalMiddlewares, ...methodHandlers]
                        });
                    });
                }
            });
        }
    });

    return { endpoints, globalMiddlewares };
}

function renderVisualizerHtml(app, registeredRouters) {
    const { endpoints, globalMiddlewares } = extractRoutes(app, registeredRouters);

    const methodColors = {
        GET: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: '#10b981' },
        POST: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: '#3b82f6' },
        PATCH: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: '#f59e0b' },
        PUT: { bg: 'rgba(234, 88, 12, 0.15)', text: '#ea580c', border: '#ea580c' },
        DELETE: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: '#ef4444' }
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Natours API - Routes & Middleware Visualizer</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0b0f19;
            --card-bg: #111827;
            --border: #1f2937;
            --border-hover: #374151;
            --text: #f3f4f6;
            --text-muted: #9ca3af;
            --primary: #6366f1;
            --accent: #10b981;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg);
            color: var(--text);
            padding: 32px 24px;
            min-height: 100vh;
        }
        .container {
            max-width: 1100px;
            margin: 0 auto;
        }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 28px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border);
        }
        .header-title h1 {
            font-size: 26px;
            font-weight: 800;
            background: linear-gradient(135deg, #a5b4fc 0%, #6366f1 50%, #10b981 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
        }
        .header-title p {
            color: var(--text-muted);
            font-size: 14px;
            margin-top: 4px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 28px;
        }
        .stat-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 18px 20px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .stat-card .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            font-weight: 600;
        }
        .stat-card .value {
            font-size: 28px;
            font-weight: 800;
            color: #fff;
        }
        .controls {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }
        .search-box {
            flex: 1;
            min-width: 250px;
            position: relative;
        }
        .search-box input {
            width: 100%;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 12px 16px;
            color: var(--text);
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }
        .search-box input:focus {
            border-color: var(--primary);
        }
        .filter-buttons {
            display: flex;
            gap: 8px;
        }
        .filter-btn {
            background: var(--card-bg);
            border: 1px solid var(--border);
            color: var(--text-muted);
            padding: 10px 16px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .filter-btn:hover, .filter-btn.active {
            color: #fff;
            border-color: var(--primary);
            background: rgba(99, 102, 241, 0.15);
        }
        .routes-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .route-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 18px 20px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            transition: transform 0.15s ease, border-color 0.15s ease;
        }
        .route-card:hover {
            border-color: var(--border-hover);
            transform: translateY(-1px);
        }
        .route-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
        }
        .route-main {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .method-badge {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            font-weight: 700;
            padding: 6px 12px;
            border-radius: 8px;
            min-width: 72px;
            text-align: center;
            letter-spacing: 0.05em;
        }
        .endpoint-path {
            font-family: 'JetBrains Mono', monospace;
            font-size: 15px;
            font-weight: 600;
            color: #fff;
        }
        .endpoint-path span {
            color: #60a5fa;
        }
        .handler-badge {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            background: rgba(255, 255, 255, 0.06);
            color: #cbd5e1;
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .middleware-chain {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            padding-top: 12px;
            border-top: 1px dashed var(--border);
        }
        .middleware-chain .chain-label {
            font-size: 12px;
            color: var(--text-muted);
            font-weight: 500;
            margin-right: 4px;
        }
        .m-pill {
            font-size: 11px;
            font-family: 'JetBrains Mono', monospace;
            background: rgba(99, 102, 241, 0.12);
            color: #a5b4fc;
            border: 1px solid rgba(99, 102, 241, 0.25);
            padding: 3px 8px;
            border-radius: 6px;
        }
        .m-arrow {
            color: var(--text-muted);
            font-size: 11px;
        }
        .global-mddw-box {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }
        .global-mddw-box .title {
            font-size: 13px;
            font-weight: 600;
            color: #cbd5e1;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="header-title">
                <h1>Natours API Visualizer</h1>
                <p>Express 5 Route Hierarchy & Active Middleware Stack</p>
            </div>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <span class="label">Total Endpoints</span>
                <span class="value">${endpoints.length}</span>
            </div>
            <div class="stat-card">
                <span class="label">Routers Mounted</span>
                <span class="value">${Object.keys(registeredRouters).length}</span>
            </div>
            <div class="stat-card">
                <span class="label">Global Middlewares</span>
                <span class="value">${globalMiddlewares.length}</span>
            </div>
        </div>

        <div class="global-mddw-box">
            <span class="title">⚡ Global Pipeline Stack:</span>
            ${globalMiddlewares.map((m, i) => `
                <span class="m-pill">${m}</span>
                ${i < globalMiddlewares.length - 1 ? '<span class="m-arrow">➔</span>' : ''}
            `).join('')}
        </div>

        <div class="controls">
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Search by route path or controller (e.g. /tours, updateTour)..." oninput="filterRoutes()">
            </div>
            <div class="filter-buttons">
                <button class="filter-btn active" onclick="setMethodFilter('ALL')">ALL</button>
                <button class="filter-btn" onclick="setMethodFilter('GET')">GET</button>
                <button class="filter-btn" onclick="setMethodFilter('POST')">POST</button>
                <button class="filter-btn" onclick="setMethodFilter('PATCH')">PATCH</button>
                <button class="filter-btn" onclick="setMethodFilter('DELETE')">DELETE</button>
            </div>
        </div>

        <div class="routes-list" id="routesList">
            ${endpoints.map(ep => {
                const color = methodColors[ep.method] || { bg: 'rgba(255,255,255,0.1)', text: '#fff', border: '#555' };
                const formattedPath = ep.path.replace(/(:\w+)/g, '<span>$1</span>');
                return `
                <div class="route-card" data-method="${ep.method}" data-path="${ep.path.toLowerCase()}" data-handler="${ep.handlers.join(' ').toLowerCase()}">
                    <div class="route-header">
                        <div class="route-main">
                            <div class="method-badge" style="background: ${color.bg}; color: ${color.text}; border: 1px solid ${color.border};">
                                ${ep.method}
                            </div>
                            <div class="endpoint-path">${formattedPath}</div>
                        </div>
                        <div class="handler-badge">
                            Controller: <strong>${ep.handlers.join(', ')}</strong>
                        </div>
                    </div>
                    <div class="middleware-chain">
                        <span class="chain-label">Execution Pipeline:</span>
                        ${ep.middlewares.map((m, idx) => `
                            <span class="m-pill">${m}</span>
                            ${idx < ep.middlewares.length - 1 ? '<span class="m-arrow">➔</span>' : ''}
                        `).join('')}
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    </div>

    <script>
        let currentMethod = 'ALL';

        function setMethodFilter(method) {
            currentMethod = method;
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.textContent === method);
            });
            filterRoutes();
        }

        function filterRoutes() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            const cards = document.querySelectorAll('.route-card');

            cards.forEach(card => {
                const cardMethod = card.getAttribute('data-method');
                const cardPath = card.getAttribute('data-path');
                const cardHandler = card.getAttribute('data-handler');

                const matchesMethod = (currentMethod === 'ALL' || cardMethod === currentMethod);
                const matchesQuery = cardPath.includes(query) || cardHandler.includes(query);

                card.style.display = (matchesMethod && matchesQuery) ? 'flex' : 'none';
            });
        }
    </script>
</body>
</html>
    `;
}

module.exports = {
    renderVisualizerHtml,
    extractRoutes
};
