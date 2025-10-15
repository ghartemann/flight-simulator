<template>
    <div class="flex justify-between">
        <span class="text-neutral-500">
            {{ label }}:
        </span>

        <span class="font-mono">
            {{ value }}
        </span>
    </div>
</template>

<script setup>
defineProps({
    label: {
        type: String,
        required: true
    },
    value: {
        type: [String, Number],
        required: true
    }
})
</script>

<style scoped>

</style>