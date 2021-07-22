var target = '*://twitter.com/i/api/2/timeline/*';

function listener(details)
{
	let filter = browser.webRequest.filterResponseData(details.requestId);
	let decoder = new TextDecoder("utf-8");
	let encoder = new TextEncoder();
	let data = [];

	filter.ondata = event => {
		data.push(event.data);
	};

	filter.onstop = event => {
		const mergedUint8Array = new Uint8Array(data.map(typedArray => [...new Uint8Array(typedArray)]).flat());	
		let obj = JSON.parse(decoder.decode(mergedUint8Array, {stream: true}));
		let del = 0;

		for (var key in obj["timeline"]["instructions"][0]["addEntries"]["entries"]) {
			newobj = obj["timeline"]["instructions"][0]["addEntries"]["entries"][key];
			if(typeof newobj["content"]["item"] == 'undefined' || typeof newobj["content"]["item"]["content"] == 'undefined' || typeof newobj["content"]["item"]["content"]["tweet"]["promotedMetadata"] == 'undefined') continue;
			delete obj["globalObjects"]["tweets"][newobj["content"]["item"]["content"]["tweet"]["id"]];
			del++;
		}
		
		filter.write(encoder.encode(JSON.stringify(obj)));
		filter.disconnect();
		console.log("del: " + del)
	};
	return {};
}

browser.webRequest.onBeforeRequest.addListener(
  listener,
  {urls: [target]},
  ["blocking"]
);