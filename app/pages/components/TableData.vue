<template>
    <UCard class="overflow-hidden" :ui="{body: 'p-0!'}">
        <table class="w-full border-collapse">
            <thead>
                <tr class="border-b border-neutral-200 dark:border-neutral-700">
                    <th class="px-4 py-2.5 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Category
                    </th>

                    <th class="px-4 py-2.5 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Metric
                    </th>

                    <th class="px-4 py-2.5 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Value
                    </th>

                    <th class="px-4 py-2.5 text-right">
                        <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg text-primary font-semibold text-sm">
                            <UIcon name="i-lucide-train-front" class="w-4 h-4" />
                            <span>TGV eq.</span>
                        </div>
                    </th>
                </tr>
            </thead>

            <tbody>
                <template v-for="(d, i) in data" :key="i">
                    <tr
                        v-for="(item, j) in d.data"
                        :key="j"
                        :class="[
                            { 'border-b': i < data.length - 1 || j < d.data.length - 1 },
                            j !== d.data.length - 1 ? 'border-neutral-200 dark:border-neutral-700' : 'border-neutral-300 dark:border-neutral-800'
                        ]"
                    >
                        <th
                            v-if="j === 0"
                            :rowspan="d.data.length"
                            class="px-4 py-2.5 text-left font-semibold text-neutral-900 dark:text-white border-r border-neutral-200 dark:border-neutral-700"
                        >
                            <div class="flex items-center gap-2">
                                <UIcon :name="d.icon" class="w-5 h-5 text-primary" />
                                <span>{{ d.title }}</span>
                            </div>
                        </th>

                        <td class="px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 text-balance">
                            {{ item.title }}
                        </td>

                        <td class="px-4 py-2.5 text-right text-sm font-medium text-neutral-900 dark:text-white tabular-nums">
                            {{ item.value }}

                            <span v-if="item.unit" class="text-neutral-500 dark:text-neutral-400 font-normal ml-1">
                                {{ item.unit }}
                            </span>
                        </td>

                        <td class="px-4 py-2.5 text-right bg-primary/5 dark:bg-primary/10">
                            <template v-if="item.tgvEquivalent">
                                <span class="text-sm font-semibold text-primary tabular-nums">
                                    {{ useFormat().number(item.tgvEquivalent.value, 2, 2) }}
                                </span>

                                <span class="text-xs text-primary/70 ml-1">
                                    {{ item.tgvEquivalent.unit }}
                                </span>
                            </template>

                            <span v-else class="text-neutral-400 dark:text-neutral-600 text-sm">—</span>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </UCard>
</template>

<script setup>
defineProps({
    data: {
        type: Object,
        required: true
    }
});
</script>