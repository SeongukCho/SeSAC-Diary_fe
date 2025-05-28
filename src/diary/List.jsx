import "../App.css";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CalendarComponent from '../calendar';

const List = () => {
    const [searchTitle, setSearchTitle] = useState(""); // 검색어 상태
    const [diarys, setDiarys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageUrls, setImageUrls] = useState({});
    const [filteredDiarys, setFilteredDiarys] = useState([]);
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const navigate = useNavigate();

    // Presigned URL 받아오기
    const getPresignedUrl = async (key) => {
        const token = window.sessionStorage.getItem("access_token");
        const res = await axios.get(
            `http://localhost:8000/diarys/download-url?file_key=${encodeURIComponent(key)}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data.download_url;
    };

    // 이미지 URL 가져오기
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

    // 로그인 체크
    useEffect(() => {
        const token = window.sessionStorage.getItem("access_token");
        if (!token) {
            alert("로그인 후 사용하세요.");
            navigate("/login");
        }
    }, []);

    // 일기 목록 가져오기
    useEffect(() => {
        const token = window.sessionStorage.getItem("access_token");
        if (!token) {
            setLoading(false);
            return;
        }

        axios.get('http://localhost:8000/diarys/', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => {
                const sortedDiarys = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setDiarys(sortedDiarys);
                setLoading(false);
            })
            .catch((err) => {
                console.error("일기장 데이터를 불러오는 데 실패했습니다:", err.response ? err.response.data : err.message);
                setError('일기장 데이터를 불러오는 데 실패했습니다.');
                setLoading(false);
            });
    }, []);

    // 선택된 날짜와 일기 작성일이 같으면 필터링
    useEffect(() => {
        if (selectedDate) {
            const filtered = diarys.filter(
                (diary) =>
                    new Date(diary.created_at).toISOString().slice(0, 10) === selectedDate
            );
            setFilteredDiarys(filtered);
        } else {
            setFilteredDiarys(diarys);
        }
    }, [selectedDate, diarys]);

    // 검색 버튼 클릭 시 제목으로 필터링
    const handleSearch = () => {
        const token = window.sessionStorage.getItem("access_token");
        if (searchTitle.trim() !== "") {
            // 검색어가 있을 때
            axios.get('http://localhost:8000/diarys/list/search', {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: searchTitle } // 검색어를 params로 전달
            })
                .then((response) => {
                    // 검색 결과 정렬 (최신 일기부터)
                    const sortedDiarys = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setFilteredDiarys(sortedDiarys);
                })
                .catch((err) => {
                    console.error("검색 결과를 불러오는 데 실패했습니다:", err.response ? err.response.data : err.message);
                    setError('검색 결과를 불러오는 데 실패했습니다.');
                });
        } else {
            // 검색어가 비어 있을 경우 (전체 공개 일기)
            axios.get('http://localhost:8000/diarys/', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((response) => {
                    // 전체 일기 목록을 정렬
                    const sortedDiarys = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setFilteredDiarys(sortedDiarys);
                })
                .catch((err) => {
                    console.error("일기 목록을 불러오는 데 실패했습니다:", err.response ? err.response.data : err.message);
                    setError('일기 목록을 불러오는 데 실패했습니다.');
                });
        }
    };


    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ padding: '20px' }}>

            <CalendarComponent
                onDateSelect={setSelectedDate}
                attendDates={Array.from(
                    new Set(diarys.map(d => new Date(d.created_at).toISOString().slice(0, 10)))
                )}
            />
            {/* 검색 추가 */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="제목 검색"
                    value={searchTitle}  // searchTitle 상태에 바인딩
                    onChange={(e) => setSearchTitle(e.target.value)}  // 검색어 입력 시 상태 변경
                    style={{
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        width: '200px'
                    }}
                />
                <button
                    onClick={handleSearch}  // 버튼 클릭 시 검색 실행
                    style={{
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    검색
                </button>
            </div>

            <h2>
                {new Date(selectedDate).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                })}의 일기
            </h2>

            {filteredDiarys.length === 0 ? (
                <p>오늘은 일기가 없습니다.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {filteredDiarys.map((diary) => (
                        <li
                            key={diary.id}
                            style={{
                                marginBottom: '20px',
                                borderBottom: '1px solid #ccc',
                                paddingBottom: '20px',
                            }}
                        >
                            <Link
                                to={`/detail/${diary.id}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                    {diary.image && imageUrls[diary.id] && (
                                        <img
                                            src={imageUrls[diary.id]}
                                            alt={diary.title}
                                            style={{
                                                width: '200px',
                                                height: 'auto',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                            }}
                                        />
                                    )}
                                    <div>
                                        <h3>{diary.title}</h3>
                                        <p style={{ maxWidth: "500px", color: "#555" }}>
                                            {diary.content.length > 100
                                                ? diary.content.slice(0, 100) + "..."
                                                : diary.content}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
            <button className="write-button" onClick={() => navigate("/regist")}>
                <span className="icon">✏️</span> 글쓰기
            </button>
        </div>
    );
};

export default List;
