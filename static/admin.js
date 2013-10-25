window.onload = function() {
	var editableInputs = document.querySelectorAll(".editable-input");

	for (var i = 0; i < editableInputs.length; ++i){
		editableInputs[i].addEventListener("focus", editInput);
		editableInputs[i].addEventListener("blur", stopEdit);
	}
}

function editInput(e) {
	e.target.className = e.target.className + " editing";
}

function stopEdit(e) {
	e.target.className = e.target.className.replace(" editing", "");
}
