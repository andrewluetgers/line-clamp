
var strCache = {},
	WHITESPACE_REGEX = /(?=\s)/,
	TRAILING_WHITESPACE_REGEX = /\s+$/;


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
	
	truncateByWord(element, maxHeight);
	truncateByCharacter(element, maxHeight, ellipsis);
};


// Truncate the text of element such that it does not exceed the maxHeight.
// Return true if we need to truncate by character, else return false
function truncateByWord(element, maxHeight) {
	var innerHTML = element.innerHTML;
	
	// Split the text of `element` by whitespace.
	var chunks = innerHTML.split(WHITESPACE_REGEX);
	
	// The text does not contain whitespace; we need to attempt to truncate
	// by character.
	if (chunks.length === 1) {
		return true;
	}
	
	// Loop over the chunks, and try to fit more chunks into the `element`.
	var i = -1;
	var length = chunks.length;
	var newInnerHTML = '';
	// todo binary search instead
	while (++i < length) {
		newInnerHTML += chunks[i];
		element.innerHTML = newInnerHTML;
		
		// If the new height now exceeds the maxHeight (where it did not
		// in the previous iteration), we know that we are at most one line
		// over the optimal text length.
		if (element.offsetHeight > maxHeight) {
			return true;
		}
	}
	
	return false;
}

// Append ellip to element, trimming off trailing characters
// in element such that element will not exceed the maxHeight.
function truncateByCharacter(element, maxHeight, ellip) {
	var innerHTML = element.innerHTML;
	var length = innerHTML.length;
	
	// brute force sequential trim + height test
	// todo binary search instead
	while (length > 0) {
		element.innerHTML = innerHTML.substring(0, length).replace(TRAILING_WHITESPACE_REGEX, '') + ellip;
		if (element.offsetHeight <= maxHeight) {
			return;
		}
		length--;
	}
}