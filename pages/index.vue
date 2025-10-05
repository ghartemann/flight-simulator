<template>
    <div class="w-full min-h-screen flex overflow-hidden relative pb-16" ref="containerEl">
        <div class="w-1/2">
            <!--            <CardPlane-->
            <!--                v-for="(plane, index) in planes"-->
            <!--                :key="index"-->
            <!--                @add-plane="addPlane(plane)"-->
            <!--                :plane="plane"-->
            <!--            ></CardPlane>-->
            <UButton
                @click="addPlane"
            >
                Take off
            </UButton>

            <USelect
                v-model="selectedPlaneSlug"
                :items="planes"
                value-key="slug"
                class="w-full"
            >
                <template v-slot:item="{ item }">
                    <CardPlane
                        :plane="item"
                        class="w-full"
                    ></CardPlane>
                </template>
            </USelect>
        </div>

        <div class="w-1/2">
            nbplanes: {{ activePlanes.length }}<br>
            total: {{ totalFuelPerSecond }}
        </div>

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
                    class="text-white/50"
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
            class="absolute will-change-transform"
            :style="{
                left: fp.x + 'px',
                top: fp.y + 'px',
                transform: `translate(-50%, -50%) rotate(${fp.angle}deg)`
            }"
        >
            <LucidePlaneIcon></LucidePlaneIcon>
        </div>

        <CreatedBy class="absolute bottom-0"></CreatedBy>
    </div>
</template>

<script setup>
import { usePlanes } from '~/composables/usePlanes.js';
import planesData from '~/constants/planesData.js';
import CardPlane from '~/pages/components/CardPlane.vue';
import LucidePlaneIcon from '~/pages/components/svg/LucidePlaneIcon.vue';

const meta = {
    title: 'Flight Simulator',
    description: 'It\'s just a template.'
    // image: 'https://trickledown.ghartemann.fr/3d-money.jpg',
    // url: 'https://trickledown.ghartemann.fr/'
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

const rate = ref(10);
const timeElapsed = ref(0); // in seconds
const lastUpdateTime = ref(Date.now());

const planes = ref([]);

const selectedPlaneSlug = ref(null);
const selectedPlane = computed(() => {
    if (!selectedPlaneSlug.value) {
        return null;
    }

    return planes.value.find((p) => p.slug === selectedPlaneSlug.value);
});

const activePlanes = ref([]);

const loading = computed(() => planes.value.length === 0);

const totalFuelPerSecond = computed(() => {
    const total = activePlanes.value.map(ap => ap.litersPerSecond);

    if (total.length === 0) {
        return 0;
    }

    return total.reduce((a, b) => a + b);
});

onMounted(() => {
    initPlanes();
    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    startAnimation();
});

onBeforeUnmount(() => {
    cleanup();
    window.removeEventListener('resize', updateContainerSize);
});

function initPlanes() {
    loading.value = true;

    const p = [];

    planesData.forEach((item) => {
        p.push(item);
    });

    planes.value = p;
    loading.value = false;
}

function addPlane() {
    spawnFlyingPlane();

    if (selectedPlaneSlug.value) {
        activePlanes.value.push(selectedPlane.value);
    }
}
</script>

<style scoped>

</style>