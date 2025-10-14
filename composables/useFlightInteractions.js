import { ref } from 'vue';

export function useFlightInteractions() {
    const hoveredPlane = ref(null);
    const clickedPlane = ref(null);
    const globalUpHandlers = new WeakMap();

    function onMouseEnter(fp) {
        if (clickedPlane.value && clickedPlane.value !== fp) {
            clickedPlane.value = null;
        }

        hoveredPlane.value = fp;
    }

    function onMouseLeave(fp) {
        if (hoveredPlane.value === fp) {
            hoveredPlane.value = null;
        }
    }

    function onContainerClick(e, containerEl) {
        if (e.target === containerEl || e.target.closest('svg')) {
            clickedPlane.value = null;
            hoveredPlane.value = null;
        }
    }

    function onPointerDown(e, fp) {
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch (_) {
            // ignore if not supported
        }

        const onGlobalUp = () => {
            if (clickedPlane.value === fp) {
                clickedPlane.value = null;
                hoveredPlane.value = null;
            } else {
                clickedPlane.value = fp;
                hoveredPlane.value = fp;
            }

            globalUpHandlers.delete(e.currentTarget);
        };

        globalUpHandlers.set(e.currentTarget, onGlobalUp);
        window.addEventListener('pointerup', onGlobalUp, { once: true });
    }

    function onPointerUp(e, fp) {
        if (clickedPlane.value === fp) {
            clickedPlane.value = null;
            hoveredPlane.value = null;
        } else {
            clickedPlane.value = fp;
            hoveredPlane.value = fp;
        }

        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (_) {
            // ignore if not supported
        }

        const handler = globalUpHandlers.get(e.currentTarget);
        if (handler) {
            window.removeEventListener('pointerup', handler);
            globalUpHandlers.delete(e.currentTarget);
        }
    }

    function onPointerCancel(e) {
        const handler = globalUpHandlers.get(e.currentTarget);
        if (handler) {
            window.removeEventListener('pointerup', handler);
            globalUpHandlers.delete(e.currentTarget);
        }
    }

    function clearInteractions() {
        hoveredPlane.value = null;
        clickedPlane.value = null;
    }

    return {
        // State
        hoveredPlane,
        clickedPlane,

        // Methods
        onMouseEnter,
        onMouseLeave,
        onContainerClick,
        onPointerDown,
        onPointerUp,
        onPointerCancel,
        clearInteractions
    };
}