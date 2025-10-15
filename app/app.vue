<template>
    <UApp class="relative">
        <UColorModeButton class="absolute top-4 right-4 z-999">
            <template #fallback>
                <UButton loading variant="ghost" color="neutral" @click="test"/>
            </template>
        </UColorModeButton>

        <NuxtPage></NuxtPage>
    </UApp>
</template>

<script setup>
function test() {
    console.log('test')
}
</script>