import overlayHtml from 'bundle-text:./overlay.html';

const SHADOW_ROOT_ID = 'allowance-shadow-root-c89df1c2-8925-4902-b27d-3d44552907e0';

const get_title = async () => {
  const res = await chrome.storage.sync.get(['title']);
  return res.title ? res.title : 'YOU CAN EDIT THIS MESSAGE, JUST CLICK IT';
}

const AttachShadowRoot = () => {
  //console.log('AttachShadowRoot');
  const block_node = document.getElementById(SHADOW_ROOT_ID);
  const shadow_node = block_node.attachShadow({ mode: 'open' });
  createOverlay(shadow_node);
}

const DettachShadowRoot = () => {
  //console.log('DettachShadowRoot');
  const block_node = document.getElementById(SHADOW_ROOT_ID);
  const clone = block_node.cloneNode(); // Clone the element without the shadow DOM
  clone.id = SHADOW_ROOT_ID;
  block_node.parentNode.replaceChild(clone, block_node)
}

const createOverlay = async (shadow_node) => {
  let html = overlayHtml;
  html = html.replace('${await get_title()}', await get_title());
  shadow_node.innerHTML = html;

  // Set greyscale toggle and filter based on current state or default
  const greyscaleToggle = shadow_node.querySelector("#allowance-toggle-greyscale");
  // Try to restore previous state from storage, fallback to unchecked
  chrome.storage.sync.get(['greyscaleEnabled'], (res) => {
    const enabled = res.greyscaleEnabled ?? false;
    greyscaleToggle.checked = enabled;
    document.body.style.filter = enabled ? 'grayscale(100%)' : '';
  });

  shadow_node
    .querySelector("#allowance-extension-duration")
    .addEventListener("change", (event) => {
      DettachShadowRoot();
      setTimeout(() => {
        AttachShadowRoot();
      }, Number(event.target.value));
    });

  shadow_node
    .querySelector("#allowance-extension-title")
    .addEventListener("input", (event) => {
      console.log(event.target.innerHTML)
      chrome.storage.sync.set({ title: event.target.innerHTML });
    });

  greyscaleToggle
    .addEventListener("change", (event) => {
      // Add greyscale to all elements
      document.body.style.filter = event.target.checked ? 'grayscale(100%)' : '';
      chrome.storage.sync.set({ greyscaleEnabled: event.target.checked });
    })
}

// Create the new node you want to insert
let block_node = document.createElement('div');
block_node.id = SHADOW_ROOT_ID;
if (!document.getElementById(SHADOW_ROOT_ID)) {
  document.body.appendChild(block_node);
  AttachShadowRoot();
}
