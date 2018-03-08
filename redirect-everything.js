module.exports = MiddlewareBase => class Redirector extends MiddlewareBase {
    optionDefinitions() {
        return [
            {
              name: 'redirectPort',
              type: Number,
              description: 'Port which is used to redirect to https',
            }
        ]
    }
    middleware(options) {
        if (!options.redirectPort) {
            console.warn('\x1b[33m%s\x1b[0m', 'redirectPort parameter is not set, defaulting to 4443');
            options.redirectPort = 4443;
        }

        return (ctx, next) => {
            // Check if protocol is http
            if (ctx.protocol === 'http') {

                // Replacing url with https parameter
                const httpsUrl = ctx.request.href
                    .replace('http', 'https')
                    .replace(options.port, options.redirectPort);

                // Enforcing redirect
                ctx.redirect(httpsUrl);
            }
        }
    }
}
