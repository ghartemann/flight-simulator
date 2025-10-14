<template>
    <div
        class="w-full min-h-screen flex flex-col justify-center items-center overflow-hidden relative pb-16"
        ref="containerEl"
        @click="handleContainerClick"
    >
        <UCard
            variant="soft"
            class="z-50 w-1/2 backdrop-blur-md rounded-xl p-4"
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

            <UCard variant="outline">
                <TableData :data="displayedData" />
            </UCard>
        </UCard>

        <FlightCanvas
            :flying-planes="flyingPlanes"
            :container-size="containerSize"
            :hovered-plane="hoveredPlane"
            :clicked-plane="clickedPlane"
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
import TableData from '~/pages/components/TableData.vue';

const MAX_VISUAL_PLANES = 200;
const REAL_WORLD_PLANES_IN_THE_SKY = 14000;

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