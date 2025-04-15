import overlayHtml from 'bundle-text:./overlay.html';

const SHADOW_ROOT_ID = 'allowance-shadow-root-c89df1c2-8925-4902-b27d-3d44552907e0';

const get_title = async () => {
  const res = await chrome.storage.sync.get(['title']);
  return res.title ? res.title : 'YOU CAN EDIT THIS MESSAGE, JUST CLICK IT';
}

// Helper to check if a timestamp is from today
const isToday = (timestamp) => {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
};

// Main entry: only attach overlay if not disabled for today
chrome.storage.sync.get(['disabledForToday'], (res) => {
  if (isToday(res.disabledForToday)) {
    // Disabled for today, do nothing
    return;
  }
  // Create the new node you want to insert
  let block_node = document.createElement('div');
  block_node.id = SHADOW_ROOT_ID;
  if (!document.getElementById(SHADOW_ROOT_ID)) {
    document.body.appendChild(block_node);
    AttachShadowRoot();
  }
});

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

  // Add event for "Disable for today" button
  const disableBtn = shadow_node.querySelector("#allowance-disable-today-btn");
  if (disableBtn) {
    disableBtn.addEventListener("click", () => {
      // Show confirmation modal
      const modal = document.createElement('div');
      modal.style = `
        position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.4); z-index: 9999999; display: flex; align-items: center; justify-content: center;
      `;
      modal.innerHTML = `
        <div style="background: white; padding: 2em; border-radius: 8px; box-shadow: 0 2px 8px #0003; text-align: center; color: #000;">
          <div style="margin-bottom: 1em; color: #000;">Are you sure you want to disable for today?</div>
          <button id="allowance-confirm-disable" style="margin-right:1em; color: #000;">Yes</button>
          <button id="allowance-cancel-disable" style="color: #000;">No</button>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector("#allowance-confirm-disable").onclick = () => {
        chrome.storage.sync.set({ disabledForToday: Date.now() }, () => {
          // Remove overlay and modal
          DettachShadowRoot();
          modal.remove();
        });
      };
      modal.querySelector("#allowance-cancel-disable").onclick = () => {
        modal.remove();
      };
    });
  }

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
