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
                    class="dark:text-white/40 light:text-gray-900/30"
                    stroke-width="1"
                    stroke-linecap="round"
                    fill="none"
                />
            </g>
        </svg>

        <!-- Plane icons overlay -->
        <div
            v-for="fp in flyingPlanes.filter(p => p.iconVisible)"
            :key="`icon-${fp.id}`"
            class="absolute will-change-transform cursor-pointer rounded-full p-2 transition-colors"
            :class="{
                'bg-primary/50': isHovered(fp) || isClicked(fp),
                'hover:bg-primary/50': !isClicked(fp)
            }"
            @click.stop
            :style="{
                left: fp.x + 'px',
                top: fp.y + 'px',
                transform: `translate(-50%, -50%) rotate(${fp.angle}deg)`
            }"
            @pointerdown="emit('pointerdown', $event, fp)"
            @pointerup="emit('pointerup', $event, fp)"
            @pointercancel="emit('pointercancel', $event)"
            @mouseenter="emit('mouseenter', fp)"
            @mouseleave="emit('mouseleave', fp)"
        >
            <LucidePlaneIcon></LucidePlaneIcon>
        </div>
    </div>
</template>

<script setup>
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
    }
});

const emit = defineEmits(['pointerdown', 'pointerup', 'pointercancel', 'mouseenter', 'mouseleave']);

function isHovered(fp) {
    return props.hoveredPlane === fp;
}

function isClicked(fp) {
    return props.clickedPlane === fp;
}
</script>