document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carousel');
    const GAP = 15;
    const ITEMS_PER_PAGE = 2.1;

    carousels.forEach(ul => {
        const originalItems = ul.querySelectorAll('li');
        if (originalItems.length <= 2) return;

        // 1. CLONACIÓN (Para efecto infinito)
        const firstClone = originalItems[0].cloneNode(true);
        const secondClone = originalItems[1].cloneNode(true);
        const lastClone = originalItems[originalItems.length - 1].cloneNode(true);

        ul.appendChild(firstClone);
        ul.appendChild(secondClone);
        ul.insertBefore(lastClone, originalItems[0]);

        const allItems = ul.querySelectorAll('li');
        let currentIndex = 1;
        let isTransitioning = false;

        // 2. CREACIÓN DE ESTRUCTURA
        const container = document.createElement('div');
        const viewport = document.createElement('div');
        const dotsContainer = document.createElement('div');

        // Estilos rápidos del contenedor
        Object.assign(container.style, { position: 'relative', width: '100%' });
        Object.assign(viewport.style, { overflow: 'hidden', margin: '50px' });
        Object.assign(dotsContainer.style, { 
            display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '15px' 
        });

        ul.parentNode.insertBefore(container, ul);
        container.append(viewport, dotsContainer); // Insertamos dots al final
        viewport.appendChild(ul);

        // Crear puntos indicadores
        originalItems.forEach(() => {
            const dot = document.createElement('div');
            Object.assign(dot.style, { 
                width: '10px', height: '10px', borderRadius: '50%', background: '#ccc' 
            });
            dotsContainer.appendChild(dot);
        });

        // 3. ESTILOS DEL UL
        Object.assign(ul.style, { 
            display: 'flex', listStyle: 'none', padding: '0', margin: '0', width: 'max-content' 
        });

        const move = (animate = true) => {
            const itemWidth = allItems[0].offsetWidth + GAP;
            ul.style.transition = animate ? 'transform 0.4s ease' : 'none';
            ul.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
            
            // Actualizar puntos
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

        // 4. EVENTOS Y BOTONES
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