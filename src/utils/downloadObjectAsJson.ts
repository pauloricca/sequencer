import { saveAs } from 'file-saver';

const downloadObjectAsJson = (exportObj: any, exportName: string) => {
	// const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
	// const downloadAnchorNode = document.createElement('a');
	// downloadAnchorNode.setAttribute("href",     dataStr);
	// downloadAnchorNode.setAttribute("download", exportName + ".json");
	// document.body.appendChild(downloadAnchorNode); // required for firefox
	// downloadAnchorNode.click();
	// downloadAnchorNode.remove();
	var blob = new Blob([encodeURIComponent(JSON.stringify(exportObj, null, 2))], {type: "data:text/json;charset=utf-8"});
	saveAs(blob, exportName + ".json");
}

export default downloadObjectAsJson;