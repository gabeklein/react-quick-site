const Entry = require("__webpack_entry__").default;
const { createElement } = require("react");
const { render } = require("react-dom");
const { hot } = require("react-hot-loader");

const HotStuff = hot(module)(Entry);

window.onload = () => {
  render(
    createElement(HotStuff),
    document.getElementsByTagName("body")[0].appendChild(
      document.createElement("div")
    )
  )
}
