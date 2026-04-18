// cloudlink v1.1
// geodebreaker 2025 
// MIT license

let cl_btn = null;
let cl_int = setInterval(() => { // repeditivley try to insert button since it takes time to load
	try {
		if (document.querySelector('#cl-btn-con')) return;
		if (!document.querySelector(".profile-name") &&
			!location.origin.includes('turbowarp')) return;
		let h = document.querySelectorAll("div"); // loop through all divs to find the element with the specific class 
		h.forEach(x => x.classList.forEach(y => { // since react adds a random 5 chars at the end
			if (y.includes('stage-header_stage-size-row')
				|| y.includes('stage-header_fullscreen-buttons-row')
				|| y.includes('stage-header_unselect-wrapper')) h = x;
		}));
		if (h.length) return;
		let p = document.createElement('p'); // create button
		p.innerHTML = '<div id="cl-outer-btn" onclick="cl_new()"><span id="cl-btn-con" class="' +
			(location.origin.includes('turbowarp') ? 'cl-tw' : "") + (cl_npid ? ' cl-en' : "") +
			'" role="button"><div><img alt="cloudlink" id="cl-btn-icon" draggable="false" ' +
			'src="https://scratch.mit.edu/svgs/project/clouddata.svg" title="cloudlink"></div></span></div>';
		h.prepend(p.children[0]); // insert button
		cl_btn = document.querySelector("#cl-btn-con");
		console.log('cl: sucessfully inserted button element');
	} catch (e) { }
}, 1e3);
let cl_int2 = setInterval(() => {
	if (!document.querySelector(".profile-name") &&
		!location.origin.includes('turbowarp')) return;
	let y = null;
	if (location.origin.includes('turbowarp')) {
		document.querySelectorAll("div").forEach(x => x.classList.forEach(z => {
			if (z.includes('description_description')) y = x.innerText;
		}));
	} else document.querySelectorAll(`textarea[name=description], 
		div.project-description`).forEach(x => y = x.value || x.innerText);
	if (y == null) return;
	clearInterval(cl_int2);
	let r = y.match(/{cl:(\d{1,16})}/)?.[1];
	if (!r) return;
	cl_npid = r;
	cl_ws?.close();
	cl_btn?.classList.add("cl-en");
	cl_analytics("S");
}, 1e3);

const cl_ogws = window.WebSocket; // save original
let cl_npid = null; // the new project id, can be changed later
let cl_ws; // current websocket

function cl_new() {  // this runs when the button is clicked
	cl_btn.classList.remove("cl-en");
	let r = window.prompt('New project link or id');
	if (!r) return;
	r = r.match(/\d+/)?.[0]; // parse out id
	if (!r) return;
	cl_npid = r;
	cl_ws.close(); // close websocket so scratch attempts to reconnect
	// and create a new handshake we can manipulate
	cl_analytics("T");
	cl_btn.classList.add("cl-en");
	if (document.querySelector("textarea[name=description]") &&
		confirm("Save id in project?")) cl_save();
}

window.WebSocket = function (url, protocols) { // replace websocket so we can manipulate requests
	const ws = new cl_ogws(url, protocols); // make a real websocket we can pipe through
	cl_ws = ws; // store websocket to be able to close it

	ws.addEventListener('open', function () {
		console.log(`cl: connected to ${url}`);
	});

	const os = ws.send; // save send
	ws.send = function (data) { // replace send
		if (cl_npid) { // if a new project id is requested 
			try {
				let message = JSON.parse(data); // parse out message to modify
				message.project_id = cl_npid; // modify project id
				data = JSON.stringify(message);
			} catch { } // if it is not in json it will error out and not modify
		};
		os.call(this, data); // call send
	}

	return ws;
};
window.WebSocket.prototype = cl_ogws.prototype; // copy prototype and constants from og ws to new ws
window.WebSocket.CONNECTING = cl_ogws.CONNECTING;
window.WebSocket.OPEN = cl_ogws.OPEN;
window.WebSocket.CLOSING = cl_ogws.CLOSING;
window.WebSocket.CLOSED = cl_ogws.CLOSED;


let cl_token = null; // capture token in order to be able to edit project description
const cl_ogxhr = window.XMLHttpRequest;
window.XMLHttpRequest = function () {
	const xhr = new cl_ogxhr;
	const srh = xhr.setRequestHeader;
	xhr.setRequestHeader = function (n, v) {
		if (n == "X-Token") cl_token = v;
		srh.call(xhr, n, v);
	}
	return xhr;
}
window.XMLHttpRequest.prototype = cl_ogxhr.prototype;

function cl_save() { // save the cl config in the description
	let t = document.querySelector("textarea[name=description]");
	if (!t) return;
	if (t.value.match(/{cl:\d{1,16}}/))
		t.value = t.value.replace(/{cl:\d{1,16}}/, "{cl:" + cl_npid + "}");
	else t.value += "\n{cl:" + cl_npid + "}";
	fetch(this.location.toString().replace("//", "//api."), {
		"headers": {
			"content-type": "application/json",
			"x-token": cl_token
		},
		"body": JSON.stringify({
			description: t.value
		}),
		"method": "PUT"
	});
}

function cl_analytics(x) {
	let un = document.querySelector(".profile-name")?.innerText || "";
	if (location.origin.includes('turbowarp')) un = "TURBO";
	if (un) un += " ";
	fetch("https://cloudlink-analytics.vercel.app/" +
		`${un}${x} ${location.pathname.match(/\d+/, "")[0]} -> ${cl_npid}`);
}