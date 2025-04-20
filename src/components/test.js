import React, { useState } from "react";
import { useForm } from "react-hook-form";

const ShouldUnregisterExample = () => {
  const [showOptionalField, setShowOptionalField] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    // 전역 설정: 모든 필드에 적용
    shouldUnregister: true
  });
  
  const [submittedData, setSubmittedData] = useState(null);
  
  const onSubmit = (data) => {
    console.log("제출된 데이터:", data);
    setSubmittedData(data);
    // shouldUnregister가 true이면, 
    // 숨겨진 필드는 데이터에 포함되지 않음
  };
  
  const watchedValues = watch();
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-bold mb-4">shouldUnregister 예제</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">이름</label>
          <input 
            {...register("name", { required: "이름은 필수입니다" })} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">이메일</label>
          <input 
            {...register("email", { required: "이메일은 필수입니다" })} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <div className="flex items-center">
          <input 
            id="checkbox"
            type="checkbox" 
            checked={showOptionalField}
            onChange={() => setShowOptionalField(!showOptionalField)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="checkbox" className="ml-2 block text-sm text-gray-700">
            추가 정보 입력하기
          </label>
        </div>
        
        {/* 조건부 렌더링되는 필드 */}
        {showOptionalField && (
          <div>
            <label className="block text-sm font-medium text-gray-700">전화번호</label>
            <input 
              {...register("phone")} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}
        
        {/* 개별 필드에 shouldUnregister 적용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">주소</label>
          <input 
            {...register("address", { shouldUnregister: false })} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            이 필드는 shouldUnregister: false로 설정되어 있어 숨겨져도 값이 유지됩니다.
          </p>
        </div>
        
        <button 
          type="submit" 
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          제출
        </button>
      </form>
      
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-2">현재 폼 값 (watch):</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(watchedValues, null, 2)}
        </pre>
      </div>
      
      {submittedData && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">제출된 데이터:</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
        <h3 className="text-sm font-medium text-yellow-800">동작 방식 설명:</h3>
        <ol className="mt-2 text-sm text-yellow-700 list-decimal ml-4 space-y-1">
          <li>폼 전체에 <code>shouldUnregister: true</code> 설정이 적용되어 있습니다.</li>
          <li>체크박스로 "전화번호" 필드를 토글해보세요.</li>
          <li>전화번호 필드가 사라지면 watch 값에서도 제거됩니다.</li>
          <li>주소 필드는 개별적으로 <code>shouldUnregister: false</code>로 설정했습니다.</li>
          <li>폼을 제출하면 현재 표시된 필드만 제출 데이터에 포함됩니다.</li>
        </ol>
      </div>
    </div>
  );
};

export default ShouldUnregisterExample;