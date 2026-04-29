document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(ul => {
        const originalItems = ul.querySelectorAll('li');
        if (originalItems.length <= 2) return;

        const gap = 15;
        const itemsPerPage = 2.1;
        
        // 1. CLONACIÓN: Copiamos los primeros para el final y los últimos para el inicio
        const firstClone = originalItems[0].cloneNode(true);
        const secondClone = originalItems[1].cloneNode(true);
        const lastClone = originalItems[originalItems.length - 1].cloneNode(true);

        ul.appendChild(firstClone);   // El 1 ahora está después del 5
        ul.appendChild(secondClone); // El 2 ahora está después del nuevo 1
        ul.insertBefore(lastClone, originalItems[0]); // El 5 ahora está antes del 1

        const allItems = ul.querySelectorAll('li');
        let currentIndex = 1; // Empezamos en 1 porque el 0 es el clon del último
        let isTransitioning = false;

        // 2. ESTRUCTURA (Igual que antes)
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.width = '100%';
        
        const viewport = document.createElement('div');
        viewport.style.overflow = 'hidden';
        viewport.style.margin = '50px    50px';

        const dotsContainer = document.createElement('div');
        dotsContainer.style.display = 'flex';
        dotsContainer.style.justifyContent = 'center';
        dotsContainer.style.gap = '8px';
        dotsContainer.style.marginTop = '15px';

        ul.parentNode.insertBefore(container, ul);
        container.appendChild(viewport);
        viewport.appendChild(ul);
        container.after(dotsContainer);

        // Crear puntitos (solo para los originales)
        originalItems.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.width = '10px'; dot.style.height = '10px';
            dot.style.borderRadius = '50%'; dot.style.background = '#ccc';
            dotsContainer.appendChild(dot);
        });

        // 3. ESTILOS
        ul.style.display = 'flex';
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.margin = '0';
        ul.style.width = 'max-content';

        const updateSizes = () => {
            const itemWidth = (viewport.offsetWidth - gap) / itemsPerPage;
            allItems.forEach(li => {
                li.style.flex = `0 0 ${itemWidth}px`;
                li.style.width = `${itemWidth}px`;
            });
            ul.style.gap = `${gap}px`;
            move(false); // Mover sin animación al redimensionar
        };

        // 4. LÓGICA DE MOVIMIENTO
        const move = (animate = true) => {
            const itemWidth = allItems[0].offsetWidth + gap;
            ul.style.transition = animate ? 'transform 0.4s ease' : 'none';
            ul.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
            
            // Actualizar puntos
            let dotIndex = currentIndex - 1;
            if (dotIndex >= originalItems.length) dotIndex = 0;
            if (dotIndex < 0) dotIndex = originalItems.length - 1;
            
            Array.from(dotsContainer.children).forEach((dot, i) => {
                dot.style.background = (i === dotIndex) ? '#333' : '#ccc';
            });
        };

        // 5. EFECTO INFINITO (El truco de la teletransportación)
        ul.addEventListener('transitionend', () => {
            isTransitioning = false;
            // Si llegamos al clon del final (el 1), saltamos al 1 real sin animación
            if (currentIndex >= allItems.length - itemsPerPage) {
                currentIndex = 1;
                move(false);
            }
            // Si llegamos al clon del inicio (el 5), saltamos al 5 real
            if (currentIndex <= 0) {
                currentIndex = allItems.length - itemsPerPage - 1;
                move(false);
            }
        });

        // 6. BOTONES
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '&#10094;';
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '&#10095;';

        const btnStyle = (btn, side) => {
            btn.style.position = 'absolute'; btn.style[side] = '0';
            btn.style.top = '50%'; btn.style.transform = 'translateY(-50%)';
            btn.style.background = '#333'; btn.style.color = 'white';
            btn.style.border = 'none'; btn.style.width = '35px';
            btn.style.height = '35px'; btn.style.borderRadius = '50%';
            btn.style.cursor = 'pointer'; btn.style.zIndex = '10';
        };

        btnStyle(prevBtn, 'left'); btnStyle(nextBtn, 'right');
        container.appendChild(prevBtn); container.appendChild(nextBtn);

        nextBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex++;
            move();
        });

        prevBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex--;
            move();
        });

        updateSizes();
    });
});
