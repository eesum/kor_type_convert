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
radioButtons.forEach(radio => { radio.addEventListener('change', changePlaceholder); });
inputText.addEventListener('input', convertText);
resetButton.addEventListener('click', resetTextBox);

function changePlaceholder() {
	const convertOption = document.querySelector('.convertRadio:checked').id;

	if (convertOption === 'korToEng')
		inputText.placeholder = "해ㅐㅇ ㅡㅐ구ㅑㅜㅎ";
	else
		inputText.placeholder = "dkssudgktpdy";
}

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
			//lIndex 구하고
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

	let lvt = { l: -1, v: -1, t: -1 };

	for (let i = 0; i < input.length; i++) {
		let keyIndex = engKey.indexOf(input[i]);
		console.log(keyIndex);
		let char = korKey[keyIndex];
		if (keyIndex == -1) {
			//현재 상태에서 한번 구워주고 초기화
			result += composeAndPrint(lvt);
			result += input[i];
		} else if (keyIndex < 19) { // 자음
			tempL = lList.indexOf(char);
			console.log('lIndex: ' + tempL);
			if (lvt.l == -1) {
				if (lvt.v == -1) {
					// -1,-1,-1
					lvt.l = tempL;
				} else {
					// v
					// 한번 구워주고 초기화
					result += composeAndPrint(lvt);
					lvt.l = tempL;
				}
			} else if (lvt.v == -1) {
				// l
				// 기존 걸로 구워주고 초기화
				result += composeAndPrint(lvt);
				// l 남기기
				lvt.l = tempL;
			} else if (lvt.t == -1) {
				// lv
				// t가 될 수 있나
				// 있으면 넣고
				// 아니면 구워주고 초기화
				// l 남기기
				let tempT = tList.indexOf(char);
				if (tempT > -1)
					lvt.t = tempT;
				else {
					result += composeAndPrint(lvt);
					lvt.l = tempL;
				}
			} else {
				// lvt
				// 기존 t와 연결되나 (ㄱ0-ㅅ18,ㄴ3-ㅈ21/ㅎ26,ㄹ7-ㄱ0/ㅁ15/ㅂ16/ㅅ18/ㅌ24/ㅍ25/ㅎ26,ㅂ16-ㅅ18)
				// 2, 4, 5, 8, 9, 10, 11, 12, 13, 14, 17
				let tempT = tList.indexOf(char);
				if (lvt.t == 0 && tempT == 18) {
					lvt.t = 2;
				} //ㄱㅅ
				else if (lvt.t == 3 && tempT == 21) {
					lvt.t = 4;
				}  //ㄴㅈ
				else if (lvt.t == 3 && tempT == 26) {
					lvt.t = 5;
				}  //ㄴㅎ
				else if (lvt.t == 7 && tempT == 0) {
					lvt.t = 8;
				}   //ㄹㄱ
				else if (lvt.t == 7 && tempT == 15) {
					lvt.t = 9;
				}  //ㄹㅁ
				else if (lvt.t == 7 && tempT == 16) {
					lvt.t = 10;
				}  //ㄹㅂ
				else if (lvt.t == 7 && tempT == 18) {
					lvt.t = 11;
				}  //ㄹㅅ
				else if (lvt.t == 7 && tempT == 24) {
					lvt.t = 12;
				}  //ㄹㅌ
				else if (lvt.t == 7 && tempT == 25) {
					lvt.t = 13;
				}  //ㄹㅍ
				else if (lvt.t == 7 && tempT == 26) {
					lvt.t = 14;
				}  //ㄹㅎ
				else if (lvt.t == 16 && tempT == 18) {
					lvt.t = 17;
				}  //ㅂㅅ
				else {
					result += composeAndPrint(lvt);
					lvt.l = lList.indexOf(tList[tempT]);
				}
				// 되면 lvtt
				// 안되면 구워주고 초기화
				// l로 남기기
			}
		} else { // 모음
			tempV = vList.indexOf(char);
			if (lvt.l == -1) {
				if (lvt.v == -1) {
					// -1,-1,-1
					// v남기기
					lvt.v = tempV;
				} else {
					// v
					// vv 연결되나 (ㅗ8-ㅏ0/ㅐ1/ㅣ20, ㅜ13-ㅓ4/ㅔ5/ㅣ20, ㅡ18-ㅣ20)
					let vLeft = 0;
					if (lvt.v == 8 && tempV == 0)
						lvt.v = 9;
					else if (lvt.v == 8 && tempV == 1)
						lvt.v = 10;
					else if (lvt.v == 8 && tempV == 20)
						lvt.v = 11;
					else if (lvt.v == 13 && tempV == 4)
						lvt.v = 14;
					else if (lvt.v == 13 && tempV == 5)
						lvt.v = 15;
					else if (lvt.v == 13 && tempV == 20)
						lvt.v = 16;
					else if (lvt.v == 18 && tempV == 20)
						lvt.v = 19;
					else
						vLeft = 1;
					// 되면 구워주고 초기화
					// 안되면 구워주고 초기화
					// 새 v 남기기
					result += composeAndPrint(lvt);
					if (vLeft == 1) {
						lvt.v = tempV;
					}
				}
			} else if (lvt.v == -1) {
				// l
				lvt.v = tempV;
			} else if (lvt.t == -1) {
				// lv
				// vv 연결되나
				if (lvt.v == 8 && tempV == 0)
					lvt.v = 9;
				else if (lvt.v == 8 && tempV == 1)
					lvt.v = 10;
				else if (lvt.v == 8 && tempV == 20)
					lvt.v = 11;
				else if (lvt.v == 13 && tempV == 4)
					lvt.v = 14;
				else if (lvt.v == 13 && tempV == 5)
					lvt.v = 15;
				else if (lvt.v == 13 && tempV == 20)
					lvt.v = 16;
				else if (lvt.v == 18 && tempV == 20)
					lvt.v = 19;
				else {
					result += composeAndPrint(lvt);
					lvt.v = tempV;
				}
				// 되면 lvv 남기고
				// 안되면 lv 구워주고 초기화
				// 새 v남기기
			} else {
				// lvt
				// tt로 분해되나 (ㄱ0-ㅅ18,ㄴ3-ㅈ21/ㅎ26,ㄹ7-ㄱ0/ㅁ15/ㅂ16/ㅅ18/ㅌ24/ㅍ25/ㅎ26,ㅂ16-ㅅ18)
				// ㄱㅅ2, ㄴㅈ4, ㄴㅎ5, ㄹㄱ8, ㄹㅁ9, ㄹㅂ10, ㄹㅅ11, ㄹㅌ12, ㄹㅍ13, ㄹㅎ14, ㅂㅅ17
				let tempL;
				if (lvt.t == 2) { //ㄱㅅ
					lvt.t = 0;
					tempL = 18;
				} else if (lvt.t == 4) { //ㄴㅈ
					lvt.t = 3;
					tempL = 21;
				} else if (lvt.t == 5) { //ㄴㅎ
					lvt.t = 3;
					tempL = 26;
				} else if (lvt.t == 8) { //ㄹㄱ
					lvt.t = 7;
					tempL = 0;
				} else if (lvt.t == 9) { //ㄹㅁ
					lvt.t = 7;
					tempL = 15;
				} else if (lvt.t == 10) { //ㄹㅂ
					lvt.t = 7;
					tempL = 16;
				} else if (lvt.t == 11) { //ㄹㅅ
					lvt.t = 7;
					tempL = 18;
				} else if (lvt.t == 12) { //ㄹㅌ
					lvt.t = 7;
					tempL = 24;
				} else if (lvt.t == 13) { //ㄹㅍ
					lvt.t = 7;
					tempL = 25;
				} else if (lvt.t == 14) { //ㄹㅎ
					lvt.t = 7;
					tempL = 26;
				} else if (lvt.t == 17) { //ㅂㅅ
					tempL = 18;
					lvt.t = 16;
				} else {
					tempL = lvt.t;
					lvt.t = -1;
				}
				result += composeAndPrint(lvt);
				lvt.l = lList.indexOf(tList[tempL]);
				lvt.v = tempV;


				// 분해되면 lvt 구워주고 초기화
				// lv남기기
				// 분해 안되면 lv 구워주고 초기화
				// lv 남기기
			}
		}


	}
	result += composeAndPrint(lvt);
	console.log(result);
	return result;
}

function composeAndPrint(lvt) {
	let result = "";
	console.log('compose ' + lvt.l, lvt.v, lvt.t);
	if (lvt.l > -1 && lvt.v > -1) {
		let syllable = sBase + (lvt.l * nCount) + (lvt.v * tCount) + lvt.t + 1;
		console.log('syllable code: ' + syllable);
		result = String.fromCodePoint(syllable);
	} else if (lvt.l > -1 && lvt.v == -1) {
		console.log('only l: ' + lvt.l);
		result = lList[lvt.l];
	} else if (lvt.l == -1 && lvt.v > -1) {
		console.log('only v: ' + lvt.v);
		result = vList[lvt.v];
	}

	lvt.l = -1;
	lvt.v = -1;
	lvt.t = -1;

	// console.log('reset after compose ' + lvt.l, lvt.v, lvt.t);
	return result;
}