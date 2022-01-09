window.addEventListener('load', function () {
    document.querySelector('#navbar-menu a').addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector('#navbar-links').classList.toggle('active');
    });

    (function handleCloseMenuOnDocumentOutsideClick() {
        document.addEventListener('click', function (e) {
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

    const shortenResultTemplate = document.querySelector('#shorten-result-template');
    const shortResultsContainer = document.querySelector('#shorten-results');
    const shortenFormError = document.querySelector('#main-form-error');
    const mainForm = document.querySelector('#main-form');
    const mainFormLoading = document.querySelector('#shorten-results-loading');

    const mountNewShortenResult = (url, shortenUrl) => {
        shortenResultTemplate.content.querySelector('.shorten-result-title').innerText = url;
        shortenResultTemplate.content.querySelector('.shorten-result-body a').href = shortenUrl;
        shortenResultTemplate.content.querySelector('.shorten-result-body a').innerText = shortenUrl;
        return document.importNode(shortenResultTemplate.content, true);
    }

    const makeRandomId = (length = 10) => {
        let result = '';
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const handleShortUrlTest = (urlToShorten) => {
        return new Promise((resolve, reject) => {
            try {
                const shorten = makeRandomId();
                const shortenUrl = `${window.location.origin}/${shorten}`;
                setTimeout(() => resolve(shortenUrl), 2 * 1000);
            } catch(e) {
                reject(e);
            }
        });
    }

    const handleShortUrl = (urlToShorten) => {
        const urlToShortenMethod = handleShortUrlTest(urlToShorten);

        return new Promise((resolve, reject) => {
            urlToShortenMethod.then(resolve).catch(reject);
        });
    }

    const saveShortenUrlOnLocalStorage = (url, shortenUrl) => {
        const data = [url, shortenUrl];
        let savedData = localStorage.getItem('urls') || '[]';
        savedData = JSON.parse(savedData);
        savedData.push(data);
        const dataToSave = JSON.stringify(savedData);
        this.localStorage.setItem('urls', dataToSave);
    }

    const saveShortenUrlLocally = (url, shortenUrl) => {
        saveShortenUrlOnLocalStorage(url, shortenUrl);
    }

    const updateFormError = (error) => {
        shortenFormError.innerText = error;
        if (error) {
            shortenFormError.classList.add('active');
            return;
        }
        shortenFormError.classList.remove('active');
    }

    const setFormLoading = (loading) => {
        if (loading) {
            mainForm.classList.add('loading');
            mainFormLoading.classList.add('active');
            document.querySelector('#url-to-shorten').disabled = true;
            document.querySelector('#main-form-submit').disabled = true;
            return;
        }
        mainForm.classList.remove('loading');
        mainFormLoading.classList.remove('active');
        document.querySelector('#url-to-shorten').disabled = false;
        document.querySelector('#main-form-submit').disabled = false;
    }

    const insertShortenedUrl = (elmResult) => {
        shortResultsContainer.prepend(elmResult);
    }

    const handleCopyValueToClipboard = (text) => {
        if (!navigator.clipboard) {
            return new Promise((resolve, reject) => {
                reject('Your browser does not support clipboard');
            });
        }
        return navigator.clipboard.writeText(text);
    }

    const handleCopyUrl = (event) => {
        const clickedButton = event.target;
        const clickedParent = clickedButton.parentNode;
        const shortenUrl = clickedButton.parentNode.parentNode.querySelector('.shorten-result-body a').href;
        
        handleCopyValueToClipboard(shortenUrl).then(() => {
            clickedParent.classList.add('copied');
            setTimeout(() => clickedParent.classList.remove('copied'), 3 * 1000);
        }).catch((error) => {
            alert(error);
        });
    }

    const handleSubmitForm = (event) => {
        event.preventDefault();
        if (event.target.classList.contains('loading')) {
            return;
        }
        updateFormError(null);
        const urlToShorten = document.querySelector('#url-to-shorten').value.trim();
        if (urlToShorten.length === 0) {
            document.querySelector('#main-form').classList.add('empty');
            return;
        }
        setFormLoading(true);
        handleShortUrl(urlToShorten).then(shortenUrl => {
            const elmResult = mountNewShortenResult(urlToShorten, shortenUrl);
            insertShortenedUrl(elmResult);
            saveShortenUrlLocally(urlToShorten, shortenUrl);
        }).catch(error => {
            updateFormError(error.message);
        }).finally(() => {
            setFormLoading(false);
        });
    }

    (function mountSavedUrls(){
        const savedData = localStorage.getItem('urls') || '[]';
        let urls = JSON.parse(savedData);
        if (!urls.length) {
            return;
        }
        for (let url of urls) {
            const elmResult = mountNewShortenResult(url[0], url[1]);
            insertShortenedUrl(elmResult);
        }
    })();

    document.querySelector('#url-to-shorten').addEventListener('input', function () {
        const urlToShorten = this.value.trim();
        updateFormError(null);
        if (urlToShorten.length === 0) {
            document.querySelector('#main-form').classList.add('empty');
            return;
        }
        document.querySelector('#main-form').classList.remove('empty');
    });

    document.querySelector('#main-form').addEventListener('submit', handleSubmitForm);
    
    (function handleAddEventoToBtnCopy() {
        document.body.addEventListener('click', function (event) {
            if (!event || !event.target || event.target.classList.contains('btn-copy-url') === false) {
                return;
            }
            handleCopyUrl(event);
        });
    })();
});