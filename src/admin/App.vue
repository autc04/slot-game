<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface InstanceState {
    money: number;
}

type AppState = Record<string, InstanceState>;

const INSTANCES = ['1', '2'] as const;

const state = ref<AppState>({ '1': { money: 0 }, '2': { money: 0 } });
const newMoney = ref<Record<string, string>>({ '1': '', '2': '' });
const connected = ref(false);

let es: EventSource | null = null;

onMounted(() => {
    es = new EventSource('/admin/events');
    es.onopen = () => { connected.value = true; };
    es.onmessage = (e: MessageEvent) => {
        state.value = JSON.parse(e.data);
    };
    es.onerror = () => { connected.value = false; };
});

onUnmounted(() => es?.close());

async function setMoney(instance: string) {
    const amount = parseInt(newMoney.value[instance], 10);
    if (isNaN(amount) || amount < 0) return;
    await fetch(`/${instance}/money`, {
        method: 'POST',
        body: String(amount),
    });
    newMoney.value[instance] = '';
}
</script>

<template>
    <div class="admin">
        <header>
            <h1>Slot Machine Admin</h1>
            <span class="status" :class="connected ? 'online' : 'offline'">
                {{ connected ? 'live' : 'disconnected' }}
            </span>
        </header>

        <div class="instances">
            <div v-for="inst in INSTANCES" :key="inst" class="card">
                <h2>Machine {{ inst }}</h2>
                <p class="balance">${{ state[inst]?.money ?? '—' }}</p>
                <div class="controls">
                    <input
                        v-model="newMoney[inst]"
                        type="number"
                        min="0"
                        placeholder="New balance"
                        @keyup.enter="setMoney(inst)"
                    />
                    <button @click="setMoney(inst)">Set</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.admin {
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 40px auto;
    padding: 0 20px;
    color: #e0e0e0;
    background: #1a1a2e;
    min-height: 100vh;
}

header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px 0 32px;
    border-bottom: 1px solid #333;
    margin-bottom: 32px;
}

h1 { margin: 0; font-size: 24px; }

.status {
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 12px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.status.online  { background: #1a4a2a; color: #4caf50; }
.status.offline { background: #4a1a1a; color: #f44336; }

.instances { display: flex; gap: 24px; flex-wrap: wrap; }

.card {
    flex: 1;
    min-width: 220px;
    background: #16213e;
    border: 1px solid #0f3460;
    border-radius: 8px;
    padding: 24px;
}

.card h2 { margin: 0 0 12px; font-size: 18px; color: #a0c4ff; }

.balance {
    font-size: 36px;
    font-weight: bold;
    color: #ffd700;
    margin: 0 0 20px;
}

.controls { display: flex; gap: 8px; }

input[type="number"] {
    flex: 1;
    padding: 8px 12px;
    background: #0f3460;
    border: 1px solid #1a5276;
    border-radius: 4px;
    color: #e0e0e0;
    font-size: 14px;
}

button {
    padding: 8px 16px;
    background: #0f3460;
    border: 1px solid #1a5276;
    border-radius: 4px;
    color: #a0c4ff;
    font-size: 14px;
    cursor: pointer;
}
button:hover { background: #1a5276; }
</style>
