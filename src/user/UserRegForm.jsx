import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../css/userReg.css"
const UserRegForm = () => {
    const [email, setEmail] = useState('');
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [isEmailAvailable, setIsEmailAvailable] = useState(null);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
    const navigate = useNavigate();
    const [confirmPassword, setConfirmPassword] = useState('');

    // 이메일, 닉네임 중복 검사 함수

    const checkEmailDuplicate = async () => {
        try {
            console.log("Checking email:", email); // 이메일 값 확인
            const response = await axios.get(`http://localhost:8000/users/checkemail/${email}`);
            console.log("일로 잘 들어옴,");
            if (response.data.message === 'Email available') {
                setIsEmailAvailable(true);
                alert('사용 가능한 이메일입니다.');
            }
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setIsEmailAvailable(false);
                alert('이미 등록된 이메일입니다.');
            } else {
                alert('이메일 중복 확인 중 오류가 발생했습니다.');
            }
        }
    };


// 닉네임 중복 체크
    const checkUsernameDuplicate = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/users/checkusername/${username}`);
            if (response.data.message === 'Username available') {
                setIsUsernameAvailable(true);
                alert('사용 가능한 닉네임입니다.');
            }
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setIsUsernameAvailable(false);
                alert('이미 등록된 닉네임입니다.');
            } else {
                alert('닉네임 중복 확인 중 오류가 발생했습니다.');
            }
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEmailAvailable || !isUsernameAvailable) {
            alert("이메일 또는 닉네임 중복 확인이 필요합니다.");
            return; // 중복 확인이 되지 않으면 제출하지 않음
        }

        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        // 이메일, 닉네임 중복이 없으면 회원가입 진행
        try {
            console.log("일로 들어옴. ")
            const response = await axios.post('http://localhost:8000/users/signup', {
                email : email,
                username: username,
                password : password,
                role : 'user'
            });
            alert('회원가입이 완료되었습니다!');
            navigate("/login");
        } catch (err) {
            console.error("회원가입 오류:", err)
            alert("회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <div>
            <h2>회원가입</h2>
            <form className="modify-form" onSubmit={handleSubmit}>
                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일을 입력하세요."
                        required
                    />
                    <button type="button" onClick={checkEmailDuplicate}>이메일 중복 확인</button>
                    {isEmailAvailable === false && <p style={{ color: 'red' }}>이미 등록된 이메일입니다.</p>}
                    {isEmailAvailable === true && <p style={{ color: 'green' }}>사용 가능한 이메일입니다.</p>}
                </div>

                <div>
                    <input type="text" value={username}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="닉네임을 입력하세요."
                        required
                    />
                    <button type="button" onClick={checkUsernameDuplicate}>닉네임 중복 확인</button>
                    {isUsernameAvailable === false && <p style={{ color: 'red' }}>이미 등록된 닉네임입니다.</p>}
                    {isUsernameAvailable === true && <p style={{ color: 'green' }}>사용 가능한 닉네임입니다.</p>}
                </div>

                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요."
                        required
                    />
                </div>
                <div>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 확인하세요."
                    required
                />
                </div>
                <button type="submit">회원가입</button>
            </form>
        </div>
    );
};

export default UserRegForm;
