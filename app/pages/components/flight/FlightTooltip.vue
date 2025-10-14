<template>
    <div
        class="absolute z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700 pointer-events-none w-40"
        :style="tooltipPosition"
    >
        <div class="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-1">
            <span class="text-blue-300">✈</span>
            {{ hoveredPlane.flightData.flightNumber }}
        </div>

        <div class="text-xs font-medium text-gray-300 mb-2">
            {{ hoveredPlane.flightData.brand }} {{ hoveredPlane.flightData.model }}
        </div>

        <div class="text-xs space-y-1">
            <div class="flex justify-between">
                <span class="text-gray-400">
                    Route:
                </span>

                <span class="font-mono">
                    {{ hoveredPlane.flightData.origin }} → {{ hoveredPlane.flightData.destination }}
                </span>
            </div>

            <div class="flex justify-between">
                <span class="text-gray-400">
                    ETA:
                </span>

                <span class="font-mono">
                    {{ hoveredPlane.flightData.flightTime }}
                </span>
            </div>

            <div class="flex justify-between">
                <span class="text-gray-400">
                    Alt:
                </span>

                <span class="font-mono">
                    {{ hoveredPlane.flightData.altitude.toLocaleString() }} ft
                </span>
            </div>

            <div class="flex justify-between">
                <span class="text-gray-400">
                    Speed:
                </span>

                <span class="font-mono">
                    {{ useFormat().number(hoveredPlane.flightData.speed, 0, 0) }} km/h
                </span>
            </div>

            <div class="flex justify-between">
                <span class="text-gray-400">
                    Heading:
                </span>

                <span class="font-mono">
                    {{ useFormat().number(hoveredPlane.flightData.heading, 0, 0) }}° {{ getCardinalDirection(hoveredPlane.flightData.heading) }}
                </span>
            </div>

            <USeparator class="mt-3 mb-2"></USeparator>

            <div class="flex justify-between pt-1">
                <span class="text-gray-400">
                    Seats:
                </span>

                <span class="font-mono">
                    {{ hoveredPlane.flightData.plane.seats }}
                </span>
            </div>

            <div class="flex justify-between">
                <span class="text-gray-400">
                    Fuel:
                </span>

                <span class="font-mono text-orange-400">
                    {{ useFormat().number(hoveredPlane.flightData.plane.litersPerSecond, 1, 1) }} L/s
                </span>
            </div>

            <div class="flex justify-between">
                <span class="text-gray-400">
                    CO₂:
                </span>

                <span class="font-mono text-red-400">
                    {{ useFormat().number(hoveredPlane.flightData.plane.litersPerSecond * 2.5, 1, 1) }} kg/s
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

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

function getCardinalDirection(heading) {  // <-- HERE IT IS
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((heading % 360) / 45)) % 8;

    return directions[index];
}
</script>