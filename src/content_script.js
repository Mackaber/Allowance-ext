// Create the new node you want to insert
let block_node = document.createElement('div');
let shadow_node = block_node.attachShadow({ mode: 'open' });

const get_title = async () => {
  const res = await chrome.storage.sync.get(['title']);
  return res.title ? res.title : 'YOU CAN EDIT THIS MESSAGE, JUST CLICK IT';
}

const AddOverlay = async () => {
  shadow_node.innerHTML = `
  <div id="allowance-extension-overlay"
    style="position: fixed; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 9000001; background-image: -webkit-linear-gradient(bottom, rgb(204, 204, 204) 0%, rgb(255, 255, 255) 75%); padding: 5em 1em 1em; text-align: center; color: rgb(0, 0, 0); font: 16px / 1 sans-serif;">
    <h1 id="allowance-extension-title" contenteditable="true" style="margin: 0px 0px 0.5em;border: none;outline: none;background: none;padding: 0;">${await get_title()}</h1><br />
    <select id="allowance-extension-duration" style="font-size: 2em;">
      <option value="" selected disabled>Select a time range...</option>
      <option value="60000">1 Minute</option>
      <option value="300000">5 Minutes</option>
      <option value="900000">15 Minutes</option>
      <option value="1800000">30 Minutes</option>
    </select>
  </div>
  `;
  document.body.appendChild(block_node);

  shadow_node
    .querySelector("#allowance-extension-duration")
    .addEventListener("change", (event) => {
      shadow_node.getElementById("allowance-extension-overlay").remove();
      setTimeout(() => {
        AddOverlay();
      }, Number(event.target.value));
    });
  
  shadow_node
    .querySelector("#allowance-extension-title")
    .addEventListener("input", (event) => {
      console.log(event.target.innerHTML)
      chrome.storage.sync.set({ title: event.target.innerHTML });
    });
}

AddOverlay();
