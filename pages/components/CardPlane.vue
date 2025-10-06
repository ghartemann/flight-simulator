<template>
    <UCard :ui="{root: 'relative cursor-pointer'}">
        <div class="flex items-center justify-between overflow-hidden relative">
            <div>
                <div class="font-medium mb-2">
                    {{ plane.brand }} {{ plane.model }}
                </div>

                <div class="grid grid-cols-2">
                    <table v-for="(block, index) in infoBlocks" :key="index">
                        <tbody>
                            <tr v-for="(subBlock, subIndex) in block" :key="subIndex">
                                <td class="text-xs text-neutral-400">
                                    {{ subBlock.title }}
                                </td>

                                <td class="pl-4 text-xs text-neutral-400">
                                    {{ subBlock.value }}
                                    <span v-if="subBlock.unit">{{ subBlock.unit }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <UIcon
                v-if="editIcon"
                name="i-lucide-pen"
            ></UIcon>
        </div>

        <LucidePlaneIcon class="h-full absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 -rotate-45 opacity-10" full></LucidePlaneIcon>
    </UCard>
</template>

<script setup lang="ts">
import LucidePlaneIcon from "~/pages/components/svg/LucidePlaneIcon.vue";

const props = defineProps({
    plane: {
        type: Object,
        required: true
    },
    editIcon: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['add-plane']);

const infoBlocks = computed(() => {
    return [
        [
            {
                title: 'First flight',
                value: props.plane.firstFlight
            },
            {
                title: 'Nb. of seats',
                value: props.plane.seats
            }
        ],
        [
            {
                title: 'Fuel burned per Km',
                value: props.plane.fuelBurnKgPerKm,
                unit: 'L/Km'
            },
            {
                title: 'Fuel burned per sec.',
                value: props.plane.litersPerSecond,
                unit: 'L/s'
            }
        ]
    ]
})

function addPlane() {
    emit('add-plane');
}
</script>

<style scoped>

</style>