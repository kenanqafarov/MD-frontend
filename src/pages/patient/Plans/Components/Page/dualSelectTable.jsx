import React, { useState, useEffect } from "react";
import { Checkbox, Card, Divider, Spin, message } from "antd";
import usePatientPlansControllerStore from '../../../../../../stores/patient-plans-controller';

// insuranceId: yaradılan planın sığorta şirkətinin ID-si (patientId deyil)
const DualSelectTable = ({ insuranceId, onOperationSelect, onCategoryAndOperationSelect, resetSelection = false }) => {
  const { 
    selectedCategoryAndOperationItems, 
    fetchCategoryAndOperationItems, 
    loading 
  } = usePatientPlansControllerStore();

  // 🔹 Seçilənlər
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedAction, setSelectedAction] = useState([]);

  // 🔹 API-dən məlumatları gətir (seçilmiş planın insuranceId-si ilə)
  useEffect(() => {
      // insuranceId null olarsa 0 kimi göndər
      const idToSend = insuranceId == null ? 0 : Number(insuranceId);
      fetchCategoryAndOperationItems(idToSend);
  }, [insuranceId, fetchCategoryAndOperationItems]);

  // 🔹 Seçimləri sıfırla (resetSelection prop dəyişdikdə)
  useEffect(() => {
    if (resetSelection) {
      setSelectedCategory([]);
      setSelectedAction([]);
      if (onOperationSelect) {
        onOperationSelect(null);
      }
      if (onCategoryAndOperationSelect) {
        onCategoryAndOperationSelect(null, null);
      }
    }
  }, [resetSelection, onOperationSelect, onCategoryAndOperationSelect]);

  // 🔹 İlk kateqoriya default aktiv olsun
  useEffect(() => {
    if (selectedCategoryAndOperationItems && selectedCategoryAndOperationItems.length > 0 && !resetSelection) {
      setSelectedCategory([selectedCategoryAndOperationItems[0].id]);
    }
  }, [selectedCategoryAndOperationItems, resetSelection]);

  // 🔹 Seçilmiş kateqoriyaya görə əməliyyatları filtrlə
  const filteredOperations = selectedCategory.length > 0 && selectedCategoryAndOperationItems
    ? selectedCategoryAndOperationItems
        .find(cat => cat.id === selectedCategory[0])
        ?.opTypeItemReadResponses || []
    : [];

  // 🔹 Kateqoriya seçildikdə əməliyyat seçimini təmizlə
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory([categoryId]);
    setSelectedAction([]);
    if (onOperationSelect) {
      onOperationSelect(null);
    }
  };

  // 🔹 Əməliyyat seçildikdə operationCode-u parent-a göndər
  const handleActionChange = (operationId) => {
    setSelectedAction([operationId]);
    const selectedOperation = filteredOperations.find(op => op.id === operationId);
    if (selectedOperation) {
      // operationCode string-dirsə number-a çevir
      const code = selectedOperation.operationCode;
      if (onOperationSelect) {
        onOperationSelect(code ? Number(code) : null);
      }
      // Kateqoriya və əməliyyat ID-lərini göndər
      if (onCategoryAndOperationSelect && selectedCategory.length > 0) {
        onCategoryAndOperationSelect(selectedCategory[0], operationId);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Spin size="large" tip="Yüklənir..." />
      </div>
    );
  }

  if (!selectedCategoryAndOperationItems || selectedCategoryAndOperationItems.length === 0) {
    return (
      <div className="flex justify-center items-center h-[500px] text-gray-500">
        <div className="text-center">
          <p className="text-lg">Məlumat tapılmadı</p>
          <p className="text-sm">Kateqoriya və əməliyyat məlumatı yoxdur</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-0 h-full min-h-[500px]">
      {/* 🔸 Sol tərəf - Kateqoriyalar */}
      <div className="flex-1 border-r border-gray-200 flex flex-col">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-4 border-b border-gray-200">
          <h3 className="m-0 text-base font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Kateqoriyalar
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-white">
          <div className="space-y-2">
            {selectedCategoryAndOperationItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedCategory.includes(item.id)
                    ? 'bg-blue-50 border-2 border-blue-400 shadow-sm'
                    : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
                }`}
                onClick={() => handleCategoryChange(item.id)}
              >
                <Checkbox
                  checked={selectedCategory.includes(item.id)}
                  onChange={() => handleCategoryChange(item.id)}
                  className="w-full"
                >
                  <span className={`text-sm ${selectedCategory.includes(item.id) ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
                    {item.categoryName}
                  </span>
                </Checkbox>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔸 Sağ tərəf - Əməliyyatlar */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-4 border-b border-gray-200">
          <h3 className="m-0 text-base font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Əməliyyatlar ₼
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-white">
          {filteredOperations.length > 0 ? (
            <div className="space-y-2">
              {filteredOperations
                .filter(op => op.status === 'ACTIVE')
                .map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedAction.includes(item.id)
                        ? 'bg-green-50 border-2 border-green-400 shadow-sm'
                        : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
                    }`}
                    onClick={() => handleActionChange(item.id)}
                  >
                    <Checkbox
                      checked={selectedAction.includes(item.id)}
                      onChange={() => handleActionChange(item.id)}
                      className="w-full"
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className={`text-sm ${selectedAction.includes(item.id) ? 'font-semibold text-green-700' : 'text-gray-700'}`}>
                          {item.operationName}
                        </span>
                        {item.price > 0 && (
                          <span className="text-xs text-gray-500 ml-2">
                            {item.price} ₼
                          </span>
                        )}
                      </div>
                    </Checkbox>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-400">
              <p>Kateqoriya seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DualSelectTable;
