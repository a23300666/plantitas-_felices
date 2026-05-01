document.addEventListener('DOMContentLoaded', () => {
    const cardKeyMap = {
        'Sansevieria': 'suegra', 'Gomero': 'gomero', 'ZZ': 'ZZ', 'Potus': 'Potus',
        'Dracaena': 'dracanea', 'Monstera': 'Monstera', 'Espatifilo': 'Espatifilo',
        'Ficus Benjamina': 'Ficus_Benjamina', 'Palma Areca': 'Palma_Areca',
        'Philodendron': 'Philodendron', 'Orquídeas': 'Orquideas', 'Ficus Lyrata': 'Ficus_Lyrata',
        'Calathea': 'Calathea', 'Begonia Maculata': 'Begonia_Maculata',
        'Helecho de Boston': 'Helecho_Boston', 'Zanahoria': 'Zanahoria',
        'Frijoles': 'Frijoles', 'Jitomate': 'Jitomate', 'Lechuga': 'Lechuga', 'Cebolla': 'Cebolla'
    };

    const formatPlantData = (data) => {
        const { Humedad_Tierra: ht, Temp_Ambiente: ta, Hum_Ambiente: ha, VPD_Ideal: vpd } = data;
        return `
            <div class="card-info-grid">
                <div class="card-info-item">💧<strong>Humedad</strong><span>${ht.min}%-${ht.max}%</span></div>
                <div class="card-info-item">🌡️<strong>Temp.</strong><span>${ta.min}°-${ta.max}°</span></div>
                <div class="card-info-item">☁️<strong>Ambiente</strong><span>${ha.min}%-${ha.max}%</span></div>
                <div class="card-info-item">📈<strong>VPD</strong><span>${vpd.min}-${vpd.max}</span></div>
            </div>`;
    };

    const updateCards = (dataMap) => {
        document.querySelectorAll('.plant-card').forEach(card => {
            const name = card.querySelector('img')?.alt.trim() || '';
            const key = cardKeyMap[name] || name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
            const infoDiv = document.createElement('div');
            infoDiv.className = 'card-info';
            infoDiv.innerHTML = dataMap[key] ? formatPlantData(dataMap[key]) : 'Cargando información...';
            card.appendChild(infoDiv);
        });
    };

    fetch('bdd2.json')
        .then(r => r.json())
        .then(json => {
            const map = {};
            const traverse = (o) => {
                for (let k in o) { if(o[k]?.Humedad_Tierra) map[k]=o[k]; else if(typeof o[k]==='object') traverse(o[k]); }
            };
            traverse(json);
            updateCards(map);
        }).catch(() => updateCards({}));

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.plant-card');
        const open = document.querySelector('.plant-card.expanded');
        if (open) open.classList.remove('expanded');
        if (card && card !== open) card.classList.add('expanded');
    });
});