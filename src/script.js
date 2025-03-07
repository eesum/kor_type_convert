const radioButtons = document.querySelectorAll('.convertRadio');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const resetButton = document.querySelector('.resetButton');

const sBase = 0xAC00; // 음절 기준점
const lBase = 0x1100; // 초성 기준점
const vBase = 0x1161; // 중성 기준점
const tBase = 0x11A7; // 종성 기준점 (종성이 없는 경우를 고려해 하나 아래로 기준 삼음)

const lCount = 19; // 초성 개수
const vCount = 21; // 중성 개수
const tCount = 28; // 종성 개수 (종성이 없는 0의 경우도 포함)
const nCount = 588; // 중성 * 종성 조합 (한 초성의 전체 경우의 수)
const sCount = 11172; // 초성 * nCount (전체 음절 조합 경우의 수, AC00 ~ D7A3)

// 초성 ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ
// 중성 ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ
// 종성 ''ㄱㄲᆪᆫᆬᆭㄷㄹᆰᆱᆲᆳᆴᆵᆶㅁㅂᆹᆺᆻᆼᆽㅊㅋㅌㅍㅎ

// 영문(초성) rRseEfaqQtTdwWczxvg
// 영문(중성) koiOjpuPhynbml
// 영문(종성) rRseraqtTdwczxvg

radioButtons.forEach(radio => { radio.addEventListener('change', convertText); });
inputText.addEventListener('input', convertText);
resetButton.addEventListener('click', resetTextBox);

function resetTextBox() {
	inputText.value = '';
	outputText.value = '';
}

function convertText() {
	// outputText.value = ''; // 없어도 될지도
	const convertOption = document.querySelector('.convertRadio:checked').id;
	let output;

	if (convertOption === 'korToEng')
		output = korToEng();
	else
		output = engToKor();

	outputText.value = output;
}

function korToEng() {
	const input = inputText.value;
	let result = "";
	let syllable;
	for (let i = 0; i < input.length; i++) {
		syllable = input.codePointAt(i);
		console.log(syllable.toString(16));
		if (syllable >= sBase && syllable < sBase + sCount) {
			console.log(input[i] + ' is 한글 syllable');
		} else if (syllable >= lBase && syllable < lBase + lCount) {
			console.log(input[i] + 'is 한글 초성');
		} else if (syllable >= vBase && syllable < vBase + vCount) {
			console.log(input[i] + 'is 한글 중성');
		} else if (syllable > tBase && syllable < tBase + tCount) {
			console.log(input[i] + 'is 한글 종성');
		} else {
			console.log(input[i] + 'is 한글 아님');
		}
	}
	return result;
}

function engToKor() {
	const input = inputText.value;
	return input;
}