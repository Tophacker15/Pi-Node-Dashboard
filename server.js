import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { exec } from 'child_process';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));
app.set('view engine', 'ejs');

const HORIZON_URL = 'http://localhost:31401';

// ======= Helpers =======
function execCommand(cmd) {
    return new Promise((resolve) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) return resolve(stderr.trim() || 'Error');
            resolve(stdout.trim());
        });
    });
}

async function fetchHorizonInfo() {
    try {
        const res = await fetch(`${HORIZON_URL}/`);
        const data = await res.json();
        return {
            horizonVersion: data.horizon_version || '-',
            coreVersion: data.core_version || '-',
            ingestLatestLedger: data.ingest_latest_ledger ?? 0,
            historyLatestLedger: data.history_latest_ledger ?? 0,
            historyLedgerClosedAt: data.history_latest_ledger_closed_at || '-',
            coreLatestLedger: data.core_latest_ledger ?? 0,
            networkPassphrase: data.network_passphrase || '-',
            currentProtocolVersion: data.current_protocol_version ?? 0,
            supportedProtocolVersion: data.supported_protocol_version ?? 0,
            coreSupportedProtocolVersion: data.core_supported_protocol_version ?? 0
        };
    } catch (err) {
        console.error('Horizon fetch error:', err);
        return {
            horizonVersion: '-',
            coreVersion: '-',
            ingestLatestLedger: 0,
            historyLatestLedger: 0,
            historyLedgerClosedAt: '-',
            coreLatestLedger: 0,
            networkPassphrase: '-',
            currentProtocolVersion: 0,
            supportedProtocolVersion: 0,
            coreSupportedProtocolVersion: 0
        };
    }
}

// ======= Routes =======
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/api/status', async (req, res) => {
    // Docker container status
    const dockerStatus = await execCommand('docker ps --filter "name=mainnet" --format "{{.Status}}"');
    const containerStatus = dockerStatus.includes('Up') ? 'Running ✅' : 'Stopped ❌';

    // Stellar Core (via pi-node protocol-status JSON)
    let coreStatus = { state: 'Error ❌', ledger: 0, peers: 'N/A' };
    try {
        const coreRaw = await execCommand('docker exec mainnet pi-node protocol-status');
        const coreJson = JSON.parse(coreRaw);
        coreStatus = {
            state: coreJson.info.state || 'Error ❌',
            ledger: coreJson.info.ledger.num || 0,
            peers: coreJson.info.peers.authenticated_count ?? 0
        };
    } catch (err) {
        console.error('Core fetch error:', err);
    }

    // Horizon
    let horizonStatus = { latestLedger: 0, closedAt: '-' };
    try {
        const horizonRes = await fetch(`${HORIZON_URL}/`);
        const horizonData = await horizonRes.json();
        horizonStatus.latestLedger = horizonData.core_latest_ledger ?? 0;
        horizonStatus.closedAt = horizonData.history_latest_ledger_closed_at || '-';
    } catch (err) {
        console.error('Horizon status error:', err);
    }

    // Horizon info
    const horizonInfo = await fetchHorizonInfo();

    // Sync Progress (basic estimate)
    let syncProgress = 0;
    if (horizonStatus.latestLedger && coreStatus.ledger) {
        syncProgress = ((horizonStatus.latestLedger / coreStatus.ledger) * 100).toFixed(2);
    }

    res.json({
        containerStatus,
        coreStatus,
        horizonStatus,
        horizonInfo,
        syncProgress
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
