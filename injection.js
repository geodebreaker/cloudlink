// cloudlink v1.0
// geodebreaker 2025 
// MIT licence

let cl_int = setInterval(() => { // repeditivley try to insert button since it takes time to load
	try {
		let h = document.querySelectorAll("div"); // loop through all divs to find the element with the specific class 
		h.forEach(x => x.classList.forEach(y => { // since react adds a random 5 chars at the end
			if (y.includes('stage-header_stage-size-row')) h = x;
		}));
		if (h.length) throw h;
		h.innerHTML = '<div class="cl-outer-btn" onclick="cl_new()"><span class="cl-btn-con' +
			'" role="button"><div><img alt="cloudlink" class="cl-btn-icon" draggable="false" ' +
			'src="https://scratch.mit.edu/svgs/project/clouddata.svg" title="cloudlink"></div></span></div>' +
			h.innerHTML; // insert button
		clearInterval(cl_int); // stop loop since button inserted
	} catch (e) { }
}, 1e3);

const OriginalWebSocket = window.WebSocket; // save original
let cl_npid = null; // the new project id, can be changed later
let cl_ws; // current websocket

function cl_new() {  // this runs when the button is clicked
	cl_npid = ('' + window.prompt('new project link or id')) // ask user
		.match(/\d+/)?.[0]; // parse out id
	cl_ws.close(); // close websocket so it reconnects and creates a new handshake we can manipulate
}

window.WebSocket = function (url, protocols) { // replace websocket so we can manipulate requests
	let ws = new OriginalWebSocket(url, protocols); // make a real websocket we can pipe through
	cl_ws = ws; // store websocket to be able to close it

	ws.addEventListener('open', function () {  
		console.log(`cl: connected to ${url}`);
	});

	const originalSend = ws.send; // save original
	ws.send = function (data) { // replace send
		try {
			let message = JSON.parse(data); // parse out message to modify

			if (cl_npid) {
				message.project_id = cl_npid; // modify project id if a new one is requested
			}

			data = JSON.stringify(message);
		} catch (e) { } // if it is not in json it will error out and not modify

		originalSend.call(this, data); // call original
	};

	return ws;
};

window.WebSocket.prototype = OriginalWebSocket.prototype; // copy prototype and constants from og ws to new ws
window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
window.WebSocket.OPEN = OriginalWebSocket.OPEN;
window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;