const radioButtons = document.querySelectorAll('.convertRadio');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const resetButton = document.querySelector('.resetButton');

const sBase = 0xAC00; // 음절 기준점
// const lBase = 0x1100; // 초성 기준점
// const vBase = 0x1161; // 중성 기준점
// const tBase = 0x11A7; // 종성 기준점 (종성이 없는 경우를 고려해 하나 아래로 기준 삼음)

const lCount = 19; // 초성 개수
const vCount = 21; // 중성 개수
const tCount = 28; // 종성 개수 (종성이 없는 0의 경우도 포함)
const nCount = 588; // 중성 * 종성 조합 (한 초성의 전체 경우의 수)
const sCount = 11172; // 초성 * nCount (전체 음절 조합 경우의 수, AC00 ~ D7A3)

const lList = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const vList = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";
const tList = "ㄱㄲᆪㄴᆬᆭㄷㄹᆰᆱᆲᆳᆴᆵᆶㅁㅂᆹㅅㅆㅇㅈㅊㅋㅌㅍㅎ";

// 어차피 index를 구하기 때문에 유니코드 자체가 중요하지 않음
const korKey = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎㅏㅐㅑㅒㅓㅔㅕㅖㅗㅛㅜㅠㅡㅣ";
const engKey = "rRseEfaqQtTdwWczxvgkoiOjpuPhynbml";

radioButtons.forEach(radio => { radio.addEventListener('change', convertText); });
inputText.addEventListener('input', convertText);
resetButton.addEventListener('click', resetTextBox);

function resetTextBox() {
	inputText.value = '';
	outputText.value = '';
}

function convertText() {
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

		let decomp = [-1, -1, -1, -1, -1];
		let lIndex = lList.indexOf(input[i]);
		let vIndex = vList.indexOf(input[i]);
		let tIndex = tList.indexOf(input[i]);
		console.log(lIndex, vIndex, tIndex);

		if (syllable >= sBase && syllable < sBase + sCount) {
			console.log(input[i] + ' is 한글 syllable');
			//몇번째 음절인가
			syllable -= sBase;
			//lindex 구하고
			decomp[0] = Math.floor(syllable / nCount);
			//vIndex 구하고
			decomp[1] = Math.floor((syllable % nCount) / tCount);
			//tIndex 구하고 -> 0이면 없는 거니까 index 계산 시 1 빼줘야 함
			decomp[3] = (syllable % tCount) - 1;
			console.log(decomp[3]);
			if (!decomp[3]) { decomp[3] = -1; }
		} else if (lIndex > -1) {
			console.log(input[i] + ' is 한글 초성');
			decomp[0] = lIndex;
		} else if (vIndex > -1) {
			console.log(input[i] + ' is 한글 중성');
			decomp[1] = vIndex;
		} else if (tIndex > -1) {
			console.log(input[i] + ' is 한글 종성');
			decomp[3] = tIndex;
		} else {
			console.log(input[i] + ' is 한글 아님');
			result += input[i];
			continue;
		}

		decomposeToCompatVowel(decomp);
		decomposeToCompatTrail(decomp);
		result += mapToKey(decomp);
	}
	return result;
}

function decomposeToCompatVowel(decomp) {
	if (decomp[1] === 9) {
		//ㅘ
		decomp[1] = 8;
		decomp[2] = 0;
	} else if (decomp[1] === 10) {
		//ㅙ
		decomp[1] = 8;
		decomp[2] = 1;
	} else if (decomp[1] === 11) {
		//ㅚ
		decomp[1] = 8;
		decomp[2] = 20;
	} else if (decomp[1] === 14) {
		//ㅝ
		decomp[1] = 13;
		decomp[2] = 4;
	} else if (decomp[1] === 15) {
		//ㅞ
		decomp[1] = 13;
		decomp[2] = 5;
	} else if (decomp[1] === 16) {
		//ㅟ
		decomp[1] = 13;
		decomp[2] = 20;
	} else if (decomp[1] === 19) {
		//ㅢ
		decomp[1] = 18;
		decomp[2] = 20;
	}
}

function decomposeToCompatTrail(decomp) {
	if (decomp[3] === 2) {
		//ᆪ
		decomp[3] = 0;
		decomp[4] = 18;
	} else if (decomp[3] === 4) {
		//ᆬ
		decomp[3] = 3;
		decomp[4] = 21;
	} else if (decomp[3] === 5) {
		//ᆭ
		decomp[3] = 3;
		decomp[4] = 20;
	} else if (decomp[3] === 8) {
		//ᆰ
		decomp[3] = 7;
		decomp[4] = 4;
	} else if (decomp[3] === 9) {
		//ᆱ
		decomp[3] = 7;
		decomp[4] = 15;
	} else if (decomp[3] === 10) {
		//ᆲ
		decomp[3] = 7;
		decomp[4] = 16;
	} else if (decomp[3] === 11) {
		//ᆳ
		decomp[3] = 7;
		decomp[4] = 18;
	} else if (decomp[3] === 12) {
		//ᆴ
		decomp[3] = 7;
		decomp[4] = 24;
	} else if (decomp[3] === 13) {
		//ᆵ
		decomp[3] = 7;
		decomp[4] = 25;
	} else if (decomp[3] === 14) {
		//ᆶ
		decomp[3] = 7;
		decomp[4] = 26;
	} else if (decomp[3] === 17) {
		//ᆹ
		decomp[3] = 16;
		decomp[4] = 18;
	}
}

function mapToKey(decomp) {
	let result = "";
	for (let i = 0; i < decomp.length; i++) {
		if (decomp[i] > -1) {
			if (i === 0) {
				console.log(decomp[i], lList[decomp[i]]);
				decomp[i] = korKey.indexOf(lList[decomp[i]]);
			}
			else if (i > 0 && i < 3) {
				console.log(decomp[i], vList[decomp[i]]);
				decomp[i] = korKey.indexOf(vList[decomp[i]]);
			}
			else {
				console.log(decomp[i], tList[decomp[i]]);
				decomp[i] = korKey.indexOf(tList[decomp[i]]);

				console.log(decomp[i]);
			}
			result += engKey[decomp[i]];
		}
	}
	return result;
}

function engToKor() {
	const input = inputText.value;
	let result = "";
	for (let i = 0; i < input.length; i++) {
		let engIndex = engKey.indexOf(input[i]);
		if (engIndex > -1)
			result += korKey[engKey.indexOf(input[i])];
		else
			result += input[i];
	}
	console.log(result);

	return result;
}