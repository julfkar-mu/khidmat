const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Prefer explicit API_TARGET; fallback to REACT_APP_API_URL for parity with CRA builds
let API_TARGET = process.env.API_TARGET || process.env.REACT_APP_API_URL || 'http://127.0.0.1:8080';
API_TARGET = String(API_TARGET).trim();

// Ensure we don't end up with a trailing '/api' on the target to avoid '/api/api' double prefix
if (API_TARGET.endsWith('/api')) {
    API_TARGET = API_TARGET.replace(/\/api$/, '');
}

// Fail fast if API_TARGET is somehow empty
if (!API_TARGET) {
    console.error('ERROR: API_TARGET is not set. Set API_TARGET env var, e.g. API_TARGET=http://localhost:8080');
    process.exit(1);
}

console.log(`Using API_TARGET=${API_TARGET}`, 'type=', typeof API_TARGET, 'len=', String(API_TARGET).length);

// DEBUG: log all incoming requests to verify they hit this process
app.use((req, res, next) => {
    console.log(`[incoming] ${new Date().toISOString()} ${req.method} ${req.originalUrl} from ${req.ip}`);
    next();
});

// Add a simple test route to confirm /api reaches this server (returns JSON)
app.get('/api/_self_test', (req, res) => {
    res.json({ ok: true, url: req.originalUrl, headers: req.headers });
});

// create proxy middleware instance using an explicit options object
const proxyOptions = {
    target: API_TARGET,
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req) => {
        console.log(`[proxy] ${req.method} ${req.originalUrl} -> ${API_TARGET}${req.originalUrl}`);
    },
    onProxyRes: (proxyRes, req) => {
        console.log(`[proxy-res] ${req.method} ${req.originalUrl} <- ${API_TARGET} status ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
        console.error('[proxy-error]', err && err.message, req.originalUrl);
        if (!res.headersSent) {
            res.status(502).json({ error: 'Bad gateway', details: err && err.message });
        }
    },
};

let apiProxy;
try {
    apiProxy = createProxyMiddleware(proxyOptions);
} catch (err) {
    console.error('Failed to create proxy middleware', err && err.message);
    process.exit(1);
}

// mount proxy at /api
app.use('/api', apiProxy);

// serve static build
app.use(express.static(path.join(__dirname, 'build')));

// SPA fallback — serve index.html for non-API GETs
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} -> API proxied to ${API_TARGET}`));