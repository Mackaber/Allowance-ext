console.log("Executing in: ", window.location.href);  

let current_time

// Create the new node you want to insert
let block_node = document.createElement('div');


const AddOverlay = () => {
  block_node.innerHTML = `
  <div id="allowance-extension-overlay"
    style="position: fixed; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 9000001; background-image: -webkit-linear-gradient(bottom, rgb(204, 204, 204) 0%, rgb(255, 255, 255) 75%); padding: 5em 1em 1em; text-align: center; color: rgb(0, 0, 0); font: 16px / 1 sans-serif;">
    <img src="https://mackaber.me/testfiles/Pinkie_Pie_transparent.png" style="margin-bottom: 1em;width:200px;"><br />
    <h1 style="margin: 0px 0px 0.5em;">Los hábitos no empiezan desde cero... </h1><br />
    <select id="allowance-extension-duration">
      <option value="" selected disabled>Selecciona un rango de tiempo</option>
      <option value="60000">1 Minute</option>
      <option value="300000">5 Minutes</option>
      <option value="900000">15 Minutes</option>
      <option value="1800000">30 Minutes</option>
    </select>
  </div>
  `;
  document.body.appendChild(block_node);

  block_node
    .querySelector("#allowance-extension-duration")
    .addEventListener("change", (event) => {
      document.getElementById("allowance-extension-overlay").remove();
      //current_time = new Date();
      console.log("Overlay closed at: ", current_time);

      // 10 seconds interval
      setTimeout(() => {
        console.log("Adding overlay at: ", new Date());
        AddOverlay();
      }, Number(event.target.value));
    });
}

AddOverlay();

// Add click event listener to the new node

