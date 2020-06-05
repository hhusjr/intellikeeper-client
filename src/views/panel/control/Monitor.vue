<template>
    <div>
        <RemoteMonitor></RemoteMonitor>
    </div>
</template>

<style scoped>
    #location-container {
        height: 400px;
    }
</style>

<script>
    import RemoteMonitor from '@/components/RemoteMonitor'

    export default {
        name: 'Monitor',
        components: {
            'RemoteMonitor': RemoteMonitor
        }
    }
</script>
