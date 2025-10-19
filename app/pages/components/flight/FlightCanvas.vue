<template>
    <div>
        <!-- Trails SVG overlay -->
        <svg
            class="absolute inset-0 pointer-events-none"
            :width="containerSize.width"
            :height="containerSize.height"
            :viewBox="`0 0 ${containerSize.width} ${containerSize.height}`"
        >
            <g v-for="fp in flyingPlanes" :key="fp.id">
                <polyline
                    v-if="fp.trail.length > 1"
                    :points="fp.trail.map(p => `${p.x},${p.y}`).join(' ')"
                    stroke="currentColor"
                    :class="fp.isEasterEgg ? 'text-primary/20' : 'dark:text-white/40 light:text-neutral-300'"
                    :stroke-width="fp.isEasterEgg ? '2' : '1'"
                    stroke-linecap="round"
                    fill="none"
                />
            </g>
        </svg>

        <!-- Plane icons overlay -->
        <div
            v-for="fp in flyingPlanes.filter(p => p.iconVisible)"
            :key="`icon-${fp.id}`"
            class="light:text-neutral-700 dark:text-white absolute will-change-transform rounded-full p-2 transition-colors"
            :class="{
                'text-primary! cursor-default': fp.isEasterEgg,
                'cursor-pointer': !fp.isEasterEgg,
                'bg-primary/10 border border-primary text-primary!': !fp.isEasterEgg && (isHovered(fp) || isClicked(fp)),
                'hover:bg-primary/10 hover:border border-primary hover:text-primary!': !fp.isEasterEgg && !isClicked(fp)
            }"
            @click.stop="!fp.isEasterEgg && emit('pointerdown', $event, fp)"
            :style="{
                left: fp.x + 'px',
                top: fp.y + 'px',
                transform: fp.isEasterEgg
                    ? `translate(-50%, -50%) rotate(${fp.angle - 45}deg)`
                    : `translate(-50%, -50%) rotate(${fp.angle}deg)`
                }"
            @pointerdown="!fp.isEasterEgg && emit('pointerdown', $event, fp)"
            @pointerup="!fp.isEasterEgg && emit('pointerup', $event, fp)"
            @pointercancel="!fp.isEasterEgg && emit('pointercancel', $event)"
            @mouseenter="!fp.isEasterEgg && emit('mouseenter', fp)"
            @mouseleave="!fp.isEasterEgg && emit('mouseleave', fp)"
        >
            <LucidePlaneIcon></LucidePlaneIcon>
        </div>

        <div
            v-if="easterEgg"
            class="fixed bottom-14 left-1/2 transform -translate-x-1/2 bg-primary/20 backdrop-blur-md border border-primary rounded-lg px-6 py-3 pointer-events-none"
        >
            <div class="text-center">
                <div class="text-xs text-primary/70 font-medium">
                    STATUS
                </div>

                <div class="text-lg text-primary/70 font-medium">
                    <span v-if="currentSpeed * speedCoeff < 240">
                        GROUND
                    </span>

                    <span v-else class="animate-pulse">
                        FLYING
                    </span>
                </div>

                <div class="text-xs text-primary/70 font-medium">
                    SPEED
                </div>

                <div class="text-sm font-bold text-primary">
                    <span class="text-lg">{{ (currentSpeed * speedCoeff * 0.539957).toFixed(0) }}</span> kts
                </div>

                <div class="text-sm font-bold text-primary">
                    <span class="text-lg">{{ (currentSpeed * speedCoeff).toFixed(0) }}</span> km/h
                </div>

                <div>
                    <div class="text-xs text-primary/70 font-medium">
                        Fuel burned so far
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onUnmounted, watch } from 'vue';
import LucidePlaneIcon from '~/pages/components/svg/LucidePlaneIcon.vue';

const props = defineProps({
    flyingPlanes: {
        type: Array,
        required: true
    },
    containerSize: {
        type: Object,
        required: true
    },
    hoveredPlane: {
        type: Object,
        default: null
    },
    clickedPlane: {
        type: Object,
        default: null
    },
    easterEgg: {
        type: Boolean,
        default: false
    },
});

const emit = defineEmits(['pointerdown', 'pointerup', 'pointercancel', 'mouseenter', 'mouseleave', 'spawnEasterEggPlane', 'updateEasterEggPlane']);

let audio = null;
const keys = {
    z: false,
    q: false,
    s: false,
    d: false
};

function handleKeyDown(e) {
    const key = e.key.toLowerCase();

    if (key in keys) {
        e.preventDefault();
        keys[key] = true;
    }
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();

    if (key in keys) {
        e.preventDefault();

        keys[key] = false;
    }
}

const currentSpeed = ref(0);
const speedCoeff = 395;

let animationFrameId = null;
let EASTER_EGG_MAX_SPEED = 2;
const EASTER_EGG_ROTATION_SPEED = 1;

function updateEasterEggPlane() {
    const plane = props.flyingPlanes.find(p => p.id === 'easter-egg-plane');

    if (!plane) {
        return;
    }

    let dx, dy;

    let newAngle = plane.angle;

    if (keys.z && currentSpeed.value <= EASTER_EGG_MAX_SPEED) {
        currentSpeed.value += .0008;
    }

    if (keys.s && currentSpeed.value >= 0) {
        currentSpeed.value -= .0008;
    }

    if (keys.q && currentSpeed.value * speedCoeff >= 240) {
        newAngle -= EASTER_EGG_ROTATION_SPEED;
    }

    if (keys.d && currentSpeed.value * speedCoeff >= 240) {
        newAngle += EASTER_EGG_ROTATION_SPEED;
    }

    const radians = (newAngle - 90) * Math.PI / 180;
    dx = Math.cos(radians) * currentSpeed.value;
    dy = Math.sin(radians) * currentSpeed.value;

    const newX = Math.max(0, Math.min(props.containerSize.width, plane.x + dx));
    const newY = Math.max(0, Math.min(props.containerSize.height, plane.y + dy));

    emit('updateEasterEggPlane', {
        x: newX,
        y: newY,
        angle: newAngle,
        trail: { x: newX, y: newY }
    });

    animationFrameId = requestAnimationFrame(updateEasterEggPlane);
}

function cleanup() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio = null;
    }

    keys.z = false;
    keys.q = false;
    keys.s = false;
    keys.d = false;

    currentSpeed.value = 0;
}

watch(() => props.easterEgg, (newVal) => {
    if (newVal) {
        audio = new Audio('dangerzone.mp3');
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().catch(err => {
            console.log('Audio playback failed:', err);
        });

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const plane = {
            id: 'easter-egg-plane',
            x: props.containerSize.width / 2,
            y: props.containerSize.height / 1.4,
            vx: 0,
            vy: 0,
            angle: 0,
            trail: [{ x: props.containerSize.width / 2, y: props.containerSize.height / 2 }],
            iconVisible: true,
            frozen: false,
            isEasterEgg: true,
            slug: "airbus-a330-200-248-10277",
            brand: "Airbus",
            model: "A330-200",
            firstFlight: 1997,
            seats: 248,
            sectorKm: 10277,
            fuelBurnKgPerKm: 6.55,
            fuelPerSeatLPer100Km: 3.3,
            litersPerSecond: 2.05,
            cruiseSpeedKmh: 871,
            flightData: {
                flightNumber: 'DGRZN-01',
                origin: 'DANGER',
                destination: 'ZONE',
                model: 'F-14 Tomcat',
                brand: 'Grumman'
            }
        };

        emit('spawnEasterEggPlane', plane);

        updateEasterEggPlane();
    } else {
        cleanup();
    }
});

function isHovered(fp) {
    return props.hoveredPlane === fp;
}

function isClicked(fp) {
    return props.clickedPlane === fp;
}

onUnmounted(() => {
    cleanup();
});
</script>