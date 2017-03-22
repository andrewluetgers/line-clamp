

var strCache = {},
	trailingWhitespace = /\s+$/;

module.exports = function (element, lines, ellip) {
	
	var lineCount 		= lines	|| 1,
		ellipsis	 	= ellip	|| '…',
		lineHeight 		= parseInt(window.getComputedStyle(element).lineHeight, 10),
		maxHeight 		= lineCount * lineHeight,
		cacheId 		= element.id || "",
		inPlaceStr 		= element.innerHTML || "",
		cacheInvalid 	= cacheId && !inPlaceStr.match(ellipsis+"$"),
		cacheStr 		= cacheInvalid ? inPlaceStr : (strCache[cacheId] || "");
	
	// set / update cache
	// retain original strings for repeated uses such as when the container width
	// or height changes and a new truncation needs to be calculated
	if (cacheId) {
		strCache[cacheId] = cacheStr;
		
		if (inPlaceStr != cacheStr) {
			element.innerHTML = cacheStr;
		}
	}
	
	// Exit if text does not overflow the element.
	if (element.scrollHeight <= maxHeight) {
		return;
	}
	
	truncate(element, maxHeight, ellipsis);
};


function truncStr(str, len, ellipsis) {
	return str.split("").slice(0, len).join("").replace(trailingWhitespace, '') + ellipsis;
}

// Truncate at the first character that causes the
// wrapping of the text inside of element to exceed the maxHeight
// modified binary search based string truncation
// based on http://rosettacode.org/wiki/Binary_search#JavaScript
function truncate(el, maxHeight, ellipsis) {
	var str 	= el.innerHTML,
		hi 		= str.length - 1,
		mid 	= 0,
		lo 		= 0,
		height 	= 0,
		newStr 	= "",
		prevStr = "",
		last	= false;
	
	while (lo <= hi || height > maxHeight) {
		mid 	= Math.floor((lo + hi) / 2); 			// calc a new truncation point
		prevStr	= newStr;								// to test length change
		newStr 	= truncStr(str, mid, ellipsis);			// apply truncation
		last	= !(newStr.length - prevStr.length); 	// finished when no change to length
		el.innerHTML = newStr;							// update the dom w/ truncated str
		height = el.offsetHeight;						// get new height
		
		if (height > maxHeight) { 	// text wraps past max height
			hi = mid - 1;			// so move upper bound down
			
		} else if (!last) {			// not the last character before next wrap
			lo = mid + 1;			// so move the lower bound up
			
		} else {
			return;					// quit loop we done
		}
	}
}