import { useState } from 'react';
import './App.css';

function App() {
  // 사용자가 input에 입력한 문자열을 저장하는 state!
  const [inputText, setInputText] = useState('');

  // Node.js 서버가 응답으로 보내준 메시지를 저장하는 state
  const [serverMessage, setServerMessage] = useState('');

  // 서버가 다시 돌려준 입력 문자열을 저장하는 state
  const [receivedText, setReceivedText] = useState('');

  // 서버 요청이 진행 중인지 확인하는 state
  // true면 요청 중, false면 요청 중 아님
  const [loading, setLoading] = useState(false);

  // 서버 요청 중 발생한 에러 메시지를 저장하는 state
  const [errorMessage, setErrorMessage] = useState('');

  // 버튼을 클릭했을 때 실행되는 함수
  // inputText 값을 Node.js 서버의 /api/main 엔드포인트로 전송한다
  async function sendDataToServer() {
    try {
      // 서버 요청 시작
      setLoading(true);

      // 이전에 남아 있던 에러 메시지 초기화
      setErrorMessage('');

      // 이전에 남아 있던 서버 응답 메시지 초기화
      setServerMessage('');

      // 이전에 남아 있던 서버가 받은 값 초기화
      setReceivedText('');

      // Node.js 서버로 POST 요청 전송
      const response = await fetch('http://localhost:4000/api/main', {
        // 데이터를 서버로 보낼 때는 POST 사용
        method: 'POST',

        // 보내는 데이터가 JSON 형식임을 서버에 알려줌
        headers: {
          'Content-Type': 'application/json',
        },

        // 서버로 보낼 실제 데이터
        // JavaScript 객체를 JSON 문자열로 변환해서 전송
        body: JSON.stringify({
          text: inputText,
        }),
      });

      // 서버 응답이 실패 상태이면 에러 발생
      // 예: 400, 404, 500 등
      if (!response.ok) {
        throw new Error('서버 요청에 실패했습니다.');
      }

      // 서버에서 받은 JSON 응답을 JavaScript 객체로 변환
      const data = await response.json();

      // 서버 응답의 message 값을 state에 저장
      // 저장되면 화면이 자동으로 다시 렌더링됨
      setServerMessage(data.message);
      console.log("성공했습니다");

      // 서버 응답의 receivedText 값을 state에 저장
      setReceivedText(data.receivedText);
    } catch (error) {
      // 요청 중 에러가 발생하면 에러 메시지를 state에 저장
      setErrorMessage(error.message);
    } finally {
      // 요청 성공/실패와 관계없이 로딩 상태 종료
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <main>
        {/* 화면 제목 */}
        <h1>React → Node.js 데이터 전송</h1>

        {/* 문자열 입력 및 전송 영역 */}
        <section>
          {/* input과 연결된 라벨 */}
          <label htmlFor="text-input">보낼 문자열</label>

          {/* 사용자가 서버로 보낼 문자열을 입력하는 input */}
          <input
            id="text-input"
            type="text"

            // input의 현재 값은 inputText state와 연결됨
            value={inputText}

            // 사용자가 입력할 때마다 inputText state를 업데이트
            onChange={(event) => setInputText(event.target.value)}

            // input이 비어 있을 때 보여줄 안내 문구
            placeholder="서버로 보낼 문자열을 입력하세요"
          />

          {/* 서버로 데이터를 보내는 버튼 */}
          <button
            type="button"

            // 버튼 클릭 시 sendDataToServer 함수 실행
            onClick={sendDataToServer}

            // 서버 요청 중에는 버튼 비활성화
            disabled={loading}
          >
            {/* loading 상태에 따라 버튼 문구 변경 */}
            {loading ? '전송 중...' : '서버로 보내기'}
          </button>
        </section>

        {/* errorMessage가 있을 때만 에러 영역 표시 */}
        {errorMessage && (
          <section>
            <h2>에러</h2>
            <p>{errorMessage}</p>
          </section>
        )}

        {/* serverMessage가 있을 때만 서버 응답 영역 표시 */}
        {serverMessage && (
          <section>
            <h2>서버 응답</h2>

            {/* 서버에서 받은 응답 메시지 */}
            <p>{serverMessage}</p>

            {/* 서버가 받은 문자열을 다시 화면에 표시 */}
            <p>서버가 받은 값: {receivedText}</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;