import { reactive, ref } from 'vue';

export function usePlanes() {
    const containerEl = ref(null);
    const containerSize = reactive({ width: 0, height: 0 });

    const flyingPlanes = ref([]);

    let nextFlyingPlaneId = 1;
    const animationFrameId = ref(null);

    function updateContainerSize() {
        if (!containerEl.value) {
            return;
        }

        const rect = containerEl.value.getBoundingClientRect();
        containerSize.width = Math.floor(rect.width);
        containerSize.height = Math.floor(rect.height);
    }

    function generateFlightNumber() {
        const airlines = [
            // Europe
            'AF', 'BA', 'LH', 'KL', 'LX', 'IB', 'OS', 'SK', 'AY', 'AZ', 'LO', 'OK', 'SN', 'TP', 'UX',
            // North America
            'AA', 'DL', 'UA', 'WN', 'AC', 'WS', 'B6', 'AS', 'F9', 'NK', 'QX',
            // Asia
            'NH', 'JL', 'CX', 'SQ', 'KE', 'OZ', 'MU', 'CA', 'CZ', 'TG', 'VN', 'BR',
            // Middle East
            'EK', 'QR', 'EY', 'SV', 'GF', 'KU', 'WY',
            // Oceania
            'QF', 'NZ', 'VA', 'JQ',
            // Latin America
            'LA', 'AV', 'CM', 'AM', 'G3', 'AR'
        ];

        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        const number = Math.floor(Math.random() * 9000) + 1000; // 1000–9999

        return `${airline}${number}`;
    }

    function generateAirportCode() {
        const airports = [
            // Europe
            'CDG', 'ORY', 'LHR', 'LGW', 'MAN', 'FRA', 'MUC', 'BER', 'AMS', 'BRU', 'ZRH', 'GVA',
            'MAD', 'BCN', 'FCO', 'MXP', 'VIE', 'CPH', 'ARN', 'OSL', 'HEL', 'DUB', 'PRG', 'WAW',
            'ATH', 'LIS', 'BUD', 'LED', 'IST',
            // North America
            'JFK', 'LGA', 'EWR', 'ORD', 'LAX', 'SFO', 'SEA', 'DFW', 'ATL', 'MIA', 'YYZ', 'YUL', 'YVR',
            'DEN', 'IAH', 'PHX', 'BOS', 'DTW', 'MSP', 'LAS', 'TPA', 'SLC', 'BWI', 'MCO', 'CLT',
            // Latin America
            'MEX', 'BOG', 'LIM', 'SCL', 'GRU', 'GIG', 'EZE', 'PTY', 'HAV', 'SDQ', 'SJO',
            // Middle East
            'DXB', 'DOH', 'AUH', 'RUH', 'JED', 'KWI', 'BHR', 'MCT', 'AMM', 'CAI',
            // Asia
            'HKG', 'PEK', 'PVG', 'CAN', 'ICN', 'GMP', 'NRT', 'HND', 'KIX', 'TPE', 'SIN', 'BKK', 'HAN',
            'DEL', 'BOM', 'HYD', 'MAA', 'KUL', 'CGK', 'MNL',
            // Oceania
            'SYD', 'MEL', 'BNE', 'AKL', 'CHC', 'PER', 'ADL', 'CBR', 'WLG', 'HBA',
            // Africa
            'JNB', 'CPT', 'ADD', 'NBO', 'CAI', 'CMN', 'DSS', 'LOS', 'ACC', 'DAR'
        ];

        return airports[Math.floor(Math.random() * airports.length)];
    }

    function generateFlightTime() {
        const hours = Math.floor(Math.random() * 12) + 1;
        const minutes = Math.floor(Math.random() * 60);

        return `${hours}h ${minutes}m`;
    }

    function generateAltitude() {
        return Math.floor(Math.random() * 30000) + 25000; // 25,000 - 55,000 ft
    }

    function spawnFlyingPlane(selectedPlane) {
        const width = containerSize.width || window.innerWidth;
        const height = containerSize.height || window.innerHeight;

        const edge = Math.floor(Math.random() * 4);
        let x = 0, y = 0, angleRad = 0;

        const rand = (min, max) => Math.random() * (max - min) + min;

        if (edge === 0) { // top
            x = rand(0, width);
            y = 0;
            angleRad = rand(Math.PI / 6, (5 * Math.PI) / 6);
        } else if (edge === 1) { // right
            x = width;
            y = rand(0, height);
            angleRad = rand((5 * Math.PI) / 6, (7 * Math.PI) / 6);
        } else if (edge === 2) { // bottom
            x = rand(0, width);
            y = height;
            angleRad = rand((-5 * Math.PI) / 6, (-1 * Math.PI) / 6);
        } else { // left
            x = 0;
            y = rand(0, height);
            angleRad = rand((-1 * Math.PI) / 6, (1 * Math.PI) / 6);
        }

        const speedPixelsPerSecond = rand(10, 30);
        const vx = Math.cos(angleRad) * speedPixelsPerSecond;
        const vy = Math.sin(angleRad) * speedPixelsPerSecond;

        const headingDeg = (Math.atan2(vy, vx) * 180) / Math.PI;
        const angleDeg = headingDeg + 45; // match icon orientation per current UI

        const id = nextFlyingPlaneId++;

        const origin = generateAirportCode();
        let destination = generateAirportCode();

        while (destination === origin) {
            destination = generateAirportCode();
        }

        flyingPlanes.value.push({
            id,
            x,
            y,
            vx,
            vy,
            angle: angleDeg,
            trail: [{ x, y }],
            iconVisible: true,
            frozen: false,
            flightData: {
                flightNumber: generateFlightNumber(),
                origin: origin,
                destination: destination,
                flightTime: generateFlightTime(),
                altitude: generateAltitude(),
                speed: selectedPlane.cruiseSpeedKmh,
                model: selectedPlane.model,
                brand: selectedPlane.brand,
                plane: selectedPlane
            }
        });
    }

    function startAnimation() {
        let lastFrameTime = performance.now();

        function animate(currentTime) {
            const deltaMs = currentTime - lastFrameTime;
            const deltaSeconds = Math.min(0.05, deltaMs / 1000);
            lastFrameTime = currentTime;

            if (flyingPlanes.value.length > 0) {
                const width = containerSize.width;
                const height = containerSize.height;
                const margin = 24;

                flyingPlanes.value.forEach(fp => {
                    if (fp.frozen) {
                        return;
                    }

                    fp.x += fp.vx * deltaSeconds;
                    fp.y += fp.vy * deltaSeconds;

                    const headingDeg = (Math.atan2(fp.vy, fp.vx) * 180) / Math.PI;
                    fp.angle = headingDeg + 45;

                    fp.trail.push({ x: fp.x, y: fp.y });

                    const inBounds = (
                        fp.x >= -margin && fp.x <= width + margin &&
                        fp.y >= -margin && fp.y <= height + margin
                    );

                    if (!inBounds) {
                        fp.iconVisible = false;
                        fp.frozen = true;
                    }
                });
            }

            animationFrameId.value = requestAnimationFrame(animate);
        }

        animationFrameId.value = requestAnimationFrame(animate);
    }

    function cleanup() {
        if (animationFrameId.value) {
            cancelAnimationFrame(animationFrameId.value);
        }

        animationFrameId.value = null;
        window.removeEventListener('resize', updateContainerSize);
    }

    return {
        containerEl,
        containerSize,
        flyingPlanes,
        spawnFlyingPlane,
        startAnimation,
        updateContainerSize,
        cleanup,
    };
}
