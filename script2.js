document.addEventListener('DOMContentLoaded', () => {
    // Agregar contenedor de info dentro de cada tarjeta
    document.querySelectorAll('.plant-card').forEach(card => {
        const infoText = card.getAttribute('data-info');
        const infoDiv = document.createElement('div');
        infoDiv.className = 'card-info';
        infoDiv.textContent = infoText;
        card.appendChild(infoDiv);
    });

    // Manejar clics para expandir/contraer tarjetas
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.plant-card');
        
        if (card) {
            e.stopPropagation();
            
            // Cerrar otras tarjetas expandidas
            document.querySelectorAll('.plant-card.expanded').forEach(other => {
                if (other !== card) {
                    other.classList.remove('expanded');
                }
            });
            
            // Toggle la clase expanded
            card.classList.toggle('expanded');
        } else {
            // Cerrar todas al hacer clic fuera
            document.querySelectorAll('.plant-card.expanded').forEach(c => {
                c.classList.remove('expanded');
            });
        }
    });
});