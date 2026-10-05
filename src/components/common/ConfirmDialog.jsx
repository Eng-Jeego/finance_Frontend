import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
