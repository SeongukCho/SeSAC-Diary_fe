import "../App.css";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const bucketName = import.meta.env.VITE_S3_BUCKET;
const region = import.meta.env.VITE_S3_REGION;

export default function Regist() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id: '',
    title: '',
    content: '',
    private: false,
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleChangeFile = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = window.sessionStorage.getItem("access_token");

    try {
      let image_url = "";

      if (image) {
        // 1. Presigned URL 요청
        const presignedRes = await axios.get("http://localhost:8000/diarys/presigned-url?file_type=image/jpeg", {
  headers: { Authorization: `Bearer ${token}` }
});
        const { url, key } = presignedRes.data;
        console.log("Presigned URL:", url);
        console.log("Key:", key);

        // 2. 이미지 S3 업로드
        await axios.put(url, image, {
          headers: { 

         }
        });

        // 3. 실제 이미지 URL 구성
        image_url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
      }

      // 4. 일기 등록 요청
      const res = await axios.post("http://localhost:8000/diarys/", {
        id: parseInt(form.id),
        title: form.title,
        content: form.content,
        private: form.private,
        image: image_url,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.status === 201) {
        alert("일기 등록 완료!");
        navigate("/list");
      }
    } catch (err) {
      console.error(err);
      alert("등록 실패: " + (err.response?.data?.detail || "알 수 없는 오류"));
    }
  };

  return (
    <>
      <h2>일기 등록</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="id"
          value={form.id}
          onChange={handleChange}
          placeholder="일기 번호를 입력하세요."
        />
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="제목을 입력하세요."
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="내용을 입력하세요."
          rows="5"
          cols="40"
        />
        <input type="file" onChange={handleChangeFile} />
        <label>
          <input
            type="checkbox"
            name="private"
            checked={form.private}
            onChange={handleChange}
          /> 비공개
        </label>
        <br />
        <button type="submit">등록</button>
      </form>
    </>
  );
}
