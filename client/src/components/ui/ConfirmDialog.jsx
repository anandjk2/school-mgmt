import Modal from './Modal.jsx';

export default function ConfirmDialog({ title = 'Confirm', message, onConfirm, onCancel, loading }) {
  return (
    <Modal title={title} onClose={onCancel} size="sm">
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button className="btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}
