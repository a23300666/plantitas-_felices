document.addEventListener('DOMContentLoaded', () => {
    const cardKeyMap = {
        'Sansevieria': 'suegra',
        'Gomero': 'gomero',
        'ZZ': 'ZZ',
        'Potus': 'Potus',
        'Dracaena': 'dracanea',
        'Monstera': 'Monstera',
        'Espatifilo': 'Espatifilo',
        'Ficus Benjamina': 'Ficus_Benjamina',
        'Palma Areca': 'Palma_Areca',
        'Philodendron': 'Philodendron',
        'Orquídeas': 'Orquideas',
        'Ficus Lyrata': 'Ficus_Lyrata',
        'Calathea': 'Calathea',
        'Begonia Maculata': 'Begonia_Maculata',
        'Helecho de Boston': 'Helecho_Boston',
        'Zanahoria': 'Zanahoria',
        'Frijoles': 'Frijoles',
        'Jitomate': 'Jitomate',
        'Lechuga': 'Lechuga',
        'Cebolla': 'Cebolla'
    };

    const parseJsonData = (json) => {
        const result = {};

        const traverse = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            for (const [key, value] of Object.entries(obj)) {
                if (value && typeof value === 'object' && 'Humedad_Tierra' in value) {
                    result[key] = value;
                } else {
                    traverse(value);
                }
            }
        };

        if (json && json.Categorias) {
            traverse(json.Categorias);
        }

        return result;
    };

    const formatPlantData = (plantData) => {
        if (!plantData) return null;
        const humedadTierra = plantData.Humedad_Tierra;
        const temp = plantData.Temp_Ambiente;
        const humAmb = plantData.Hum_Ambiente;
        const vpd = plantData.VPD_Ideal;

        return `
            <div class="card-info-grid">
                <div class="card-info-item">💧<strong>Humedad</strong><span>${humedadTierra.min}% - ${humedadTierra.max}%</span></div>
                <div class="card-info-item">🌡️<strong>Temp.</strong><span>${temp.min}°C - ${temp.max}°C</span></div>
                <div class="card-info-item">☁️<strong>Ambiente</strong><span>${humAmb.min}% - ${humAmb.max}%</span></div>
                <div class="card-info-item">📈<strong>VPD</strong><span>${vpd.min} - ${vpd.max}</span></div>
            </div>`;
    };

    const createInfoDiv = (html) => {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'card-info';
        infoDiv.innerHTML = html;
        return infoDiv;
    };

    const updateCards = (plantDataMap) => {
        document.querySelectorAll('.plant-card').forEach(card => {
            const img = card.querySelector('img');
            const cardName = img ? img.alt.trim() : '';
            const jsonKey = cardKeyMap[cardName] || cardName.replace(/\s+/g, '_').replace(/[áéíóúÁÉÍÓÚñÑ]/g, (match) => {
                const map = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'ñ': 'n', 'Ñ': 'N' };
                return map[match] || match;
            });
            const plantInfo = plantDataMap[jsonKey];
            const infoHtml = plantInfo
                ? formatPlantData(plantInfo)
                : `<div class="fallback-info">${card.getAttribute('data-info') || 'Información no disponible'}</div>`;
            const infoDiv = createInfoDiv(infoHtml);
            card.appendChild(infoDiv);
        });
    };

    fetch('bdd2.json')
        .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
        .then(json => {
            const plantDataMap = parseJsonData(json);
            updateCards(plantDataMap);
        })
        .catch(() => {
            // Si no se puede cargar el JSON, mostramos los datos originales de data-info.
            updateCards({});
        });

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.plant-card');

        if (card) {
            e.stopPropagation();
            document.querySelectorAll('.plant-card.expanded').forEach(other => {
                if (other !== card) {
                    other.classList.remove('expanded');
                }
            });
            card.classList.toggle('expanded');
        } else {
            document.querySelectorAll('.plant-card.expanded').forEach(c => {
                c.classList.remove('expanded');
            });
        }
    });
});