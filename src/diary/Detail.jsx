import "../App.css";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Detail = () => {
  const { diary_id } = useParams(); // URL 파라미터 이름을 diary_id로 맞추세요
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  const emotionToEmoji = (emotion) => {
    switch (emotion) {
      case '긍정':
        return '😄';
      case '중립':
        return '😐';
      case '부정':
        return '😠';
      case '슬픔':
        return '😢';
      case '놀람':
        return '😲';
      default:
        return '❓';
    }
  }

  useEffect(() => {
    axios.get(`http://localhost:8000/diarys/${diary_id}`)
      .then(async (response) => {
        setDiary(response.data);
        setLoading(false);

        // presigned url로 이미지 가져오기
        if (response.data.image) {
          const token = window.sessionStorage.getItem("access_token");
          const presignedRes = await axios.get(
            `http://localhost:8000/diarys/download-url?file_key=${encodeURIComponent(response.data.image)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setImageUrl(presignedRes.data.download_url);
        }
      })
      .catch((err) => {
        setError('일기 정보를 불러오는 데 실패했습니다.');
        console.log(diary_id);
        setLoading(false);
      });
  }, [diary_id]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;
  if (!diary) return <p>일기 정보가 없습니다.</p>;

  return (
    <div>
      <h2>{diary.title}</h2>
      {imageUrl && <img src={imageUrl} alt={diary.title} style={{ width: '300px' }} />}
      <p><strong>내용:</strong> {diary.content}</p>
      <p><strong>상태:</strong> {diary.state}</p>
      <p><strong>감정:</strong> {emotionToEmoji(diary.emotion)}</p>
      <p><strong>일기 ID:</strong> {diary.id}</p>

      <button onClick={() => navigate('/list')} style={{ marginTop: '20px' }}>
        목록으로
      </button>
    </div>
  );
};

export default Detail;