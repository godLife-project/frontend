import React, { useState, useEffect } from "react";
import {
  Search,
  Ban,
  Users,
  AlertTriangle,
  Shield,
  User,
  FileText,
  Check,
  X,
} from "lucide-react";
import axiosInstance from "@/api/axiosInstance";

const UserManager = ({ initialTab = "유저 관리" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [reportSubTab, setReportSubTab] = useState("유저 신고");

  // 유저 관리 상태
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // 신고 관리 상태
  const [userReports, setUserReports] = useState([]);
  const [planReports, setPlanReports] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [reportCurrentPage, setReportCurrentPage] = useState(1);
  const [reportTotalPages, setReportTotalPages] = useState(1);
  const [reportTotal, setReportTotal] = useState(0);
  const [reportPageSize, setReportPageSize] = useState(10);
  const [reportStatus, setReportStatus] = useState(""); // "", "0", "1"

  // 권한 관리 상태
  const [authorities, setAuthorities] = useState([]);
  const [selectedAuthority, setSelectedAuthority] = useState(""); // authorityIdx만
  const [authorityUsers, setAuthorityUsers] = useState([]);
  const [authorityLoading, setAuthorityLoading] = useState(false);
  const [authorityError, setAuthorityError] = useState(null);
  const [adminList, setAdminList] = useState([]);
  const [authorityCounts, setAuthorityCounts] = useState({});
  const [updatingUserAuth, setUpdatingUserAuth] = useState(new Set());

  // 신고 처리 로딩 상태
  const [processingReports, setProcessingReports] = useState(new Set());

  const reportSubTabs = [
    { id: "유저 신고", label: "유저 신고", icon: User },
    { id: "루틴 신고", label: "루틴 신고", icon: FileText },
  ];

  // initialTab이 변경될 때 activeTab 업데이트
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // 유저 목록 조회
  const fetchUsers = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      let url = `/admin/users?page=${page}&size=${pageSize}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response?.data?.code === 200) {
        const { data } = response.data;
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotalUsers(data.total);
        setCurrentPage(data.page);
        setPageSize(data.size);
      } else {
        console.error("유저 목록 조회 실패:", response?.data?.message);
        setError("유저 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("API 호출 오류:", error);
      setError("유저 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 유저 신고 목록 조회
  const fetchUserReports = async (page = 1, status = "") => {
    setReportLoading(true);
    setReportError(null);
    try {
      const accessToken = localStorage.getItem("accessToken");
      let url = `/admin/report/userReport?page=${page}&size=${reportPageSize}`;
      if (status !== "") {
        url += `&status=${status}`;
      }

      const response = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response?.status === 200 && response?.data) {
        const { total, size, page: currentPage, list } = response.data;
        setUserReports(list || []);
        setReportTotal(total || 0);
        setReportCurrentPage(currentPage || 1);
        setReportPageSize(size || 10);
        setReportTotalPages(Math.ceil((total || 0) / (size || 10)));
      } else {
        console.error("유저 신고 목록 조회 실패:", response?.data?.message);
        setReportError("유저 신고 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("API 호출 오류:", error);
      setReportError("유저 신고 목록을 불러오는데 실패했습니다.");
    } finally {
      setReportLoading(false);
    }
  };

  // 루틴 신고 목록 조회
  const fetchPlanReports = async (page = 1, status = "") => {
    setReportLoading(true);
    setReportError(null);
    try {
      const accessToken = localStorage.getItem("accessToken");
      let url = `/admin/report/planReport?page=${page}&size=${reportPageSize}`;
      if (status !== "") {
        url += `&status=${status}`;
      }

      const response = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response?.status === 200 && response?.data) {
        const { total, size, page: currentPage, list } = response.data;
        setPlanReports(list || []);
        setReportTotal(total || 0);
        setReportCurrentPage(currentPage || 1);
        setReportPageSize(size || 10);
        setReportTotalPages(Math.ceil((total || 0) / (size || 10)));
      } else {
        console.error("루틴 신고 목록 조회 실패:", response?.data?.message);
        setReportError("루틴 신고 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("API 호출 오류:", error);
      setReportError("루틴 신고 목록을 불러오는데 실패했습니다.");
    } finally {
      setReportLoading(false);
    }
  };

  // 유저 활동 정지
  const banUser = async (userIdx) => {
    if (!window.confirm("정말로 이 유저의 활동을 정지하시겠습니까?")) {
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axiosInstance.patch(
        `/admin/users/ban/${userIdx}`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response?.status === 200) {
        alert("유저 활동이 정지되었습니다.");
        fetchUsers(currentPage, searchTerm); // 목록 새로고침
      } else {
        alert("활동 정지 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("API 호출 오류:", error);
      alert("오류가 발생했습니다.");
    }
  };

  // 권한 목록 조회
  const fetchAuthorities = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axiosInstance.get("/admin/users/authority/list", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response?.data?.code === 200) {
        setAuthorities(response.data.authorityList || []);
        // 권한 목록을 가져온 후 각 권한별 사용자 수 조회
        return response.data.authorityList || [];
      } else {
        console.error("권한 목록 조회 실패:", response?.data?.message);
        setAuthorityError("권한 목록을 불러오는데 실패했습니다.");
        return [];
      }
    } catch (error) {
      console.error("API 호출 오류:", error);
      setAuthorityError("권한 목록을 불러오는데 실패했습니다.");
      return [];
    }
  };

  // 권한별 유저 조회
  const fetchUsersByAuthority = async (authorityIdx) => {
    console.log("권한별 유저 조회 시작:", authorityIdx);
    setAuthorityLoading(true);
    setAuthorityError(null);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const url = `/admin/users/authority/${authorityIdx}`;
      console.log("요청 URL:", url);

      const response = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log("응답 데이터:", response.data);

      if (response?.data?.code === 200) {
        setAuthorityUsers(response.data.userList || []);
      } else {
        console.error("권한별 유저 조회 실패:", response?.data?.message);
        setAuthorityError("권한별 유저 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("API 호출 오류:", error);
      console.error("에러 응답:", error.response?.data);
      setAuthorityError(
        `권한별 유저 목록을 불러오는데 실패했습니다. (${
          error.response?.status || "Unknown"
        })`
      );
    } finally {
      setAuthorityLoading(false);
    }
  };

  // 관리자 목록 조회
  const fetchAdminList = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axiosInstance.get(
        "/admin/users/authority/adminList",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response?.data?.code === 200) {
        setAdminList(response.data.userList || []);
      } else {
        console.error("관리자 목록 조회 실패:", response?.data?.message);
      }
    } catch (error) {
      console.error("관리자 목록 API 호출 오류:", error);
    }
  };

  // 모든 권한별 사용자 수 조회
  const fetchAuthorityCounts = async () => {
    const counts = {};
    try {
      const accessToken = localStorage.getItem("accessToken");

      for (const authority of authorities) {
        try {
          const response = await axiosInstance.get(
            `/admin/users/authority/${authority.authorityIdx}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          if (response?.data?.code === 200) {
            counts[authority.authorityIdx] =
              response.data.userList?.length || 0;
          }
        } catch (error) {
          console.error(`권한 ${authority.authorityIdx} 조회 오류:`, error);
          counts[authority.authorityIdx] = 0;
        }
      }

      setAuthorityCounts(counts);
    } catch (error) {
      console.error("권한별 사용자 수 조회 오류:", error);
    }
  };

  // 사용자 권한 변경
  const updateUserAuthority = async (userIdx, authorityIdx) => {
    if (!window.confirm("정말로 이 사용자의 권한을 변경하시겠습니까?")) {
      return;
    }

    setUpdatingUserAuth((prev) => new Set([...prev, userIdx]));

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axiosInstance.patch(
        `/admin/users/authority/updateAuth/${userIdx}`,
        { authorityIdx },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response?.status === 200) {
        alert("권한이 성공적으로 변경되었습니다.");
        // 현재 선택된 권한의 사용자 목록 새로고침
        if (selectedAuthority) {
          fetchUsersByAuthority(selectedAuthority);
        }
        // 관리자 목록 새로고침
        fetchAdminList();
        // 권한별 사용자 수 새로고침
        fetchAuthorityCounts();
      } else {
        alert("권한 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("권한 변경 API 호출 오류:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setUpdatingUserAuth((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userIdx);
        return newSet;
      });
    }
  };

  const processPlanReport = async (
    planReportIdx,
    status,
    reporterIdx,
    planIdx
  ) => {
    const statusText = status === 1 ? "처리완료" : "미처리";
    if (!window.confirm(`정말로 이 신고를 ${statusText}로 변경하시겠습니까?`)) {
      return;
    }

    // 로딩 상태 추가 (고유 키 생성)
    const reportKey = `${reporterIdx}-${planIdx}`;
    setProcessingReports((prev) => new Set([...prev, reportKey]));

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axiosInstance.patch(
        `/admin/report/plans/${planIdx}/reports/${planReportIdx}/status`,
        { status }, // status를 body에 포함
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response?.status === 200) {
        alert(`신고가 ${statusText}로 변경되었습니다.`);
        // 현재 페이지 새로고침
        fetchPlanReports(reportCurrentPage, reportStatus);
      } else {
        alert("신고 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("API 호출 오류:", error);
      alert("오류가 발생했습니다.");
    } finally {
      // 로딩 상태 제거
      setProcessingReports((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reportKey);
        return newSet;
      });
    }
  };

  const processUserReport = async (
    userReportIdx,
    status,
    reporterIdx,
    reportedIdx
  ) => {
    const statusText = status === 1 ? "처리완료" : "미처리";
    if (!window.confirm(`정말로 이 신고를 ${statusText}로 변경하시겠습니까?`)) {
      return;
    }

    // 로딩 상태 추가 (고유 키 생성)
    const reportKey = `${reporterIdx}-${reportedIdx}`;
    setProcessingReports((prev) => new Set([...prev, reportKey]));

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axiosInstance.post(
        `/admin/report/userReportState`,
        null,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            userReportIdx,
            status,
          },
        }
      );

      if (response?.status === 200) {
        alert(`신고가 ${statusText}로 변경되었습니다.`);
        // 현재 페이지 새로고침
        fetchUserReports(reportCurrentPage, reportStatus);
      } else {
        alert("신고 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("API 호출 오류:", error);
      alert("오류가 발생했습니다.");
    } finally {
      // 로딩 상태 제거
      setProcessingReports((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reportKey);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (activeTab === "유저 관리") {
      fetchUsers(currentPage, searchTerm);
    } else if (activeTab === "신고처리") {
      if (reportSubTab === "유저 신고") {
        fetchUserReports(reportCurrentPage, reportStatus);
      } else if (reportSubTab === "루틴 신고") {
        fetchPlanReports(reportCurrentPage, reportStatus);
      }
    } else if (activeTab === "권한관리") {
      const initializeAuthorityTab = async () => {
        const authoritiesList = await fetchAuthorities();
        if (authoritiesList.length > 0) {
          // 권한 목록을 가져온 후 권한별 사용자 수 조회
          const counts = {};
          const accessToken = localStorage.getItem("accessToken");

          for (const authority of authoritiesList) {
            try {
              const response = await axiosInstance.get(
                `/admin/users/authority/${authority.authorityIdx}`,
                {
                  headers: { Authorization: `Bearer ${accessToken}` },
                }
              );

              if (response?.data?.code === 200) {
                counts[authority.authorityIdx] =
                  response.data.userList?.length || 0;
              }
            } catch (error) {
              console.error(`권한 ${authority.authorityIdx} 조회 오류:`, error);
              counts[authority.authorityIdx] = 0;
            }
          }

          setAuthorityCounts(counts);
        }

        // 관리자 목록도 조회
        fetchAdminList();
      };

      initializeAuthorityTab();
    }
  }, [activeTab, reportSubTab, currentPage, reportCurrentPage]);

  // 선택된 권한 변경시 해당 권한의 유저 목록 조회
  useEffect(() => {
    if (activeTab === "권한관리" && selectedAuthority) {
      fetchUsersByAuthority(selectedAuthority);
    }
  }, [selectedAuthority, activeTab]);

  // 검색어 변경시 디바운싱 처리
  useEffect(() => {
    if (activeTab !== "유저 관리") return;

    const timer = setTimeout(() => {
      setCurrentPage(1); // 검색시 첫 페이지로 이동
      fetchUsers(1, searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, activeTab]);

  // 신고 상태 변경시 처리
  useEffect(() => {
    if (activeTab !== "신고처리") return;

    setReportCurrentPage(1);
    if (reportSubTab === "유저 신고") {
      fetchUserReports(1, reportStatus);
    } else if (reportSubTab === "루틴 신고") {
      fetchPlanReports(1, reportStatus);
    }
  }, [reportStatus, activeTab, reportSubTab]);

  // 검색 필터링 (서버 사이드 처리로 변경됨)
  const displayUsers = users;

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 상태 표시 함수
  const getStatusBadge = (status) => {
    if (status === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          미처리
        </span>
      );
    } else if (status === 1) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          처리완료
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        알 수 없음
      </span>
    );
  };

  // 헤더 제목 설정
  const getHeaderTitle = () => {
    if (activeTab === "신고처리") {
      return `신고처리 - ${reportSubTab}`;
    }
    return activeTab;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 헤더 */}
      <header className="bg-white p-5 shadow flex justify-between items-center">
        <h1 className="text-xl font-semibold">{getHeaderTitle()}</h1>
        {activeTab === "유저 관리"}
      </header>

      {/* 신고처리 서브탭 */}
      {activeTab === "신고처리" && (
        <div className="bg-gray-100 px-4 py-2">
          <nav className="flex space-x-1">
            {reportSubTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setReportSubTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                    reportSubTab === tab.id
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* 컨텐츠 영역 */}
      <div className="p-4">
        {activeTab === "유저 관리" && (
          <div>
            {/* 검색바 */}
            <div className="mb-4">
              <div className="relative max-w-md">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="유저를 검색하세요"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 로딩 및 에러 상태 */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">{error}</p>
              </div>
            )}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          이름
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          사용자 ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          닉네임
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          이메일
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          가입일
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          신고 횟수
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          플랜 수
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          관리
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayUsers.map((user) => (
                        <tr key={user.userIdx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {user.userIdx}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {user.userName}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {user.userId}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {user.userNick}
                            <span className="text-gray-500 text-xs ml-1">
                              {user.nickTag}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {user.userEmail}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(user.userJoin)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.reportCount > 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.reportCount}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {user.planCount}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <button
                              onClick={() => banUser(user.userIdx)}
                              className="inline-flex items-center px-2 py-1 border border-red-300 text-xs leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <Ban size={12} className="mr-1" />
                              활동 정지
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {displayUsers.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                      {searchTerm
                        ? "검색 결과가 없습니다."
                        : "등록된 유저가 없습니다."}
                    </div>
                  )}
                </div>
              )}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-2 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      이전
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      다음
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-gray-700">
                        전체 <span className="font-medium">{totalUsers}</span>개
                        중{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * pageSize + 1}
                        </span>
                        -
                        <span className="font-medium">
                          {Math.min(currentPage * pageSize, totalUsers)}
                        </span>
                        개 표시
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          이전
                        </button>

                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-3 py-1 border text-xs font-medium ${
                                currentPage === page
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          다음
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "신고처리" && (
          <div>
            {/* 신고 상태 필터 */}
            <div className="mb-4 flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                신고 상태:
              </label>
              <select
                value={reportStatus}
                onChange={(e) => setReportStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">전체</option>
                <option value="0">미처리</option>
                <option value="1">처리완료</option>
              </select>
            </div>

            {/* 로딩 및 에러 상태 */}
            {reportError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">{reportError}</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {reportLoading ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {reportSubTab === "유저 신고" && (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            신고자 ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            신고자 닉네임
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            신고받은 유저 ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            신고받은 유저 닉네임
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            신고 사유
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            신고일
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            처리상태
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userReports.map((report, index) => {
                          const reportKey = `${report.reporterIdx}-${report.reportedIdx}`;
                          const isProcessing = processingReports.has(reportKey);

                          return (
                            <tr
                              key={`${report.reporterIdx}-${report.reportedIdx}-${index}`}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {report.reporterIdx}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {report.reporterNick}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {report.reportedIdx}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {report.reportedNick}
                              </td>
                              <td
                                className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate"
                                title={report.reportReason}
                              >
                                {report.reportReason}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(report.reportDate)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                <select
                                  value={report.status}
                                  onChange={(e) => {
                                    const newStatus = parseInt(e.target.value);
                                    if (newStatus !== report.status) {
                                      processUserReport(
                                        report.userReportIdx ||
                                          `${report.reporterIdx}-${report.reportedIdx}`,
                                        newStatus,
                                        report.reporterIdx,
                                        report.reportedIdx
                                      );
                                    }
                                  }}
                                  disabled={isProcessing}
                                  className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <option value={0}>미처리</option>
                                  <option value={1}>처리완료</option>
                                </select>
                                {isProcessing && (
                                  <div className="inline-block ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {reportSubTab === "루틴 신고" && (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            신고자 ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            루틴 ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            신고 사유
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            신고일
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            처리상태
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {planReports.map((report, index) => {
                          const reportKey = `${report.reporterIdx}-${report.planIdx}`;
                          const isProcessing = processingReports.has(reportKey);

                          return (
                            <tr
                              key={`${report.reporterIdx}-${report.planIdx}-${index}`}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {report.reporterIdx}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {report.planIdx}
                              </td>
                              <td
                                className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate"
                                title={report.reportReason}
                              >
                                {report.reportReason}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(report.reportDate)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                <select
                                  value={report.status}
                                  onChange={(e) => {
                                    const newStatus = parseInt(e.target.value);
                                    if (newStatus !== report.status) {
                                      processPlanReport(
                                        report.planReportIdx ||
                                          `${report.reporterIdx}-${report.planIdx}`,
                                        newStatus,
                                        report.reporterIdx,
                                        report.planIdx
                                      );
                                    }
                                  }}
                                  disabled={isProcessing}
                                  className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <option value={0}>미처리</option>
                                  <option value={1}>처리완료</option>
                                </select>
                                {isProcessing && (
                                  <div className="inline-block ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {((reportSubTab === "유저 신고" &&
                    userReports.length === 0) ||
                    (reportSubTab === "루틴 신고" &&
                      planReports.length === 0)) && (
                    <div className="p-6 text-center text-gray-500">
                      신고 내역이 없습니다.
                    </div>
                  )}
                </div>
              )}

              {/* 신고 페이지네이션 */}
              {reportTotalPages > 1 && (
                <div className="bg-white px-4 py-2 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setReportCurrentPage(Math.max(1, reportCurrentPage - 1))
                      }
                      disabled={reportCurrentPage === 1}
                      className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      이전
                    </button>
                    <button
                      onClick={() =>
                        setReportCurrentPage(
                          Math.min(reportTotalPages, reportCurrentPage + 1)
                        )
                      }
                      disabled={reportCurrentPage === reportTotalPages}
                      className="ml-3 relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      다음
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-gray-700">
                        전체 <span className="font-medium">{reportTotal}</span>
                        개 중{" "}
                        <span className="font-medium">
                          {(reportCurrentPage - 1) * reportPageSize + 1}
                        </span>
                        -
                        <span className="font-medium">
                          {Math.min(
                            reportCurrentPage * reportPageSize,
                            reportTotal
                          )}
                        </span>
                        개 표시
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() =>
                            setReportCurrentPage(
                              Math.max(1, reportCurrentPage - 1)
                            )
                          }
                          disabled={reportCurrentPage === 1}
                          className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          이전
                        </button>

                        {[...Array(reportTotalPages)].map((_, index) => {
                          const page = index + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setReportCurrentPage(page)}
                              className={`relative inline-flex items-center px-3 py-1 border text-xs font-medium ${
                                reportCurrentPage === page
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                        <button
                          onClick={() =>
                            setReportCurrentPage(
                              Math.min(reportTotalPages, reportCurrentPage + 1)
                            )
                          }
                          disabled={reportCurrentPage === reportTotalPages}
                          className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          다음
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "권한관리" && (
          <div>
            {/* 상단 섹션: 관리자 명단 + 부여된 권한 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* 관리자 명단 */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <h3 className="text-sm font-medium text-gray-900">
                    관리자 명단
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">직책</p>
                </div>
                <div className="p-4">
                  {authorityLoading ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <p className="mt-2 text-xs text-gray-600">로딩 중...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adminList.slice(0, 7).map((user) => {
                        const userAuthority = authorities.find(
                          (auth) =>
                            // 관리자 권한 인덱스로 찾기 (2 이상이 관리자로 가정)
                            auth.authorityIdx >= 2
                        );
                        return (
                          <div
                            key={user.userIdx}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.userName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {user.userEmail}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-600">
                                관리자
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {adminList.length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-4">
                          관리자가 없습니다.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 부여된 권한 및 액세스 가능 페이지 */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <h3 className="text-sm font-medium text-gray-900">
                    부여된 권한 및 액세스 가능 페이지
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    등록 페이지 모두 수정 가능
                  </p>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {authorities.map((authority) => (
                      <div
                        key={authority.authorityIdx}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {authority.authorityName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {authority.authorityDescription}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">
                            {authorityCounts[authority.authorityIdx] || 0}개
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 권한 관리 테이블 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <h3 className="text-sm font-medium text-gray-900">권한 관리</h3>
                <p className="text-xs text-gray-500 mt-1">
                  권한 부여시 수정해 주세요.
                </p>
              </div>

              {/* 권한 선택 드롭다운 */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    권한별 조회:
                  </label>
                  <select
                    value={selectedAuthority}
                    onChange={(e) => setSelectedAuthority(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">권한을 선택하세요</option>
                    {authorities.map((authority) => (
                      <option
                        key={authority.authorityIdx}
                        value={authority.authorityIdx}
                      >
                        {authority.authorityName}(
                        {authority.authorityDescription})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 로딩 및 에러 상태 */}
              {authorityError && (
                <div className="mx-4 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p className="text-sm">{authorityError}</p>
                </div>
              )}

              {/* 권한 관리 테이블 */}
              {selectedAuthority ? (
                authorityLoading ? (
                  <div className="p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            이름
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            등록일
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            권한
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            STATUS
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {authorityUsers.map((user) => {
                          const isUpdating = updatingUserAuth.has(user.userIdx);
                          return (
                            <tr key={user.userIdx} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.userName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.userEmail}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(user.userJoin)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <select
                                  className="text-sm text-blue-600 bg-transparent border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                  value={selectedAuthority}
                                  onChange={(e) => {
                                    const newAuthorityIdx = parseInt(
                                      e.target.value
                                    );
                                    if (
                                      newAuthorityIdx !==
                                      parseInt(selectedAuthority)
                                    ) {
                                      updateUserAuthority(
                                        user.userIdx,
                                        newAuthorityIdx
                                      );
                                    }
                                  }}
                                  disabled={isUpdating}
                                >
                                  {authorities.map((authority) => (
                                    <option
                                      key={authority.authorityIdx}
                                      value={authority.authorityIdx}
                                    >
                                      {authority.authorityName}
                                    </option>
                                  ))}
                                </select>
                                {isUpdating && (
                                  <div className="inline-block ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  적용
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {authorityUsers.length === 0 && (
                      <div className="p-6 text-center text-gray-500">
                        해당 권한을 가진 사용자가 없습니다.
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="p-6 text-center text-gray-500">
                  권한을 선택하여 사용자 목록을 확인하세요.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;
