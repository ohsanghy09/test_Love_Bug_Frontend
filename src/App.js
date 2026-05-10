import { useState } from "react";

function App() {

  // 이미지 상태 저장 변수
  const [imageFile, setImageFile] = useState(null);

  // 이미지 URL 상태 저장 변수
  const [previewUrl, setPreviewUrl] = useState("");

  // 백엔드에서 결과 상태 저장 변수
  const [result, setResult] = useState(null);

  // 로딩 상태 저장 변수
  const [loading, setLoading] = useState(false);

  // 에러 메시지 상태 저장 변수
  const [errorMessage, setErrorMessage] = useState("");

  // 백엔드 API_URL
  const API_URL = "https://test-love-bug-out-backend.onrender.com/api/pest/analyze";


  // 이미지 업로드 함수
  const handleImageChange = (event) => {

    // 선택된 이미지 file로 가져오기
    const file = event.target.files[0];

    // file이 없으면 함수 종료
    if (!file) {
      return;
    }

    // 만약 파일의 이름이 image가 아닌 걸로 시작하면 실행
    if (!file.type.startsWith("image/")) {

      // 에러메시지 상태 변환
      setErrorMessage("이미지 파일만 업로드할 수 있습니다.");

      // 이미지 파일 제거
      setImageFile(null);

      // 이미지 URL 제거
      setPreviewUrl("");

      // 함수 종료
      return;
    }


// 만약 image값이 정상이면

    //  imageFile에 상태 저장 -> 백엔드로 보내주기 위함
    setImageFile(file);

    // URl을 내부 URL로 바꿔서 저장(src) -> 화면 표시
    setPreviewUrl(URL.createObjectURL(file));

    // 결과 상태 저장 함수 null -> 새로 사진 올렸으니까 이전 결과 제거
    setResult(null);

    // 이전 에러메시지 제거
    setErrorMessage("");
  };


  // 분석하기 함수 (async로 비동기 설정)
  const handleAnalyze = async () => {

    // 만약 imgeFile 상태 저장 함수에 아무 값이 없으면
    if (!imageFile) {

      // errorMessage 상태 저장 값 변경
      setErrorMessage("분석할 이미지를 선택해주세요.");

      // 함수 종료
      return;
    }

    // 일단 실행
    try {

      // loading 상태 저장 변수 true로 변환
      setLoading(true);

      // 에러메시지 초기화
      setErrorMessage("");

      // 이전 백엔드 결과 초기화
      setResult(null);

      // 백엔드로 데이터를 보내기 위한 객체 생성
      const formData = new FormData();

      // 백엔드의 image와 같은 이름으로 imageFile 상태 저장
      formData.append("image", imageFile);

      // 비동기로 API_URL에 formData를 body에 싫어 보냄(POST) -> 결과 response로 받음
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      // 백엔드 결과값 json으로 변환 -> 실제로 사용하기 위한 용도
      const data = await response.json();

      // response ok(true)이 아니면 
      if (!response.ok) {

        // 일부로 에러 발생시켜서 catch로 throw
        // data.message가 있으면 data.massage 사용 아니면 || 문구 사용
        throw new Error(data.message || "이미지 분석 요청에 실패했습니다.");
      }

      setResult(data);


      // 앞에서 던진 new Error의 error
    } catch (error) {

      // error 출력
      console.error("분석 오류:", error);

      // error 메시지를 상태 저장 변수에 저장(값 존재 확인 후 사용 또는 미사용 || 존재하지 않으면 사용)
      setErrorMessage(error.message || "알 수 없는 오류가 발생했습니다.");

      // 에러가 발생해도 마지막에는 무조건 실행
    } finally {
      // loading 상태 변수 false로 설정 -> 분석 끝났으니까 돌리지 말라고.
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl("");
    setResult(null);
    setErrorMessage("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>해충 이미지 분석</h1>

        <p style={styles.description}>
          이미지를 업로드하면 AI가 사진을 분석하여 해충 출현 가능성, 위험도,
          판단 근거, 행동 안내를 제공합니다.
        </p>

        <div style={styles.section}>
          <label style={styles.label}>이미지 업로드</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={styles.fileInput}
          />
        </div>

        {previewUrl && (
          <div style={styles.previewBox}>
            <img
              src={previewUrl}
              alt="업로드 이미지 미리보기"
              style={styles.previewImage}
            />
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              ...styles.primaryButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "분석 중..." : "분석하기"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            style={styles.secondaryButton}
          >
            초기화
          </button>
        </div>

        {errorMessage && <div style={styles.errorBox}>{errorMessage}</div>}

        {result && (
          <div style={styles.resultBox}>
            <h2 style={styles.resultTitle}>분석 결과</h2>

            <div style={styles.resultGrid}>
              <ResultItem
                label="요청 상태"
                value={result.status === "success" ? "성공" : result.status}
              />

              <ResultItem
                label="해충 여부"
                value={result.hasPest ? "해충 가능성 있음" : "해충 가능성 낮음"}
              />

              <ResultItem
                label="위험도"
                value={convertRiskLevel(result.riskLevel)}
              />

              <ResultItem
                label="신뢰도"
                value={formatConfidence(result.confidence)}
              />

              <ResultItem
                label="해충 종류"
                value={formatPestTypes(result.pestTypes)}
              />
            </div>

            <div style={styles.textResultItem}>
              <strong>판단 근거</strong>
              <p style={styles.resultText}>
                {result.reason || "판단 근거가 제공되지 않았습니다."}
              </p>
            </div>

            <div style={styles.textResultItem}>
              <strong>행동 안내</strong>
              <p style={styles.resultText}>
                {result.recommendation || "행동 안내가 제공되지 않았습니다."}
              </p>
            </div>

            <details style={styles.rawJsonBox}>
              <summary style={styles.rawJsonSummary}>원본 JSON 보기</summary>
              <pre style={styles.rawJsonText}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultItem({ label, value }) {
  return (
    <div style={styles.resultItem}>
      <span style={styles.resultLabel}>{label}</span>
      <span style={styles.resultValue}>{value}</span>
    </div>
  );
}

function convertRiskLevel(riskLevel) {
  if (riskLevel === "low") return "낮음";
  if (riskLevel === "medium") return "보통";
  if (riskLevel === "high") return "높음";
  return riskLevel || "알 수 없음";
}

function formatConfidence(confidence) {
  const numberConfidence = Number(confidence);

  if (Number.isNaN(numberConfidence)) {
    return "알 수 없음";
  }

  return `${Math.round(numberConfidence * 100)}%`;
}

function formatPestTypes(pestTypes) {
  if (!Array.isArray(pestTypes) || pestTypes.length === 0) {
    return "없음";
  }

  return pestTypes.join(", ");
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    padding: "40px 20px",
    boxSizing: "border-box",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif",
  },
  container: {
    maxWidth: "640px",
    margin: "0 auto",
    padding: "28px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "30px",
    fontWeight: 700,
    color: "#222",
  },
  description: {
    margin: "0 0 28px",
    color: "#666",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  section: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#333",
  },
  fileInput: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
  },
  previewBox: {
    marginTop: "20px",
    marginBottom: "20px",
  },
  previewImage: {
    width: "100%",
    maxHeight: "360px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid #ddd",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  primaryButton: {
    flex: 1,
    padding: "13px 16px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#222",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
  },
  secondaryButton: {
    padding: "13px 16px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fff",
    color: "#333",
    fontSize: "16px",
    cursor: "pointer",
  },
  errorBox: {
    marginTop: "20px",
    padding: "14px",
    borderRadius: "10px",
    backgroundColor: "#ffecec",
    color: "#c40000",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  resultBox: {
    marginTop: "28px",
    padding: "22px",
    borderRadius: "14px",
    border: "1px solid #e3e3e3",
    backgroundColor: "#fafafa",
  },
  resultTitle: {
    margin: "0 0 18px",
    fontSize: "22px",
    color: "#222",
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
    marginBottom: "20px",
  },
  resultItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    border: "1px solid #eee",
  },
  resultLabel: {
    fontWeight: 600,
    color: "#444",
  },
  resultValue: {
    color: "#222",
    textAlign: "right",
  },
  textResultItem: {
    marginTop: "16px",
    padding: "14px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    border: "1px solid #eee",
    lineHeight: 1.6,
  },
  resultText: {
    margin: "8px 0 0",
    color: "#333",
    whiteSpace: "pre-wrap",
  },
  rawJsonBox: {
    marginTop: "18px",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    border: "1px solid #eee",
  },
  rawJsonSummary: {
    cursor: "pointer",
    fontWeight: 600,
  },
  rawJsonText: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#f1f1f1",
    overflowX: "auto",
    fontSize: "13px",
  },
};

export default App;