// cloudlink v1.1
// geodebreaker 2025 
// MIT licence

let cl_int = setInterval(() => { // repeditivley try to insert button since it takes time to load
  try {
    if (document.querySelector('#cl-btn-con')) return;
    let h = document.querySelectorAll("div"); // loop through all divs to find the element with the specific class 
    h.forEach(x => x.classList.forEach(y => { // since react adds a random 5 chars at the end
      if (y.includes('stage-header_stage-size-row')
        || y.includes('stage-header_fullscreen-buttons-row')
        || y.includes('stage-header_unselect-wrapper')) h = x;
    }));
    if (h.length) return;
    let p = document.createElement('p'); // create button
    p.innerHTML = '<div id="cl-outer-btn" onclick="cl_new()"><span id="cl-btn-con" ' +
      (location.origin.includes('turbowarp') ? 'class="cl-tw"' : "") +
      'role="button"><div><img alt="cloudlink" id="cl-btn-icon" draggable="false" ' +
      'src="https://scratch.mit.edu/svgs/project/clouddata.svg" title="cloudlink"></div></span></div>';
    h.prepend(p.children[0]); // insert button
    console.log('cl: sucessfully inserted button element');
  } catch (e) { }
}, 1e3);

const cl_ogws = window.WebSocket; // save original
let cl_npid = null; // the new project id, can be changed later
let cl_ws; // current websocket

function cl_new() {  // this runs when the button is clicked
  let r = window.prompt('New project link or id'); // ask user
  if (!r) return;
  r = r.match(/\d+/)?.[0]; // parse out id
  if (!r) return;
  cl_npid = r;
  cl_ws.close(); // close websocket so it reconnects and creates a new handshake we can manipulate
}

window.WebSocket = function (url, protocols) { // replace websocket so we can manipulate requests
  let ws = new cl_ogws(url, protocols); // make a real websocket we can pipe through
  cl_ws = ws; // store websocket to be able to close it

  ws.addEventListener('open', function () {
    console.log(`cl: connected to ${url}`);
  });

  const os = ws.send; // save send
  ws.send = function (data) { // replace send
    try {
      let message = JSON.parse(data); // parse out message to modify

      if (cl_npid) {
        message.project_id = cl_npid; // modify project id if a new one is requested
      }

      data = JSON.stringify(message);
    } catch (e) { } // if it is not in json it will error out and not modify

    os.call(this, data); // call send
  };

  return ws;
};

window.WebSocket.prototype = cl_ogws.prototype; // copy prototype and constants from og ws to new ws
window.WebSocket.CONNECTING = cl_ogws.CONNECTING;
window.WebSocket.OPEN = cl_ogws.OPEN;
window.WebSocket.CLOSING = cl_ogws.CLOSING;
window.WebSocket.CLOSED = cl_ogws.CLOSED;