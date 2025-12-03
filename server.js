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

// ===== Helpers =====
function execCommand(cmd) {
    return new Promise((resolve) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) return resolve(null);
            resolve(stdout.trim());
        });
    });
}

async function fetchHorizonInfo() {
    try {
        const res = await fetch(HORIZON_URL);
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
    } catch {
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

async function fetchCoreStatus() {
    const defaultStatus = { state: 'Error ❌', ledger: 0, peers: 'N/A' };

    const raw = await execCommand('pi-node protocol-status');

    if (!raw) return defaultStatus;

    let json;
    try {
        json = JSON.parse(raw);
    } catch {
        console.log("Gagal parse Core JSON (ini normal jika belum sync)");
        return defaultStatus;
    }

    return {
        state: json?.info?.state === 'Synced!' ? 'Synced ✅' : json?.info?.state || 'Error ❌',
        ledger: json?.info?.ledger?.num ?? 0,
        peers: json?.info?.peers?.authenticated_count ?? 'N/A'
    };
}

// ===== Routes =====
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/api/status', async (req, res) => {
    const containerRaw = await execCommand('docker ps --filter "name=mainnet" --format "{{.Status}}"');
    const containerStatus = containerRaw?.includes('Up') ? 'Running ✅' : 'Stopped ❌';

    const coreStatus = await fetchCoreStatus();
    const horizonInfo = await fetchHorizonInfo();

    const horizonStatus = {
        latestLedger: horizonInfo.coreLatestLedger,
        closedAt: horizonInfo.historyLedgerClosedAt
    };

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

app.listen(PORT, () => console.log(`Pi Node Dashboard running at http://localhost:${PORT}`));
