<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface InstanceState {
    money: number;
    winPayout: number;
    winBias: number;
    betPrice: number;
    jackpotIncrement: number;
    jackpot: number;
    shiftingDelay: number;
    speed: number;
    initialDelay: number;
}

type AppState = Record<string, InstanceState>;

const INSTANCES = ['1', '2', '3'] as const;

const state = ref<AppState>({ '1': { money: 0, winPayout: 10, winBias: 0, betPrice: 5, jackpotIncrement: 0, jackpot: 0, shiftingDelay: 800, speed: 50, initialDelay: 0 }, '2': { money: 0, winPayout: 10, winBias: 0, betPrice: 5, jackpotIncrement: 0, jackpot: 0, shiftingDelay: 800, speed: 50, initialDelay: 0 }, '3': { money: 0, winPayout: 10, winBias: 0, betPrice: 5, jackpotIncrement: 0, jackpot: 0, shiftingDelay: 800, speed: 50, initialDelay: 0 } });
const newMoney = ref<Record<string, string>>({ '1': '', '2': '', '3': '' });
const newWinPayout = ref<Record<string, string>>({ '1': '', '2': '', '3': '' });
const newWinBias = ref<Record<string, string>>({ '1': '', '2': '', '3': '' });
const newBetPrice = ref<Record<string, string>>({ '1': '', '2': '', '3': '' });
const newJackpotIncrement = ref<Record<string, string>>({ '1': '', '2': '', '3': '' });
const newShiftingDelay = ref<Record<string, string>>({ '1': '', '2': '', '3': '' });
const newSpeed = ref<Record<string, string>>({ '1': '', '2': '', '3': '' });
const newInitialDelay = ref<Record<string, string>>({ '1': '', '2': '', '3': '' });
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

async function setWinPayout(instance: string) {
    const amount = parseInt(newWinPayout.value[instance], 10);
    if (isNaN(amount) || amount < 0) return;
    await fetch(`/${instance}/win-amount`, {
        method: 'POST',
        body: String(amount),
    });
    newWinPayout.value[instance] = '';
}

async function setWinBias(instance: string) {
    const amount = parseInt(newWinBias.value[instance], 10);
    if (isNaN(amount) || amount < -10 || amount > 10) return;
    await fetch(`/${instance}/win-bias`, {
        method: 'POST',
        body: String(amount),
    });
    newWinBias.value[instance] = '';
}

async function setBetPrice(instance: string) {
    const amount = parseInt(newBetPrice.value[instance], 10);
    if (isNaN(amount) || amount < 1) return;
    await fetch(`/${instance}/bet-price`, {
        method: 'POST',
        body: String(amount),
    });
    newBetPrice.value[instance] = '';
}

async function setJackpotIncrement(instance: string) {
    const amount = parseInt(newJackpotIncrement.value[instance], 10);
    if (isNaN(amount) || amount < 0) return;
    await fetch(`/${instance}/jackpot-increment`, {
        method: 'POST',
        body: String(amount),
    });
    newJackpotIncrement.value[instance] = '';
}

async function setShiftingDelay(instance: string) {
    const amount = parseInt(newShiftingDelay.value[instance], 10);
    if (isNaN(amount) || amount < 0) return;
    await fetch(`/${instance}/shifting-delay`, {
        method: 'POST',
        body: String(amount),
    });
    newShiftingDelay.value[instance] = '';
}

async function setSpeed(instance: string) {
    const amount = parseInt(newSpeed.value[instance], 10);
    if (isNaN(amount) || amount < 1) return;
    await fetch(`/${instance}/speed`, {
        method: 'POST',
        body: String(amount),
    });
    newSpeed.value[instance] = '';
}

async function setInitialDelay(instance: string) {
    const amount = parseInt(newInitialDelay.value[instance], 10);
    if (isNaN(amount) || amount < 0) return;
    await fetch(`/${instance}/initial-delay`, {
        method: 'POST',
        body: String(amount),
    });
    newInitialDelay.value[instance] = '';
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
                <div class="field">
                    <label>Win payout: ${{ state[inst]?.winPayout ?? '—' }}</label>
                    <div class="controls">
                        <input
                            v-model="newWinPayout[inst]"
                            type="number"
                            min="0"
                            placeholder="New win payout"
                            @keyup.enter="setWinPayout(inst)"
                        />
                        <button @click="setWinPayout(inst)">Set</button>
                    </div>
                </div>
                <div class="field">
                    <label>Win bias: {{ state[inst]?.winBias ?? '—' }} (−10 to +10)</label>
                    <div class="controls">
                        <input
                            v-model="newWinBias[inst]"
                            type="number"
                            min="-10"
                            max="10"
                            placeholder="New win bias"
                            @keyup.enter="setWinBias(inst)"
                        />
                        <button @click="setWinBias(inst)">Set</button>
                    </div>
                </div>
                <div class="field">
                    <label>Bet price: ${{ state[inst]?.betPrice ?? '—' }}</label>
                    <div class="controls">
                        <input
                            v-model="newBetPrice[inst]"
                            type="number"
                            min="1"
                            placeholder="New bet price"
                            @keyup.enter="setBetPrice(inst)"
                        />
                        <button @click="setBetPrice(inst)">Set</button>
                    </div>
                </div>
                <div class="field">
                    <label>Jackpot increment: ${{ state[inst]?.jackpotIncrement ?? '—' }}</label>
                    <div class="controls">
                        <input
                            v-model="newJackpotIncrement[inst]"
                            type="number"
                            min="0"
                            placeholder="New jackpot increment"
                            @keyup.enter="setJackpotIncrement(inst)"
                        />
                        <button @click="setJackpotIncrement(inst)">Set</button>
                    </div>
                </div>
                <div class="field">
                    <label>Jackpot: ${{ state[inst]?.jackpot ?? '—' }}</label>
                </div>
                <div class="field">
                    <label>Shifting delay: {{ state[inst]?.shiftingDelay ?? '—' }} ms</label>
                    <div class="controls">
                        <input
                            v-model="newShiftingDelay[inst]"
                            type="number"
                            min="0"
                            placeholder="New shifting delay"
                            @keyup.enter="setShiftingDelay(inst)"
                        />
                        <button @click="setShiftingDelay(inst)">Set</button>
                    </div>
                </div>
                <div class="field">
                    <label>Speed: {{ state[inst]?.speed ?? '—' }} px/frame</label>
                    <div class="controls">
                        <input
                            v-model="newSpeed[inst]"
                            type="number"
                            min="1"
                            placeholder="New speed"
                            @keyup.enter="setSpeed(inst)"
                        />
                        <button @click="setSpeed(inst)">Set</button>
                    </div>
                </div>
                <div class="field">
                    <label>Initial delay: {{ state[inst]?.initialDelay ?? '—' }} ms</label>
                    <div class="controls">
                        <input
                            v-model="newInitialDelay[inst]"
                            type="number"
                            min="0"
                            placeholder="New initial delay"
                            @keyup.enter="setInitialDelay(inst)"
                        />
                        <button @click="setInitialDelay(inst)">Set</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.admin {
    font-family: Arial, sans-serif;
    max-width: 960px;
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

@media (max-width: 540px) {
    .instances { flex-direction: column; }
}

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

.field { margin-top: 20px; }
.field label { display: block; font-size: 14px; color: #a0c4ff; margin-bottom: 8px; }
.controls { display: flex; gap: 8px; min-width: 0; }

input[type="number"] {
    flex: 1;
    min-width: 0;
    padding: 8px 12px;
    background: #0f3460;
    border: 1px solid #1a5276;
    border-radius: 4px;
    color: #e0e0e0;
    font-size: 14px;
}

button {
    flex-shrink: 0;
    padding: 8px 14px;
    background: #0f3460;
    border: 1px solid #1a5276;
    border-radius: 4px;
    color: #a0c4ff;
    font-size: 14px;
    cursor: pointer;
}
button:hover { background: #1a5276; }
</style>
