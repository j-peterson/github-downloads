var https = require('https');

var options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/repos/mdpnp/mdpnp/releases/latest',
    method: 'GET',
    headers: {
        'User-Agent': 'openice'
    }
};

function callback (response) {
    var body = '';

    console.log("statusCode: ", response.statusCode);
    // console.log("headers: ", response.headers);

    response.on('data', function (chunk) {
        body += chunk;
    });

    response.on('end', function () {
        // console.log(JSON.parse(body));
        writeToMongo(JSON.parse(body));
    });
}

https.request(options, callback).end();

function writeToMongo (httpResponse) {

    delete httpResponse.body;

    // delete all supplimentary urls containing "_url"
    function deleteUrls (httpResponse) {
        for (var key in httpResponse) {
            if (typeof httpResponse[key] === 'object') {
                deleteUrls(httpResponse[key]);
            } else if (/_url/.test(key)) {
                delete httpResponse[key];
            }
        }
    }
    deleteUrls(httpResponse);

    console.log(httpResponse);
}