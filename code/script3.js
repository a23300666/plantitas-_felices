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

// --- LÓGICA DE REGISTRO (Sin redundancia y con confirmación) ---
const registerForm = document.getElementById('register-form');

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

                // Objeto limpio: El nombre es la llave, no necesitamos guardarlo doble
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
            if (nombre) { // Solo si se ejecutó el .set anterior
                alert("✅ ¡Cuenta creada! Ahora inicia sesión.");
                showTab('login');
            }
        })
        .catch(err => console.error("Error en registro:", err));
});

// --- LÓGICA DE LOGIN (Corrección de cierre de modal y errores) ---
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const inputNombre = document.getElementById('login-id').value.trim();
    const inputPass = document.getElementById('login-pass').value;
    const errorMsg = document.getElementById('login-error');
    
    // Encriptar el intento para comparar con la BDD
    const inputPassEncriptada = CryptoJS.SHA256(inputPass).toString();

    firebase.database().ref('/usuarios/' + inputNombre).once('value')
        .then((snapshot) => {
            const userData = snapshot.val();

            if (userData) {
                // El usuario existe, ahora comparamos contraseñas
                if (userData.contrasena === inputPassEncriptada) {
                    // 1. LOGIN EXITOSO
                    console.log("Login exitoso para:", inputNombre);
                    // Dentro del login exitoso (donde ocultas el modal):
document.getElementById('modal-login').style.display = 'none';
document.getElementById('btn-logout').style.display = 'block'; // Mostrar el botón al entrar
                    // Dentro de la función de login exitoso:
window.usuarioLogueado = inputNombre; // Esto lo hace visible para el script2.js
                    // Avisar al Arduino
                    firebase.database().ref('/Control_Dispositivo').set({
                        usuario_activo: inputNombre
                    });

                    // OCULTAR MODAL (Asegúrate que el ID sea correcto)
                    document.getElementById('modal-login').style.display = 'none';
                    alert("✨ ¡Bienvenido de nuevo, " + inputNombre + "!");
                } else {
                    // 2. CONTRASEÑA INCORRECTA
                    errorMsg.innerText = "❌ Contraseña incorrecta";
                    errorMsg.style.display = "block";
                }
            } else {
                // 3. USUARIO NO EXISTE
                errorMsg.innerText = "❓ El usuario no existe";
                errorMsg.style.display = "block";
            }
        })
        .catch((error) => {
            console.error("Error en login:", error);
            alert("Error de conexión con la base de datos.");
        });
});
// --- LÓGICA DE CERRAR SESIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    const btnLogout = document.getElementById('btn-logout');
    
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            // 1. Confirmar con el usuario
            if (confirm("¿Seguro que quieres salir del jardín?")) {
                
                // 2. Avisar al Arduino que ya no hay nadie activo
                // Esto evita que el ESP32 siga mandando datos a tu cuenta
                firebase.database().ref('/Control_Dispositivo').set({
                    usuario_activo: "ninguno"
                }).then(() => {
                    // 3. Reiniciar la página para que aparezca el login de nuevo
                    // Es la forma más limpia de resetear todos los estados de la web
                    window.location.reload();
                }).catch(err => {
                    console.error("Error al cerrar sesión:", err);
                    // Si falla el internet, al menos recargamos la página
                    window.location.reload();
                });
            }
        });
    }
});