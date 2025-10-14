<template>
    <div
        class="absolute z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700 pointer-events-none w-40"
        :style="
        {
            left: hoveredPlane.x + 30 + 'px',
            top: hoveredPlane.y - 10 + 'px',
            transform: 'translateY(-50%)'
        }"
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

            <div class="flex justify-between pt-1 border-t border-gray-700">
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
defineProps({
    hoveredPlane: {
        type: Object,
        required: true
    }
});

function getCardinalDirection(heading) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((heading % 360) / 45)) % 8;

    return directions[index];
}
</script>