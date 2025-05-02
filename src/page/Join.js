import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const Join = () => {
  const [formData, setFormData] = useState({
    userName: "", userId: "", userPw: "", userPw2: "",
    userNick: "", userEmail: "", jobIdx: "", targetIdx: "",
    userPhone: "", userGender: "",
  });

  const [jobs, setJobs] = useState([]);
  const [targets, setTargets] = useState([]);
  const [isIdAvailable, setIsIdAvailable] = useState(null); // 아이디 중복 여부
  const [isPasswordMatch, setIsPasswordMatch] = useState(false); // 비밀번호 확인 여부
  const userIdInputRef = useRef(null); // 아이디 입력란 Ref
  // 각 필드별 에러 상태
  const [errors, setErrors] = useState({
    userName: "",
    userId: "",
    userPw: "",
    userPw2: "",
    userNick: "",
    userEmail: "",
    userPhone: "",
    userGender: "",
    jobIdx: "",
    targetIdx: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/categories/job")
      .then((response) => setJobs(response.data))
      .catch((error) => console.error("Error fetching job categories:", error));

    axiosInstance.get("/categories/target")
      .then((response) => setTargets(response.data))
      .catch((error) => console.error("Error fetching target categories:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 아이디가 변경될 때 중복 확인 결과 초기화
    if (name === "userId") setIsIdAvailable(false);
  };

  const checkUserId = async () => {
    if (!formData.userId) {
      alert("아이디를 입력해주세요.");
      return;
    }
    try {
      const response = await axiosInstance.get(`user/checkId/${formData.userId}`);
      if (response.data) {
        alert("아이디가 중복됩니다.");
        setIsIdAvailable(false);
        userIdInputRef.current.focus(); // 아이디 입력창으로 포커스 이동
      } else {
        alert("사용 가능한 아이디입니다.");
        setIsIdAvailable(true);
      }
    } catch (error) {
      console.error("아이디 중복 확인 실패:", error);
      alert("중복 확인 중 오류가 발생했습니다.");
    }
  };

  const checkPasswordMatch = () => {
      if (!formData.userPw || !formData.userPw2) {
        alert("비밀번호를 입력해주세요.");
        return;
      }
      if (formData.userPw !== formData.userPw2) {
        alert("비밀번호가 다릅니다.");
        setIsPasswordMatch(false);
      } else {
        alert("비밀번호가 일치합니다.");
        setIsPasswordMatch(true);
      }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 아이디 중복된 경우 회원가입 불가
    if (!isIdAvailable) {
      alert("아이디 확인을 완료해주세요.");
      userIdInputRef.current.focus(); // 아이디 입력창으로 포커스 이동
      return;
    }
    else if (!isPasswordMatch) {
      alert("비밀번호 확인을 완료해주세요.");
      return;
    }
    else {
      try {
        await axiosInstance.post("/user/join", formData);
        alert("회원가입 성공!");
        navigate("/login"); // 회원가입 성공 후 이동
      } catch (error) {
        console.error("회원가입 실패:", error);
        alert("회원가입에 실패했습니다.");
        if (error.response && error.response.data) {
          const serverErrors = error.response.data;
          setErrors((prevErrors) => ({
            ...prevErrors,
            userName: serverErrors.userName || "",
            userId: serverErrors.userId || "",
            userPw: serverErrors.userPw || "",
            userPw2: serverErrors.userPw2 || "",
            userNick: serverErrors.userNick || "",
            userEmail: serverErrors.userEmail || "",
            userPhone: serverErrors.userPhone || "",
            userGender: serverErrors.userGender || "",
            jobIdx: serverErrors.jobIdx || "",
            targetIdx: serverErrors.targetIdx || ""
          }));
        }
      }
    }
  };

  const styles = {
    form: { width: "300px", margin: "0 auto", display: "flex", flexDirection: "column" },
    formGroup: { display: "flex", flexDirection: "column", marginBottom: "15px" },
    label: { fontWeight: "bold", marginBottom: "5px" },
    inputWithButton: { display: "flex", gap: "10px" },
    radioGroup: { display: "flex", gap: "10px" },
    submitButton: { backgroundColor: "#007bff", color: "white", border: "none", padding: "10px", cursor: "pointer" },
    submitButtonHover: { backgroundColor: "#0056b3" }
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.formGroup}>
        <label style={styles.label}>이름:</label>
        <input type="text" name="userName" value={formData.userName} onChange={handleChange} />
        {errors.userName && <div style={{ color: "red" }}>{errors.userName}</div>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>아이디:</label>
        <div style={styles.inputWithButton}>
          <input type="text" name="userId" value={formData.userId} onChange={handleChange} ref={userIdInputRef} />
          <button type="button" onClick={checkUserId}>중복 확인</button>
        </div>
        {errors.userId && <div style={{ color: "red" }}>{errors.userId}</div>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>비밀번호:</label>
        <input type="password" name="userPw" value={formData.userPw} onChange={handleChange} />
        {errors.userPw && <div style={{ color: "red" }}>{errors.userPw}</div>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>비밀번호 확인:</label>
        <div style={styles.inputWithButton}>
          <input type="password" name="userPw2" value={formData.userPw2} onChange={handleChange} />
          <button type="button" onClick={checkPasswordMatch}>확인</button>
        </div>
        {errors.userPw2 && <div style={{ color: "red" }}>{errors.userPw2}</div>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>닉네임:</label>
        <input type="text" name="userNick" value={formData.userNick} onChange={handleChange} />
        {errors.userNick && <div style={{ color: "red" }}>{errors.userNick}</div>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>이메일:</label>
        <input type="email" name="userEmail" value={formData.userEmail} onChange={handleChange} />
        {errors.userEmail && <div style={{ color: "red" }}>{errors.userEmail}</div>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>현재 직업:</label>
        <select name="jobIdx" value={formData.jobIdx} onChange={handleChange}>
          <option value="">직업 선택</option>
          {jobs.map((job) => (
            <option key={job.jobIdx} value={job.jobIdx}>{job.jobName}</option>
          ))}
        </select>
        {errors.jobIdx && <div style={{ color: "red" }}>{errors.jobIdx}</div>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>현재 관심사:</label>
        <select name="targetIdx" value={formData.targetIdx} onChange={handleChange}>
          <option value="">관심사 선택</option>
          {targets.map((target) => (
            <option key={target.targetIdx} value={target.targetIdx}>{target.targetName}</option>
          ))}
        </select>
        {errors.targetIdx && <div style={{ color: "red" }}>{errors.targetIdx}</div>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>휴대전화 번호:</label>
        <input type="text" name="userPhone" value={formData.userPhone} onChange={handleChange} />
        {errors.userPhone && <div style={{ color: "red" }}>{errors.userPhone}</div>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>성별:</label>
        <div style={styles.radioGroup}>
          <label>
            <input type="radio" name="userGender" value="2" onChange={handleChange} /> 여성
          </label>
          <label>
            <input type="radio" name="userGender" value="1" onChange={handleChange} /> 남성
          </label>
          {errors.userGender && <div style={{ color: "red" }}>{errors.userGender}</div>}
        </div>
      </div>

      <button
        style={styles.submitButton}
        onMouseOver={(e) => (e.target.style.backgroundColor = styles.submitButtonHover.backgroundColor)}
        onMouseOut={(e) => (e.target.style.backgroundColor = styles.submitButton.backgroundColor)}
        type="submit"
      >
        회원가입
      </button>
    </form>
  );
};

export default Join;
