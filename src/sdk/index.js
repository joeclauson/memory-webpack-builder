const ifDirectives = document.querySelectorAll("[h-if]");

const _store = {
    hide: false,
}

const storeHandler = {
    set: function (obj, prop, value) {
        if (prop === 'hide') {
            obj[prop] = value;
            console.log(ifDirectives);
            ifDirectives.forEach(dir => {
                dir.classList.add('hide');
            })
        }

        return true;
    }
}
const storeProxy = new Proxy(_store, storeHandler);

export { storeProxy as store }
