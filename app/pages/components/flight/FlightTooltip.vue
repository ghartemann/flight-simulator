<template>
    <UCard
        class="absolute z-50 rounded-lg shadow-lg pointer-events-none w-48"
        :style="tooltipPosition"
    >
        <div class="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-1">
            <span class="text-blue-300">✈</span>
            {{ hoveredPlane.flightData.flightNumber }}
        </div>

        <div class="text-xs font-medium text-neutral-400 mb-2">
            {{ hoveredPlane.flightData.brand }} {{ hoveredPlane.flightData.model }}
        </div>

        <div class="text-xs space-y-1">
            <FlightTooltipInfo
                label="Route"
                :value="hoveredPlane.flightData.origin + ' → ' + hoveredPlane.flightData.destination"
            ></FlightTooltipInfo>

            <FlightTooltipInfo
                label="ETA"
                :value="hoveredPlane.flightData.flightTime"
            ></FlightTooltipInfo>

            <FlightTooltipInfo
                label="Alt"
                :value="hoveredPlane.flightData.altitude.toLocaleString() + 'ft.'"
            ></FlightTooltipInfo>

            <FlightTooltipInfo
                label="Speed"
                :value="useFormat().number(hoveredPlane.flightData.speed, 0, 0) + 'km/h'"
            ></FlightTooltipInfo>

            <FlightTooltipInfo
                label="Heading"
                :value="useFormat().number(hoveredPlane.flightData.heading, 0, 0) + '° ' + getCardinalDirection(hoveredPlane.flightData.heading)"
            ></FlightTooltipInfo>

            <USeparator class="mt-3 mb-2"></USeparator>

            <FlightTooltipInfo
                label="Seats"
                :value="hoveredPlane.flightData.plane.seats"
            ></FlightTooltipInfo>

            <FlightTooltipInfo
                label="Fuel"
                :value="useFormat().number(hoveredPlane.flightData.plane.litersPerSecond, 1, 1) + ' L/s'"
            ></FlightTooltipInfo>

            <FlightTooltipInfo
                label="CO₂"
                :value="useFormat().number(hoveredPlane.flightData.plane.litersPerSecond * 2.5, 1, 1) + ' kg/s'"
            ></FlightTooltipInfo>
        </div>
    </UCard>
</template>

<script setup>
import { computed } from 'vue';
import FlightTooltipInfo from '~/pages/components/flight/FlightTooltipInfo.vue';

const props = defineProps({
    hoveredPlane: {
        type: Object,
        required: true
    }
});

const TOOLTIP_WIDTH = 160; // 40 * 4 (w-40 in Tailwind)
const TOOLTIP_OFFSET = 30;
const EDGE_MARGIN = 10;

const tooltipPosition = computed(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const planeX = props.hoveredPlane.x;
    const planeY = props.hoveredPlane.y;

    // Determine horizontal position
    let left = planeX + TOOLTIP_OFFSET;
    let transform = 'translateY(-50%)';

    // If too close to right edge, show on left side
    if (planeX + TOOLTIP_OFFSET + TOOLTIP_WIDTH > screenWidth - EDGE_MARGIN) {
        left = planeX - TOOLTIP_OFFSET - TOOLTIP_WIDTH;
    }

    // Ensure it doesn't go off the left edge
    if (left < EDGE_MARGIN) {
        left = EDGE_MARGIN;
    }

    // Determine vertical position
    let top = planeY - 10;

    // If too close to top, adjust
    if (planeY < 100) {
        top = planeY + 20;
        transform = 'translateY(0)';
    }

    // If too close to bottom, adjust
    if (planeY > screenHeight - 100) {
        top = planeY - 20;
        transform = 'translateY(-100%)';
    }

    return {
        left: `${left}px`,
        top: `${top}px`,
        transform
    };
});

function getCardinalDirection(heading) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const normalized = ((heading % 360) + 360) % 360;
    const index = Math.round(normalized / 45) % 8;

    return directions[index];
}
</script>