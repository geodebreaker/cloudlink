let cl_int = setInterval(() => {
	try {
		let h = document.querySelectorAll("div");
		h.forEach(x => x.classList.forEach(y => {
			if (y.includes('stage-header_stage-size-row')) h = x;
		}));
		if (h.length) throw h;
		h.innerHTML = '<div class="cl-outer-btn" onclick="cl_new()"><span class="cl-btn-con' +
			'" role="button"><div><img alt="cloudlink" class="cl-btn-icon" draggable="false" ' +
			'src="https://scratch.mit.edu/svgs/project/clouddata.svg" title="cloudlink"></div></span></div>' +
			h.innerHTML;
		clearInterval(cl_int);
	} catch (e) { }
}, 1e3);

const OriginalWebSocket = window.WebSocket;
let cl_npid = null;
let cl_ws;

function cl_new() {
	cl_npid = ('' + window.prompt('new project link or id')).match(/\d+/)?.[0];
	cl_ws.close();
}

window.WebSocket = function (url, protocols) {
	let ws = new OriginalWebSocket(url, protocols);
	cl_ws = ws;

	ws.addEventListener('open', function () {
		console.log(`connected ws`);
	});

	const originalSend = ws.send;
	ws.send = function (data) {
		try {
			let message = JSON.parse(data);

			if (cl_npid) {
				message.project_id = cl_npid;
			}

			data = JSON.stringify(message);
		} catch (e) { }

		originalSend.call(this, data);
	};

	return ws;
};

window.WebSocket.prototype = OriginalWebSocket.prototype;
window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
window.WebSocket.OPEN = OriginalWebSocket.OPEN;
window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;