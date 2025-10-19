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
    </div>
</template>

<script setup>
import { watch, onUnmounted } from 'vue';
import LucidePlaneIcon from '~/pages/components/svg/LucidePlaneIcon.vue';

const EASTER_EGG_SPEED = 2;
const EASTER_EGG_ROTATION_SPEED = 1;

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
    }
});

const emit = defineEmits(['pointerdown', 'pointerup', 'pointercancel', 'mouseenter', 'mouseleave', 'spawnEasterEggPlane', 'updateEasterEggPlane']);

const keys = {
    z: false,
    q: false,
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

let animationFrameId = null;

function updateEasterEggPlane() {
    const plane = props.flyingPlanes.find(p => p.id === 'easter-egg-plane');

    if (!plane) {
        return;
    }

    let dx = 0;
    let dy = 0;

    let newAngle = plane.angle;

    if (keys.q) {
        newAngle -= EASTER_EGG_ROTATION_SPEED;
    }

    if (keys.d) {
        newAngle += EASTER_EGG_ROTATION_SPEED;
    }

    if (keys.z) {
        const radians = (newAngle - 90) * Math.PI / 180;
        dx = Math.cos(radians) * EASTER_EGG_SPEED;
        dy = Math.sin(radians) * EASTER_EGG_SPEED;
    }

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

    keys.z = false;
    keys.q = false;
    keys.d = false;
}

watch(() => props.easterEgg, (newVal) => {
    if (newVal) {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const plane = {
            id: 'easter-egg-plane',
            x: props.containerSize.width / 2,
            y: props.containerSize.height / 2,
            vx: 0,
            vy: 0,
            angle: 0,
            trail: [{ x: props.containerSize.width / 2, y: props.containerSize.height / 2 }],
            iconVisible: true,
            frozen: false,
            isEasterEgg: true,
            flightData: {}
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