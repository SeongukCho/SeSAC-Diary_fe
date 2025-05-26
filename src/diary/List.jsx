import "../App.css";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link,useNavigate } from 'react-router-dom';

const List = () => {
  const [diarys, setDiarys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const getPresignedUrl = async (key) => {
  const token = window.sessionStorage.getItem("access_token");
  const res = await axios.get(`http://localhost:8000/diarys/download-url?file_key=${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.download_url;
  };

  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    const fetchPresignedUrls = async () => {
      const urls = {};
      for (const diary of diarys) {
        if (diary.image) {
          urls[diary.id] = await getPresignedUrl(diary.image);
        }
      }
      setImageUrls(urls);
    };
    if (diarys.length > 0) fetchPresignedUrls();
  }, [diarys]);

  useEffect(() => {
    const token = window.sessionStorage.getItem("access_token");
    console.log(token);
    if (!token) {
      alert("로그인 후 사용하세요.");
      navigate("/login");
    }
  });
  
  useEffect(() => {
    axios.get('http://localhost:8000/diarys/')
      .then((response) => {
        setDiarys(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('일기장 데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <h2>일기 목록</h2>
      {diarys.length === 0 ? (
        <p>일기가 없습니다.</p>
      ) : (
        <ul>
          {diarys.map((diary) => (
            <li key={diary.id} style={{ marginBottom: '20px' }}>
              <p><strong>번호:</strong> {diary.id}</p>
              <h3><Link to={`/detail/${diary.id}`}>{diary.title}</Link></h3>
              {diary.image && imageUrls[diary.id] && (
                <img src={imageUrls[diary.id]} alt={diary.title} style={{ width: '200px' }} />
              )}
              {/* <p><strong>설명:</strong> {diary.description}</p>
              <p><strong>위치:</strong> {diary.location}</p>
              <p><strong>태그:</strong> {diary.tags}</p> */}
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => navigate("/regist")}>일기 등록</button>
    </>
  );
};

export default List;