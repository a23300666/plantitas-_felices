// ===============================
// 0. INICIALIZACIÓN DE FIREBASE
// ===============================
const firebaseConfig = {
    apiKey: "EWBNn3mwpeBSJewNV85HZBryTHh7jtlTmaQTrzYw", 
    databaseURL: "https://plantitas-felices-d026b-default-rtdb.firebaseio.com/",
    projectId: "plantitas-felices-d026b"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// ===============================
// 1. FUNCIONES DE LOGIN/REGISTRO
// ===============================

// --- FUNCIONES DE NAVEGACIÓN ---
function showTab(type) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const tabL = document.getElementById('tab-login');
    const tabR = document.getElementById('tab-register');
    const errorMsg = document.getElementById('login-error');

    errorMsg.style.display = "none"; // Limpiar errores al cambiar de pestaña

    if (type === 'login') {
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
        tabL.classList.add('active');
        tabR.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        regForm.style.display = 'block';
        tabR.classList.add('active');
        tabL.classList.remove('active');
    }
}

// --- LÓGICA DE REGISTRO ---
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('reg-nombre').value.trim();
            const pass = document.getElementById('reg-pass').value;
            const passConfirm = document.getElementById('reg-pass-confirm').value;

            if (pass !== passConfirm) {
                alert("⚠️ Las contraseñas no coinciden.");
                return;
            }

            // Verificar si el usuario ya existe
            firebase.database().ref('/usuarios/' + nombre).once('value')
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        alert("❌ Este nombre de usuario ya existe. Elige otro.");
                    } else {
                        const passEncriptada = CryptoJS.SHA256(pass).toString();

                        const nuevoUsuario = {
                            nombre: nombre,
                            contrasena: passEncriptada,
                            lecturas: {
                                Humedad_Tierra: { actual: 0 },
                                Luz: { actual: 0 },
                                Temperatura: { actual: 0 },
                                Humedad_Ambiente: { actual: 0 },
                                VPD: { actual: 0 }
                            }
                        };

                        return firebase.database().ref('/usuarios/' + nombre).set(nuevoUsuario);
                    }
                })
                .then(() => {
                    if (nombre) {
                        alert("✅ ¡Cuenta creada! Ahora inicia sesión.");
                        showTab('login');
                    }
                })
                .catch(err => console.error("Error en registro:", err));
        });
    }

    // --- LÓGICA DE LOGIN ---
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const inputNombre = document.getElementById('login-id').value.trim();
            const inputPass = document.getElementById('login-pass').value;
            const errorMsg = document.getElementById('login-error');
            
            const inputPassEncriptada = CryptoJS.SHA256(inputPass).toString();

            firebase.database().ref('/usuarios/' + inputNombre).once('value')
                .then((snapshot) => {
                    const userData = snapshot.val();

                    if (userData) {
                        if (userData.contrasena === inputPassEncriptada) {
                            console.log("Login exitoso para:", inputNombre);
                            document.getElementById('modal-login').style.display = 'none';
                            document.getElementById('btn-logout').style.display = 'block';
                            window.usuarioLogueado = inputNombre;
                            firebase.database().ref('/Control_Dispositivo').set({
                                usuario_activo: inputNombre
                            });
                            alert("✨ ¡Bienvenido de nuevo, " + inputNombre + "!");
                        } else {
                            errorMsg.innerText = "❌ Contraseña incorrecta";
                            errorMsg.style.display = "block";
                        }
                    } else {
                        errorMsg.innerText = "❓ El usuario no existe";
                        errorMsg.style.display = "block";
                    }
                })
                .catch((error) => {
                    console.error("Error en login:", error);
                    alert("Error de conexión con la base de datos.");
                });
        });
    }

    // --- LÓGICA DE CERRAR SESIÓN ---
    const btnLogout = document.getElementById('btn-logout');
    
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm("¿Seguro que quieres salir del jardín?")) {
                firebase.database().ref('/Control_Dispositivo').set({
                    usuario_activo: "ninguno"
                }).then(() => {
                    window.location.reload();
                }).catch(err => {
                    console.error("Error al cerrar sesión:", err);
                    window.location.reload();
                });
            }
        });
    }
});

// ===============================
// 2. FUNCIONES DE BÚSQUEDA
// ===============================

const cardKeyMap = {
    'Sansevieria': 'suegra', 'Gomero': 'gomero', 'Ficus Elastica': 'gomero', 'ZZ': 'ZZ', 'Zamioculca': 'ZZ',
    'Potus': 'Potus', 'Dracaena': 'dracanea', 'Monstera': 'Monstera', 'Espatifilo': 'Espatifilo',
    'Ficus Benjamina': 'Ficus_Benjamina', 'Higuera Llorona': 'Ficus_Benjamina', 'Palma Areca': 'Palma_Areca',
    'Philodendron': 'Philodendron', 'Filodendro': 'Philodendron', 'Orquídeas': 'Orquideas', 'Ficus Lyrata': 'Ficus_Lyrata',
    'Hojas de Violín': 'Ficus_Lyrata', 'Calathea': 'Calathea', 'Begonia Maculata': 'Begonia_Maculata',
    'Helecho de Boston': 'Helecho_Boston', 'Zanahoria': 'Zanahoria', 'Frijoles': 'Frijoles',
    'Jitomate': 'Jitomate', 'Lechuga': 'Lechuga', 'Cebolla': 'Cebolla'
};

let globalPlantData = {};

function loadPlantData() {
    fetch('../code/bdd2.json')
        .then(response => response.json())
        .then(data => {
            const plantas = data.Categorias.Plantas_Domesticas;
            for (let nivel in plantas) {
                Object.assign(globalPlantData, plantas[nivel]);
            }
            if (data.Categorias.Cultivos) {
                for (let cultivo in data.Categorias.Cultivos) {
                    Object.assign(globalPlantData, data.Categorias.Cultivos[cultivo]);
                }
            }
        })
        .catch(err => console.error('Error cargando bdd2.json:', err));
}

function closeSearchResults() {
    const resultsPanel = document.getElementById('search-results');
    if (resultsPanel) {
        resultsPanel.style.display = 'none';
    }
}

function displaySearchResults(searchTerm, plants) {
    const resultsPanel = document.getElementById('search-results');
    const resultsList = document.getElementById('results-list');
    if (!resultsPanel || !resultsList) return;
    
    resultsList.innerHTML = '';

    if (plants.length === 0) {
        resultsList.innerHTML = '<p style="text-align: center; color: #999;">No se encontraron plantas</p>';
    } else {
        plants.forEach(plant => {
            const key = plant.key;
            const displayName = plant.name;
            const plantInfo = globalPlantData[key];

            let htmlContent = `
                <div class="result-item" onclick="window.iniciarMonitoreo('${displayName}')">
                    <div class="result-plant-name">🌱 ${displayName}</div>
                    <div class="result-conditions">
            `;

            if (plantInfo) {
                htmlContent += `
                    <div class="condition-item">
                        <strong>Temperatura</strong>
                        <span>${plantInfo.Temp_Ambiente.min}-${plantInfo.Temp_Ambiente.max}°C</span>
                    </div>
                    <div class="condition-item">
                        <strong>Luz</strong>
                        <span>${plantInfo.Luz.min}-${plantInfo.Luz.max}%</span>
                    </div>
                    <div class="condition-item">
                        <strong>Humedad Suelo</strong>
                        <span>${plantInfo.Humedad_Tierra.min}-${plantInfo.Humedad_Tierra.max}%</span>
                    </div>
                    <div class="condition-item">
                        <strong>Humedad Aire</strong>
                        <span>${plantInfo.Hum_Ambiente.min}-${plantInfo.Hum_Ambiente.max}%</span>
                    </div>
                `;
            }

            htmlContent += '</div></div>';
            resultsList.innerHTML += htmlContent;
        });
    }

    resultsPanel.style.display = 'block';
}

function setupSearch() {
    const searchInput = document.getElementById('search-plants');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm === '') {
            closeSearchResults();
            return;
        }

        const matchedPlants = [];
        for (let displayName in cardKeyMap) {
            if (displayName.toLowerCase().includes(searchTerm)) {
                matchedPlants.push({
                    name: displayName,
                    key: cardKeyMap[displayName]
                });
            }
        }

        if (matchedPlants.length > 0) {
            displaySearchResults(searchTerm, matchedPlants);
        } else {
            closeSearchResults();
        }
    });
}

// ===============================
// 3. CARRUSELES
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    loadPlantData();
    setupSearch();
    
    const carousels = document.querySelectorAll('.carousel');
    const GAP = 15;
    const ITEMS_PER_PAGE = 2.1;

    carousels.forEach(ul => {
        const originalItems = ul.querySelectorAll('li');
        if (originalItems.length <= 2) return;

        const firstClone = originalItems[0].cloneNode(true);
        const secondClone = originalItems[1].cloneNode(true);
        const lastClone = originalItems[originalItems.length - 1].cloneNode(true);

        ul.appendChild(firstClone);
        ul.appendChild(secondClone);
        ul.insertBefore(lastClone, originalItems[0]);

        const allItems = ul.querySelectorAll('li');
        let currentIndex = 1;
        let isTransitioning = false;

        const container = document.createElement('div');
        const viewport = document.createElement('div');
        const dotsContainer = document.createElement('div');

        Object.assign(container.style, { position: 'relative', width: '100%' });
        Object.assign(viewport.style, { overflow: 'hidden', margin: '50px' });
        Object.assign(dotsContainer.style, { 
            display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '15px' 
        });

        ul.parentNode.insertBefore(container, ul);
        container.append(viewport, dotsContainer);
        viewport.appendChild(ul);

        originalItems.forEach(() => {
            const dot = document.createElement('div');
            Object.assign(dot.style, { 
                width: '10px', height: '10px', borderRadius: '50%', background: '#ccc' 
            });
            dotsContainer.appendChild(dot);
        });

        Object.assign(ul.style, { 
            display: 'flex', listStyle: 'none', padding: '0', margin: '0', width: 'max-content' 
        });

        const move = (animate = true) => {
            const itemWidth = allItems[0].offsetWidth + GAP;
            ul.style.transition = animate ? 'transform 0.4s ease' : 'none';
            ul.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
            
            let dotIndex = (currentIndex - 1 + originalItems.length) % originalItems.length;
            Array.from(dotsContainer.children).forEach((dot, i) => {
                dot.style.background = (i === dotIndex) ? '#333' : '#ccc';
            });
        };

        const updateSizes = () => {
            const itemWidth = (viewport.offsetWidth - GAP) / ITEMS_PER_PAGE;
            allItems.forEach(li => {
                li.style.flex = `0 0 ${itemWidth}px`;
                li.style.width = `${itemWidth}px`;
            });
            ul.style.gap = `${GAP}px`;
            move(false);
        };

        ul.addEventListener('transitionend', () => {
            isTransitioning = false;
            if (currentIndex >= allItems.length - ITEMS_PER_PAGE) {
                currentIndex = 1;
                move(false);
            } else if (currentIndex <= 0) {
                currentIndex = allItems.length - ITEMS_PER_PAGE - 1;
                move(false);
            }
        });

        const createBtn = (symbol, side) => {
            const btn = document.createElement('button');
            btn.innerHTML = symbol;
            Object.assign(btn.style, {
                position: 'absolute', [side]: '0', top: '50%', transform: 'translateY(-50%)',
                background: '#333', color: 'white', border: 'none', width: '35px',
                height: '35px', borderRadius: '50%', cursor: 'pointer', zIndex: '10'
            });
            return btn;
        };

        const prevBtn = createBtn('&#10094;', 'left');
        const nextBtn = createBtn('&#10095;', 'right');

        nextBtn.onclick = () => { if (!isTransitioning) { isTransitioning = true; currentIndex++; move(); }};
        prevBtn.onclick = () => { if (!isTransitioning) { isTransitioning = true; currentIndex--; move(); }};

        container.append(prevBtn, nextBtn);
        window.addEventListener('resize', updateSizes);
        updateSizes();
    });
});