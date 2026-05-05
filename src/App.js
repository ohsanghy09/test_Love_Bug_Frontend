import { useState } from 'react';
import './App.css';

function App() {
  // 사용자가 입력한 문자열
  const [inputText, setInputText] = useState('');

  // 사용자가 업로드한 이미지 파일
  const [imageFile, setImageFile] = useState(null);

  // 서버 응답 메시지
  const [serverMessage, setServerMessage] = useState('');

  // 로딩 상태
  const [loading, setLoading] = useState(false);

  // 에러 메시지
  const [errorMessage, setErrorMessage] = useState('');

  // 이미지 파일을 Base64 문자열로 변환하는 함수
  function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(new Error('이미지 변환에 실패했습니다.'));
      };

      reader.readAsDataURL(file);
    });
  }

  // 버튼 클릭 시 서버로 데이터 전송
  async function sendDataToServer() {
    try {
      setLoading(true);
      setErrorMessage('');
      setServerMessage('');

      if (!imageFile) {
        throw new Error('이미지를 업로드해주세요.');
      }

      const imageBase64 = await convertImageToBase64(imageFile);

      const requestData = {
        text: inputText,
        image: {
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size,
          data: imageBase64,
        },
      };

      const response = await fetch('http://localhost:4000/api/main', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('서버 요청에 실패했습니다.');
      }

      const data = await response.json();

      // 서버에서 받은 값은 message 하나만 사용
      setServerMessage(data.message);

      console.log(data.message);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <main>
        <h1>React → Node.js 문자열 + 이미지 전송</h1>

        <section>
          <label htmlFor="text-input">보낼 문자열</label>

          <input
            id="text-input"
            type="text"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="서버로 보낼 문자열을 입력하세요"
          />

          <label htmlFor="image-input">업로드할 이미지</label>

          <input
            id="image-input"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files[0];

              if (file) {
                setImageFile(file);
              }
            }}
          />

          {imageFile && <p>선택된 이미지: {imageFile.name}</p>}

          <button
            type="button"
            onClick={sendDataToServer}
            disabled={loading}
          >
            {loading ? '전송 중...' : '서버로 보내기'}
          </button>
        </section>

        {errorMessage && (
          <section>
            <h2>에러</h2>
            <p>{errorMessage}</p>
          </section>
        )}

        {serverMessage && (
          <section>
            <h2>서버 응답</h2>
            <p>{serverMessage}</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;