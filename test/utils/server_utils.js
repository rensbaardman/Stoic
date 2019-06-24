const http = require('http');
const fs = require('fs');
const path = require('path');

const fixtureDir = path.join(__dirname, 'fixtures');

function createTestServer() {
	const testServer = http.createServer(function (request, response) {

		 // With 'split' we take off the port number.
		hostRequest = request.headers.host.split(':')[0]

		if (hostRequest == 'localhost') {
			response.writeHead(404, {'Content-Type': 'text/html'});
			response.write(`<h1>HostRequest was localhost; try a mock url</h1>`);
			response.end();
		}
		else {

			const filename = `${fixtureDir}/${hostRequest}.html`
			// We try to serve anything else that comes in no localhost. Specifically: 'earth.test', 'moon.test', etc.
			fs.readFile(filename, {encoding: 'utf-8'}, function(err, data){
				if (!err) {
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.write(data);
					response.end();
				} else {
					response.writeHead(404, {'Content-Type': 'text/html'});
					response.write(`<h1>file ${filename} not found</h1>`);
					response.end();
				}
			});
		}

	})

	return testServer;
}

module.exports = {
	createTestServer: createTestServer
}
