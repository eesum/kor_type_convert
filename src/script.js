//현재 선택된 변환 옵션 받아오고
//textarea에 변경되는 이벤트리스너 달아서 변경될때마다 위 선택된 옵션에 따라 convert 돌리기

const radioButtons = document.querySelectorAll('.convertRadio');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const resetButton = document.querySelector('.resetButton');

radioButtons.forEach(radio => { radio.addEventListener('change', convertText); });
inputText.addEventListener('input', convertText);
resetButton.addEventListener('click', resetTextBox);

function resetTextBox() {
	inputText.value = '';
	outputText.value = '';
}

function convertText() {
	outputText.value = '';
	const convertOption = document.querySelector('.convertRadio:checked').id;



	outputText.value = convertOption; // 바꿔주기
}