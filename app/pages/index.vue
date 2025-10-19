<template>
    <div
        class="w-full min-h-screen flex flex-col justify-center items-center overflow-hidden relative pb-16"
        ref="containerEl"
        @click="handleContainerClick"
    >
        <UButton @click="easterEgg = !easterEgg" class="mb-2" color="warning">
            {{ easterEgg ? 'back' : '[TEST] flight simulator 2025' }}
        </UButton>

        <UCard
            v-if="!easterEgg"
            variant="soft"
            class="z-9999 w-1/2 backdrop-blur-md rounded-xl p-4 shadow-xl"
            @click.stop
        >
            <FlightControls
                v-model="selectedPlaneSlug"
                :planes="planes"
                :selected-plane="selectedPlane"
                :dropdown-shown="dropdownShown"
                @add-plane="addPlane"
                @add-all-planes="addAllPlanes"
                @change-plane="changePlane"
            ></FlightControls>

            <TableData :data="displayedData" />
        </UCard>

        <LandingStrip v-else></LandingStrip>

        <FlightCanvas
            :easter-egg="easterEgg"
            :flying-planes="flyingPlanes"
            :container-size="containerSize"
            :hovered-plane="hoveredPlane"
            :clicked-plane="clickedPlane"
            @spawn-easter-egg-plane="handleSpawnEasterEgg"
            @update-easter-egg-plane="handleUpdateEasterEgg"
            @pointerdown="handlePointerDown"
            @pointerup="handlePointerUp"
            @pointercancel="handlePointerCancel"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
        ></FlightCanvas>

        <FlightTooltip
            v-if="(hoveredPlane || clickedPlane) && (hoveredPlane?.iconVisible || clickedPlane?.iconVisible)"
            :hovered-plane="hoveredPlane || clickedPlane"
        ></FlightTooltip>

        <CreatedBy class="absolute bottom-0"></CreatedBy>
    </div>
</template>

<script setup>
import { useFlightInteractions } from '~/composables/useFlightInteractions.js';
import { useFlightStats } from '~/composables/useFlightStats.js';
import { usePlanes } from '~/composables/usePlanes.js';
import planesData from '~/constants/planesData.js';
import FlightCanvas from '~/pages/components/flight/FlightCanvas.vue';
import FlightControls from '~/pages/components/flight/FlightControls.vue';
import FlightTooltip from '~/pages/components/flight/FlightTooltip.vue';
import LandingStrip from '~/pages/components/flight/LandingStrip.vue';
import TableData from '~/pages/components/TableData.vue';

const MAX_VISUAL_PLANES = 200;
const REAL_WORLD_PLANES_IN_THE_SKY = 14000;

const easterEgg = ref(false);

function handleSpawnEasterEgg(plane) {
    flyingPlanes.value.push(plane);
}

function handleUpdateEasterEgg({ x, y, angle, trail }) {
    const plane = flyingPlanes.value.find(p => p.id === 'easter-egg-plane');

    if (plane) {
        plane.x = x;
        plane.y = y;
        plane.angle = angle;
        plane.trail.push(trail);
    }
}

watch(easterEgg, (newVal) => {
    if (!newVal) {
        const index = flyingPlanes.value.findIndex(p => p.id === 'easter-egg-plane');

        if (index !== -1) {
            flyingPlanes.value.splice(index, 1);
        }
    }
});

const meta = {
    title: 'Flight Simulator',
    description: 'It\'s just a template.'
};

useSeoMeta({
    description: meta.description,
    ogTitle: meta.title,
    ogDescription: meta.description,
    ogImage: meta.image,
    ogUrl: meta.url,
    twitterTitle: meta.title,
    twitterDescription: meta.description,
    twitterImage: meta.image,
    twitterCard: 'summary'
});

useHead({
    link: [
        { rel: 'canonical', href: meta.url }
    ]
});

const {
    containerEl,
    containerSize,
    flyingPlanes,
    spawnFlyingPlane,
    startAnimation,
    updateContainerSize,
    cleanup
} = usePlanes();

const {
    activePlanes,
    totalFuelBurned,
    displayedData,
    startStatsTimer,
    stopStatsTimer,
    addPlane: addPlaneToStats
} = useFlightStats();

const {
    hoveredPlane,
    clickedPlane,
    onMouseEnter,
    onMouseLeave,
    onContainerClick,
    onPointerDown,
    onPointerUp,
    onPointerCancel
} = useFlightInteractions();

const dropdownShown = ref(true);
const planes = ref([]);
const selectedPlaneSlug = ref(null);

const selectedPlane = computed(() => {
    if (!selectedPlaneSlug.value) {
        return null;
    }
    return planes.value.find((p) => p.slug === selectedPlaneSlug.value);
});

onMounted(() => {
    initPlanes();
    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    startAnimation();
    startStatsTimer();
});

onBeforeUnmount(() => {
    cleanup();
    stopStatsTimer();
    window.removeEventListener('resize', updateContainerSize);
});

function initPlanes() {
    planes.value = [...planesData];
}

function addPlane() {
    if (!selectedPlaneSlug.value) {
        return;
    }

    addPlaneToStats(selectedPlane.value);

    if (activePlanes.value.length <= MAX_VISUAL_PLANES) {
        spawnFlyingPlane(selectedPlane.value);
    }
}

function addAllPlanes() {
    while (activePlanes.value.length < REAL_WORLD_PLANES_IN_THE_SKY) {
        addPlane();
    }
}

function changePlane() {
    selectedPlaneSlug.value = null;
    dropdownShown.value = true;
}

function handleMouseEnter(fp) {
    onMouseEnter(fp);
}

function handleMouseLeave(fp) {
    onMouseLeave(fp);
}

function handleContainerClick(e) {
    onContainerClick(e, containerEl.value);
}

function handlePointerDown(e, fp) {
    onPointerDown(e, fp);
}

function handlePointerUp(e, fp) {
    onPointerUp(e, fp);
}

function handlePointerCancel(e) {
    onPointerCancel(e);
}

watch(selectedPlaneSlug, (newVal) => {
    if (newVal) {
        dropdownShown.value = false;
    }
});
</script>