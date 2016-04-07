'use strict';

var di = require('simple-di');

di.register('Routes', Routes);

function Routes(Config, AssetRoutes, IndexRoutes) {
    var service = {
        enable: enable
    };

    return service;

    function enable(app) {
        // This ordering is intentional.
        // If you change it, please test everything.
        enableHealthCheck(app);
        enableHttpsRedirect(app);
        AssetRoutes.enable(app);
        IndexRoutes.enable(app);
    }

    function enableHealthCheck(app) {
        // Give Amazon load-balancer health checks something to check against
        app.get('/healthcheck', function(_req, res) {
            res.sendStatus(200);
        });
    }

    function enableHttpsRedirect(app) {
        if (!Config.env.production) {
            return;
        }

        function requireHTTPS(req, res, next) {
            if (req.get('x-forwarded-proto') !== 'https') {
                return res.redirect('https://' + req.get('host') + req.url);
            }
            next();
        }

        app.use(requireHTTPS);
    }
}
