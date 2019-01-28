const Entry = require("__webpack_entry__").default;
const { createElement } = require("react");
const { render } = require("react-dom");

window.onload = () => {
  render(
    createElement(Entry),
    document.getElementsByTagName("body")[0].appendChild(
      document.createElement("div")
    )
  )
}
