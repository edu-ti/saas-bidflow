import { X } from "lucide-react";

export type ConfirmModalType = "info" | "warning" | "error" | "success";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: ConfirmModalType;
  onConfirm?: () => void;
  confirmText?: string;
  showCancel?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  onConfirm,
  confirmText = "OK",
  showCancel = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    info: "bg-blue-600",
    warning: "bg-yellow-500",
    error: "bg-red-600",
    success: "bg-green-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
        <div className={`${typeStyles[type]} p-4 text-white flex items-center justify-between`}>
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm">{message}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 flex justify-end gap-2">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition"
            >
              Cancelar
            </button>
          )}
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-white text-sm rounded-lg transition ${
                type === "error" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}