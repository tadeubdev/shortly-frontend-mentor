window.addEventListener('load', function() {
    document.querySelector('#navbar-menu a').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('#navbar-links').classList.toggle('active');
    });

    (function handleCloseMenuOnDocumentOutsideClick() {
        document.addEventListener('click', function(e) {
            let elmActual = e.target;
            while (elmActual.parentNode) {
                if (elmActual.id === 'navbar-links' || elmActual.id === 'navbar-menu') {
                    return;
                }
                elmActual = elmActual.parentNode;
            }
            document.querySelector('#navbar-links').classList.remove('active');
        });
    })();
});