<template>
    <table class="border-collapse">
        <thead>
            <tr>
                <td></td>
                <td></td>
                <td></td>

                <td>
                    <div class="px-4 py-2 bg-primary/10 rounded-t-2xl flex items-center gap-1 text-primary font-bold">
                        <UIcon name="i-lucide-train-front"></UIcon>
                        <div>TGV eq.</div>
                    </div>
                </td>
            </tr>
        </thead>

        <tbody>
            <template v-for="(d, i) in data" :key="i">
                <tr v-for="(item, j) in d.data" :key="j">
                    <th v-if="j === 0" :rowspan="d.data.length" class="border-r border-gray-200 pr-4">
                        <UIcon :name="d.icon"></UIcon>
                        {{ d.title }}
                    </th>

                    <td class="pl-4">
                        {{ item.title }}
                    </td>

                    <td>
                        {{ item.value }}
                        <span v-if="item.unit">{{ item.unit }}</span>
                    </td>

                    <td class="px-4 py-2 bg-primary/10 text-primary font-bold">
                        <template v-if="item.tgvEquivalent">
                            {{ useFormat().number(item.tgvEquivalent.value, 2, 2) }}
                            {{ item.tgvEquivalent.unit }}
                        </template>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
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