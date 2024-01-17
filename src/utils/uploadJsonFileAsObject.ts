import { Buffer } from "buffer";

const uploadJsonFileAsObject = (loadCallback: (obj: any) => void) => {
  const fileInputNode = document.createElement("input");
  fileInputNode.setAttribute("type", "file");
  fileInputNode.setAttribute("id", "file-input");
  fileInputNode.style.display = "none";
  document.body.appendChild(fileInputNode); // required for firefox

  fileInputNode.addEventListener("change", (e) => {
    fileInputNode.remove();

    if (!e.target) return;

    const files = (e.target as any).files;

    if (files.length < 1) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const match = /^data:(.*);base64,(.*)$/.exec((e.target as any).result);
	
      if (match === null) throw "Could not parse result";

      const content = JSON.parse(Buffer.from(match[2], "base64").toString());

      loadCallback(content);
    };
	
    reader.readAsDataURL(file);
  });

  fileInputNode.click();
};

export default uploadJsonFileAsObject;
