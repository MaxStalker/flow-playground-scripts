var SIDEBAR_CLASSES = ".css-1iue16b, .css-14xc9o";

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    document.body.appendChild(script);
    script.onload = () => {
      console.log("got script file");
      resolve(true);
    };
    script.onerror = reject;
    script.async = false;
    script.src = url;
  });
}

function processNode(node) {
  let text = node.innerText;
  if (text === "") {
    text = node.querySelector("input").value.toLowerCase();
  } else {
    const children = node.querySelectorAll("strong, small");
    const account = children[0].innerText;
    const contractName = children[1].innerText;
    text =
      contractName !== "--" ? contractName : `contract-${account.slice(2, 4)}`;
  }
  return text.replace(" ", "-") + ".cdc";
}

async function exportFiles() {
  console.log("inject files");
  await Promise.all([
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.5.0/jszip.min.js"
    ),
    loadScript(
      "https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js"
    )
  ]);

  let nodesList = document.querySelectorAll(SIDEBAR_CLASSES);

  let fileNames = [];
  for (let i = 0; i < nodesList.length; i++) {
    const node = nodesList[i];
    node.click();
    fileNames.push(processNode(node));
  }

  // Get Monaco models
  // remove first one cause it will be empty
  const models = window.monaco.editor.getModels();

  var zip = new JSZip();
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const modelContent = model.getLinesContent().join("\n");
    const fileName = fileNames[i];
    zip.file(fileName, modelContent);
  }

  // Save everything as ZIP
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "playground.zip");
}

exportFiles();
