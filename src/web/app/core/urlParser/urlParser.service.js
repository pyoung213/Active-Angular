angular
    .module('app.core')
    .service('urlParser', urlParser);

function urlParser() {
    var service = {
        parse: parse
    };

    return service;

    function parse(url) {
        var a = document.createElement('a');
        a.href = url;
        return {
            url: a.href,
            protocol: a.protocol,
            host: a.hostname,
            port: a.port,
            path: a.pathname,
            hash: a.hash,
            search: a.search
        };
    }
}
