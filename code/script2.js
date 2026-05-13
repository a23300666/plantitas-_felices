// 1. CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "EWBNn3mwpeBSJewNV85HZBryTHh7jtlTmaQTrzYw", 
    databaseURL: "https://plantitas-felices-d026b-default-rtdb.firebaseio.com/",
    projectId: "plantitas-felices-d026b"
};

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

// 2. FUNCIONES DE MONITOREO
window.iniciarMonitoreo = (nombrePlanta) => {
    // VERIFICACIÓN: Si no hay usuario logueado, no permitir monitoreo
    if (!window.usuarioLogueado || window.usuarioLogueado === "") {
        alert("Por favor, inicia sesión para ver tus lecturas en vivo.");
        return;
    }

    console.log("Iniciando monitoreo para:", nombrePlanta, "Usuario:", window.usuarioLogueado);
    
    // Ocultar catálogo
    document.querySelector('main').style.display = 'none';
    const mainTitle = document.querySelector('.main-title-container');
    if (mainTitle) mainTitle.style.display = 'none';
    
    // Mostrar panel de monitoreo
    const seccion = document.getElementById('seccion-monitoreo');
    if (seccion) seccion.style.display = 'block';

    // Actualizar Título
    document.getElementById('titulo-monitoreo').innerText = `Monitoreo en Vivo: ${nombrePlanta}`;

    // Cargar rangos óptimos desde el JSON local (bdd2.json)
    const key = cardKeyMap[nombrePlanta] || nombrePlanta;
    const info = globalPlantData[key];
    if (info) {
        document.getElementById('opt-temp').innerText = `Ideal: ${info.Temp_Ambiente.min}-${info.Temp_Ambiente.max}°`;
        document.getElementById('opt-humedad-amb').innerText = `Ideal: ${info.Hum_Ambiente.min}-${info.Hum_Ambiente.max}%`;
        document.getElementById('opt-vpd').innerText = `Ideal: ${info.VPD_Ideal.min}-${info.VPD_Ideal.max}`;
        document.getElementById('opt-humedad-suelo').innerText = `Ideal: ${info.Humedad_Tierra.min}-${info.Humedad_Tierra.max}%`;
        document.getElementById('opt-luz').innerText = "Ideal: " + (info.Luz ? `${info.Luz.min}-${info.Luz.max}%` : "N/A");
    }

    // RUTA DINÁMICA BASADA EN EL USUARIO
    const userPath = `usuarios/${window.usuarioLogueado}/lecturas/`;

    // --- FUNCIÓN AUXILIAR PARA ACTUALIZAR GRÁFICAS ---
    const actualizarGrafica = (subRuta, idFill, idTxt, unidad = "", idOpt = null) => {
        database.ref(userPath + subRuta).on('value', (snapshot) => {
            let val = snapshot.val();
            if (val !== null && typeof val === 'object') val = Object.values(val)[0];
            const num = parseFloat(val);

            if (!isNaN(num)) {
                const fill = document.getElementById(idFill);
                const txt = document.getElementById(idTxt);
                if (fill) fill.style.height = num + "%";
                if (txt) txt.innerText = num + unidad;

                if (idOpt === 'opt-luz') {
                    const opt = document.getElementById(idOpt);
                    if (opt) {
                        if (num < 20) opt.innerText = "Poca luz";
                        else if (num < 70) opt.innerText = "Luz óptima";
                        else opt.innerText = "Mucha luz";
                    }
                }
            }
        });
    };

    // ACTUALIZACIONES CON LA NUEVA RUTA
    actualizarGrafica('Luz/actual', 'fill-luz', 'txt-luz', "%", 'opt-luz');
    actualizarGrafica('Temperatura/actual', 'fill-temp', 'txt-temp', "°C");

    // Humedad Ambiente Especial
    database.ref(userPath + 'Humedad_Ambiente/actual').on('value', (snapshot) => {
        let val = snapshot.val();
        const num = parseFloat(val);
        if (!isNaN(num)) {
            const fillHum = document.getElementById('fill-hum-amb');
            const txtHum = document.getElementById('txt-humedad-amb');
            let porcentajeAltura = (num / 50) * 100; 
            if (porcentajeAltura > 100) porcentajeAltura = 100;
            if (fillHum) fillHum.style.height = porcentajeAltura + "%";
            if (txtHum) txtHum.innerText = num.toFixed(1) + "%"; 
        }
    });

    // VPD Especial
    database.ref(userPath + 'VPD/actual').on('value', (snapshot) => {
        let val = snapshot.val();
        const num = parseFloat(val);
        if (!isNaN(num)) {
            const fillVpd = document.getElementById('fill-vpd');
            const txtVpd = document.getElementById('txt-vpd');
            let porcentajeAltura = num * 10; 
            if (porcentajeAltura > 100) porcentajeAltura = 100;
            if (fillVpd) fillVpd.style.height = porcentajeAltura + "%";
            if (txtVpd) txtVpd.innerText = num.toFixed(2);
        }
    });

    actualizarGrafica('Humedad_Tierra/actual', 'fill-humedad-suelo', 'txt-humedad-suelo', "%");
};

window.cerrarMonitoreo = () => {
    document.getElementById('seccion-monitoreo').style.display = 'none';
    document.querySelector('main').style.display = 'flex';
    const mainTitle = document.querySelector('.main-title-container');
    if (mainTitle) mainTitle.style.display = 'block';
    
    // Apagar listeners dinámicos
    if(window.usuarioLogueado){
        const userPath = `usuarios/${window.usuarioLogueado}/lecturas/`;
        database.ref(userPath + 'Luz/actual').off();
        database.ref(userPath + 'Temperatura/actual').off();
        database.ref(userPath + 'Humedad_Ambiente/actual').off();
        database.ref(userPath + 'VPD/actual').off();
        database.ref(userPath + 'Humedad_Tierra/actual').off();
    }
};

// 3. LÓGICA DE CARGA INICIAL (IGUAL A TU CÓDIGO)
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
            const img = card.querySelector('img');
            const name = img ? img.alt.trim() : '';
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
        })
        .catch(err => console.error("Error cargando bdd2.json:", err));

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.plant-card');
        if (!card || e.target.classList.contains('btn-monitorear')) return;
        const isExpanded = card.classList.contains('expanded');
        document.querySelectorAll('.plant-card.expanded').forEach(c => c.classList.remove('expanded'));
        if (!isExpanded) card.classList.add('expanded');
    });
});