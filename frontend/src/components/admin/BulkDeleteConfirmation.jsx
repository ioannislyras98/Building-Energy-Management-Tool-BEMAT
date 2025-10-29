import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";

const BulkDeleteConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  items,
  itemType = "items",
  titleField = "name",
  warningMessage,
}) => {
  const { language } = useLanguage();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const translations =
    language === "en"
      ? english_text.BulkDeleteConfirmation
      : greek_text.BulkDeleteConfirmation;

  const expectedText = "DELETE";
  const isConfirmValid = confirmText.toUpperCase() === expectedText;

  const handleConfirm = async () => {
    if (!isConfirmValid) return;

    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {

    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {translations?.confirmDeletion || "Confirm Deletion"}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {translations?.aboutToDelete ||
                    `You are about to delete ${items.length} ${itemType}.`}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          {warningMessage && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-lg">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{warningMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {translations?.itemsToDelete || `${itemType} to be deleted:`}
            </h4>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
              <ul className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <li key={item.id || index} className="px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {item[titleField] ||
                          `${itemType.slice(0, -1)} ${index + 1}`}
                      </span>
                      {item.id && (
                        <span className="text-xs text-gray-500 font-mono">
                          ID: {item.id}
                        </span>
                      )}
                    </div>
                    {item.email && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.email}
                      </div>
                    )}
                    {item.user && (
                      <div className="text-xs text-gray-500 mt-1">
                        Owner: {item.user.email}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations?.typeDelete || `Type "DELETE" to confirm:`}
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              disabled={isDeleting}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                confirmText && !isConfirmValid
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              } ${isDeleting ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {confirmText && !isConfirmValid && (
              <p className="mt-1 text-sm text-red-600">
                {translations?.mustType || 'You must type "DELETE" exactly'}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isConfirmValid || isDeleting}
              className={`w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm sm:ml-3 sm:w-auto sm:text-sm ${
                isConfirmValid && !isDeleting
                  ? "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  : "bg-gray-400 cursor-not-allowed"
              }`}>
              {isDeleting ? (
                <>
                  <span className="mr-2">⏳</span>
                  {translations?.deleting || "Deleting..."}
                </>
              ) : (
                <>🗑️ {translations?.delete || "Delete"}</>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm ${
                isDeleting ? "cursor-not-allowed opacity-50" : ""
              }`}>
              {translations?.cancel || "Cancel"}
            </button>
          </div>

          {/* Statistics */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              {translations?.totalSelected || "Total selected:"}{" "}
              <strong>{items.length}</strong> {itemType}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkDeleteConfirmation;
