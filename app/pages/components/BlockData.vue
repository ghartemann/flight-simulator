<template>
    <div class="flex gap-4 justify-between">
        <div class="flex shrink-0 gap-4">
            <div class="flex items-center gap-4 w-20">
                <UIcon
                    :name="data.icon"
                    class="shrink-0"
                ></UIcon>

                <div>
                    {{ data.title }}
                </div>
            </div>

            <USeparator orientation="vertical"></USeparator>
        </div>

        <div class="grow">
            <div v-for="(d, i) in data.data" :key="i" class="grid grid-cols-3">
                <div>
                    {{ d.title }}
                </div>

                <div>
                    {{ d.value }}
                    <span v-if="d.unit">{{ d.unit }}</span>
                </div>

                <div v-if="d.tgvEquivalent">
                    {{ d.tgvEquivalent.title }}: {{ useFormat().number(d.tgvEquivalent.value, 0, 1) }} {{ d.tgvEquivalent.unit }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    data: {
        type: Object,
        required: true
    }
});
</script>

<style scoped>

</style>