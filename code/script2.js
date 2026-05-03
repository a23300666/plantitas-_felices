// 1. CONFIGURACIÓN DE FIREBASE (Asegúrate de que solo esté una vez)
const firebaseConfig = {
    apiKey: "AIzaSyCvciPOr-LNN8LfIMfW66jp7uO_GxEOgSo", 
    databaseURL: "https://plantitas-felices-d026b-default-rtdb.firebaseio.com/",
    projectId: "plantitas-felices-d026b"
};

// Inicializar Firebase solo si no se ha hecho ya
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Variables para guardar datos
let globalPlantData = {};
const cardKeyMap = {
    'Sansevieria': 'suegra', 'Gomero': 'gomero', 'ZZ': 'ZZ', 'Potus': 'Potus',
    'Dracaena': 'dracanea', 'Monstera': 'Monstera', 'Espatifilo': 'Espatifilo',
    'Ficus Benjamina': 'Ficus_Benjamina', 'Palma Areca': 'Palma_Areca',
    'Philodendron': 'Philodendron', 'Orquídeas': 'Orquideas', 'Ficus Lyrata': 'Ficus_Lyrata',
    'Calathea': 'Calathea', 'Begonia Maculata': 'Begonia_Maculata',
    'Helecho de Boston': 'Helecho_Boston', 'Zanahoria': 'Zanahoria',
    'Frijoles': 'Frijoles', 'Jitomate': 'Jitomate', 'Lechuga': 'Lechuga', 'Cebolla': 'Cebolla'
};

// 2. FUNCIONES DE MONITOREO (Globales para que el botón las vea)
window.iniciarMonitoreo = (nombrePlanta) => {
    console.log("Iniciando monitoreo para:", nombrePlanta);
    
    // Ocultar catálogo
    document.querySelector('main').style.display = 'none';
    document.querySelector('.main-title-container').style.display = 'none';
    
    // Mostrar panel de monitoreo
    const seccion = document.getElementById('seccion-monitoreo');
    if (seccion) {
        seccion.style.display = 'block';
    }

    // Actualizar Título
    document.getElementById('titulo-monitoreo').innerText = `Monitoreo en Vivo: ${nombrePlanta}`;

    // Cargar Imagen de la planta
    const imgMonitor = document.getElementById('img-monitor');
    if (imgMonitor) {
        // Buscamos el nombre del archivo. Ejemplo: ../img/Sansevieria.png
        imgMonitor.src = `../img/${nombrePlanta}.png`;
    }

    // Cargar rangos óptimos desde el JSON
    const key = cardKeyMap[nombrePlanta] || nombrePlanta;
    const info = globalPlantData[key];
    if (info) {
        document.getElementById('opt-temp').innerText = `Ideal: ${info.Temp_Ambiente.min}-${info.Temp_Ambiente.max}°`;
        document.getElementById('opt-humedad-amb').innerText = `Ideal: ${info.Hum_Ambiente.min}-${info.Hum_Ambiente.max}%`;
        document.getElementById('opt-vpd').innerText = `Ideal: ${info.VPD_Ideal.min}-${info.VPD_Ideal.max}`;
        document.getElementById('opt-humedad-suelo').innerText = `Ideal: ${info.Humedad_Tierra.min}-${info.Humedad_Tierra.max}%`;
    }

    // Escuchar Firebase
     // --- FUNCIÓN AUXILIAR PARA ACTUALIZAR GRÁFICAS ---
const actualizarGrafica = (rutaFirebase, idFill, idTxt, unidad = "") => {
    database.ref(rutaFirebase).on('value', (snapshot) => {
        let val = snapshot.val();
        
        // Limpieza de datos (por si llega [object Object])
        if (val !== null && typeof val === 'object') val = Object.values(val)[0];
        const num = parseFloat(val);

        if (!isNaN(num)) {
            const fill = document.getElementById(idFill);
            const txt = document.getElementById(idTxt);
            
            if (fill) fill.style.height = num + "%";
            if (txt) txt.innerText = num + unidad;
        }
    });
};

// --- LLAMADAS A FIREBASE ---
// Asegúrate de que los nombres 'Luz', 'Temperatura', etc., coincidan con tu Firebase
actualizarGrafica('Luz', 'fill-luz', 'txt-luz', "%");
actualizarGrafica('Temperatura', 'fill-temp', 'txt-temp', "°C");
actualizarGrafica('HumedadAmb', 'fill-hum-amb', 'txt-humedad-amb', "%");
actualizarGrafica('VPD', 'fill-vpd', 'txt-vpd', ""); 

// El de la tierra (que ya tenías)
actualizarGrafica('Humedad', 'fill-humedad-suelo', 'txt-humedad-suelo', "%");
};

window.cerrarMonitoreo = () => {
    document.getElementById('seccion-monitoreo').style.display = 'none';
    document.querySelector('main').style.display = 'flex';
    document.querySelector('.main-title-container').style.display = 'block';
    database.ref('Humedad').off(); // Apagar Firebase
};

// 3. LÓGICA DE CARGA (Al cargar el documento)
document.addEventListener('DOMContentLoaded', () => {
    
    const formatPlantData = (data, name) => {
        return `
            <div class="card-info-grid">
                <div class="card-info-item">💧<strong>Humedad</strong><span>${data.Humedad_Tierra.min}%-${data.Humedad_Tierra.max}%</span></div>
                <div class="card-info-item">🌡️<strong>Temp.</strong><span>${data.Temp_Ambiente.min}°-${data.Temp_Ambiente.max}°</span></div>
                <div class="card-info-item">☁️<strong>H_Amb</strong><span>${data.Hum_Ambiente.min}%-${data.Hum_Ambiente.max}%</span></div>
                <div class="card-info-item">📈<strong>VPD</strong><span>${data.VPD_Ideal.min}-${data.VPD_Ideal.max}</span></div>
                <button class="btn-monitorear" onclick="event.stopPropagation(); iniciarMonitoreo('${name}')">MONITOREAR</button>
            </div>`;
    };

    const updateCards = (map) => {
        globalPlantData = map;
        document.querySelectorAll('.plant-card').forEach(card => {
            const name = card.querySelector('img')?.alt.trim() || '';
            const key = cardKeyMap[name] || name.replace(/\s+/g, '_');
            
            let infoDiv = card.querySelector('.card-info');
            if (!infoDiv) {
                infoDiv = document.createElement('div');
                infoDiv.className = 'card-info';
                card.appendChild(infoDiv);
            }
            infoDiv.innerHTML = map[key] ? formatPlantData(map[key], name) : 'Cargando...';
        });
    };

    // Cargar JSON
    fetch('bdd2.json')
        .then(r => r.json())
        .then(json => {
            const map = {};
            const traverse = (o) => {
                for (let k in o) { 
                    if(o[k]?.Humedad_Tierra) map[k]=o[k]; 
                    else if(typeof o[k]==='object') traverse(o[k]); 
                }
            };
            traverse(json);
            updateCards(map);
        });

    // Manejo de clicks en tarjetas
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.plant-card');
        if (!card || e.target.classList.contains('btn-monitorear')) return;
        const open = document.querySelector('.plant-card.expanded');
        if (open) open.classList.remove('expanded');
        if (card !== open) card.classList.add('expanded');
    });
});